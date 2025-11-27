import numpy as np
import joblib
import logging
import os
from config import Config
from models.data_loader import DataLoader

logger = logging.getLogger(__name__)

class ModelPredictor:
    """Makes predictions using trained ML models"""
    
    def __init__(self):
        self.models = {}
        self.data_loader = DataLoader()
        self._load_models()
    
    def _load_models(self):
        """Load all trained models from disk"""
        try:
            for model_name, model_path in Config.MODEL_PATHS.items():
                if os.path.exists(model_path):
                    self.models[model_name] = joblib.load(model_path)
                    logger.info(f"Loaded {model_name} from {model_path}")
                else:
                    logger.warning(f"Model file not found: {model_path}")
            
            if not self.models:
                raise FileNotFoundError("No trained models found. Please train models first.")
                
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            raise
    
    def predict(self, request_data):
        """
        Make predictions for a new leave request
        
        Args:
            request_data: dict with keys:
                - empleado_id: int
                - dias_solicitados: int
                - motivo_texto: str
                - fecha_inicio: date
                - fecha_fin: date
        
        Returns:
            dict with all predictions
        """
        try:
            # Prepare data
            data = self.data_loader.prepare_prediction_data(request_data)
            
            # Model 1: Naive Bayes - Classify tipo_permiso
            tipo_permiso = self._predict_tipo_permiso(data['motivo_texto'])
            
            # Model 2: One-Class SVM - Detect anomalies
            es_anomala = self._detect_anomaly(data)
            
            # Model 3: Linear Regression - Predict impacto_area
            impacto_area = self._predict_impacto(data)
            
            # Model 4: Logistic Regression - Predict probabilities
            probabilidades = self._predict_probabilities(data, impacto_area)
            
            # Model 5: Decision Tree - Final decision
            decision_final = self._predict_decision(data, impacto_area)
            
            # Model 6: KMeans - Employee segment
            segmento = self._predict_segment(data)
            
            # Model 7: KNN - Suggest days
            dias_sugeridos = self._suggest_days(data)
            
            # Compile results
            predictions = {
                'tipo_permiso_real': str(tipo_permiso),
                'es_anomala': bool(es_anomala),
                'impacto_area_numerico': float(round(impacto_area, 2)),
                'ml_probabilidad_aprobacion': float(round(probabilidades['prob_aprobado'], 4)),
                'probabilidades': {
                    'aprobado': float(round(probabilidades['prob_aprobado'], 4)),
                    'rechazado': float(round(probabilidades['prob_rechazado'], 4)),
                    'revisar': float(round(probabilidades['prob_revisar'], 4))
                },
                'resultado_rrhh': str(decision_final),
                'segmento_ml': int(segmento),
                'ml_dias_sugeridos': int(dias_sugeridos)
            }
            
            logger.info(f"Predictions made for employee {data['empleado_id']}")
            return predictions
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise
    
    def _predict_tipo_permiso(self, motivo_texto):
        """Model 1: Classify leave type from text"""
        vectorizer = self.models['vectorizer']
        model = self.models['naive_bayes']
        
        motivo_vect = vectorizer.transform([motivo_texto])
        tipo_predicho = model.predict(motivo_vect)[0]
        
        return tipo_predicho
    
    def _detect_anomaly(self, data):
        """Model 2: Detect if request is anomalous"""
        model = self.models['svm']
        
        X = np.array([[
            data['dias_solicitados'],
            data['dias_ult_ano'],
            data['antiguedad_anios']
        ]])
        
        prediction = model.predict(X)[0]
        return prediction == -1  # -1 means anomaly
    
    def _predict_impacto(self, data):
        """Model 3: Predict impact on area"""
        model = self.models['regression']
        
        X = np.array([[
            data['dias_solicitados'],
            data['dias_ult_ano'],
            data['antiguedad_anios']
        ]])
        
        impacto = model.predict(X)[0]
        return np.clip(impacto, 0, 100)
    
    def _predict_probabilities(self, data, impacto_area):
        """Model 4: Predict approval probabilities"""
        model = self.models['logistic']
        le = self.models['label_encoder']
        
        X = np.array([[
            impacto_area,
            data['dias_solicitados'],
            data['antiguedad_anios']
        ]])
        
        proba = model.predict_proba(X)[0]
        
        # Map probabilities to labels
        classes = le.classes_
        prob_dict = {}
        
        for i, clase in enumerate(classes):
            if clase == 'AUTORIZADO':
                prob_dict['prob_aprobado'] = proba[i]
            elif clase == 'RECHAZADO':
                prob_dict['prob_rechazado'] = proba[i]
            else:  # PENDIENTE or other
                prob_dict['prob_revisar'] = proba[i]
        
        # Ensure all keys exist
        prob_dict.setdefault('prob_aprobado', 0.0)
        prob_dict.setdefault('prob_rechazado', 0.0)
        prob_dict.setdefault('prob_revisar', 0.0)
        
        return prob_dict
    
    def _predict_decision(self, data, impacto_area):
        """Model 5: Predict final decision"""
        model = self.models['tree']
        le = self.models['label_encoder']
        
        X = np.array([[
            impacto_area,
            data['dias_solicitados'],
            data['antiguedad_anios']
        ]])
        
        prediction = model.predict(X)[0]
        decision = le.inverse_transform([prediction])[0]
        
        return decision
    
    def _predict_segment(self, data):
        """Model 6: Predict employee segment"""
        model = self.models['kmeans']
        scaler = self.models['scaler']
        
        X = np.array([[
            data['edad'],
            data['antiguedad_anios'],
            data['dias_ult_ano']
        ]])
        
        X_scaled = scaler.transform(X)
        cluster = model.predict(X_scaled)[0]
        
        return cluster
    
    def _suggest_days(self, data):
        """Model 7: Suggest number of days"""
        model = self.models['knn']
        
        X = np.array([[
            data['dias_ult_ano'],
            data['antiguedad_anios'],
            data['edad']
        ]])
        
        dias_sugeridos = model.predict(X)[0]
        return max(1, int(round(dias_sugeridos)))  # At least 1 day
    
    def get_model_status(self):
        """Get status of loaded models"""
        metadata_path = os.path.join(Config.MODELS_DIR, 'training_metadata.pkl')
        
        status = {
            'models_loaded': list(self.models.keys()),
            'models_count': len(self.models)
        }
        
        if os.path.exists(metadata_path):
            metadata = joblib.load(metadata_path)
            status['last_training'] = metadata.get('training_date')
            status['training_samples'] = metadata.get('sample_count')
            status['metrics'] = metadata.get('metrics')
        
        return status
