import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import OneClassSVM, LinearSVC
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.multiclass import OneVsRestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.cluster import KMeans
from sklearn.neighbors import KNeighborsRegressor

from config import Config
from models.data_loader import DataLoader

logger = logging.getLogger(__name__)

class ModelTrainer:
    """Trains all 7 ML models using data from the database"""
    
    def __init__(self):
        self.data_loader = DataLoader()
        self.models = {}
        self.training_metrics = {}
    
    def train_all_models(self):
        """Train all 7 models and save them"""
        logger.info("Starting model training process...")
        
        # Load training data
        df = self.data_loader.load_training_data()
        
        if len(df) < Config.MIN_TRAINING_SAMPLES:
            raise ValueError(
                f"Insufficient training data. Need at least {Config.MIN_TRAINING_SAMPLES} samples, "
                f"but only {len(df)} found."
            )
        
        # Train each model
        self._train_naive_bayes(df)
        self._train_svm_text(df)
        # Optional third text classifier (OvR Logistic Regression)
        try:
            self._train_logreg_text(df)
        except Exception as e:
            logger.warning(f"LogReg text training skipped: {e}")
        self._train_one_class_svm(df)
        self._train_linear_regression(df)
        self._train_logistic_regression(df)
        self._train_decision_tree(df)
        self._train_kmeans(df)
        self._train_knn(df)
        
        # Save all models
        self._save_models()
        
        # Save training metadata
        self._save_training_metadata(df)
        
        logger.info("All models trained and saved successfully")
        return self.training_metrics
    
    def _train_naive_bayes(self, df):
        """Model 1A: Naive Bayes baseline for text classification (tipo_permiso_real)"""
        logger.info("Training Naive Bayes (TF-IDF) model...")
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        # Spanish-oriented TF-IDF: with stopwords and wider n-grams
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_vect = vectorizer.fit_transform(X)
        model = MultinomialNB()
        model.fit(X_vect, y)
        self.models['naive_bayes'] = model
        # Save under both keys for backward compatibility and new usage
        self.models['vectorizer'] = vectorizer
        self.models['tfidf'] = vectorizer
        accuracy = model.score(X_vect, y)
        self.training_metrics['naive_bayes_accuracy'] = accuracy
        logger.info(f"Naive Bayes (TF-IDF) trained. Accuracy: {accuracy:.4f}")

    def _train_svm_text(self, df):
        """Model 1B: Linear SVM with TF-IDF for robust text classification (tipo_permiso_real)"""
        logger.info("Training Linear SVM (TF-IDF) text classifier...")
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=30000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_tfidf = vectorizer.fit_transform(X)
        svm_clf = LinearSVC()
        svm_clf.fit(X_tfidf, y)
        self.models['svm_text'] = svm_clf
        # ensure we persist this vectorizer; predictor will prefer tfidf
        self.models['tfidf'] = vectorizer
        accuracy_svm = svm_clf.score(X_tfidf, y)
        self.training_metrics['svm_text_accuracy'] = accuracy_svm
        logger.info(f"Linear SVM trained. Accuracy: {accuracy_svm:.4f}")

    def _train_logreg_text(self, df):
        """Model 1C: One-vs-Rest Logistic Regression over TF-IDF for text classification."""
        logger.info("Training One-vs-Rest Logistic Regression text classifier...")
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=30000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_tfidf = vectorizer.fit_transform(X)
        clf = OneVsRestClassifier(LogisticRegression(max_iter=1000))
        clf.fit(X_tfidf, y)
        self.models['logreg_text'] = clf
        self.models['tfidf_logreg'] = vectorizer
        accuracy = clf.score(X_tfidf, y)
        self.training_metrics['logreg_text_accuracy'] = accuracy
        logger.info(f"LogReg (OvR) trained. Accuracy: {accuracy:.4f}")
    
    def _train_one_class_svm(self, df):
        """Model 2: One-Class SVM for anomaly detection"""
        logger.info("Training One-Class SVM model...")
        
        # Prepare features
        X = df[['dias_solicitados', 'dias_ult_ano', 'antiguedad_anios']].fillna(0)
        
        # Train model
        model = OneClassSVM(nu=0.1, kernel='rbf', gamma='auto')
        model.fit(X)
        
        self.models['svm'] = model
        
        # Calculate anomaly rate
        predictions = model.predict(X)
        anomaly_rate = (predictions == -1).sum() / len(predictions)
        self.training_metrics['svm_anomaly_rate'] = anomaly_rate
        
        logger.info(f"One-Class SVM trained. Anomaly rate: {anomaly_rate:.4f}")
    
    def _train_linear_regression(self, df):
        """Model 3: Linear Regression for impacto_area prediction"""
        logger.info("Training Linear Regression model...")
        
        # Prepare data - use impacto_area_numerico if available, otherwise calculate
        X = df[['dias_solicitados', 'dias_ult_ano', 'antiguedad_anios']].fillna(0)
        
        # If impacto_area_numerico exists, use it; otherwise calculate from formula
        if 'impacto_area_numerico' in df.columns and not df['impacto_area_numerico'].isna().all():
            y = df['impacto_area_numerico'].fillna(0)
        else:
            # Calculate impacto using the formula from the notebook
            y = (
                df['dias_solicitados'] * np.random.uniform(1.1, 2.3, len(df)) +
                df['dias_ult_ano'] * 0.25 -
                df['antiguedad_anios'] * 0.15
            )
            y = np.clip(y, 0, 100)
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        self.models['regression'] = model
        
        # Calculate R² score
        r2_score = model.score(X, y)
        self.training_metrics['regression_r2'] = r2_score
        
        logger.info(f"Linear Regression trained. R² score: {r2_score:.4f}")
    
    def _train_logistic_regression(self, df):
        """Model 4: Logistic Regression for resultado_rrhh prediction"""
        logger.info("Training Logistic Regression model...")
        
        # Prepare data
        # Calculate impacto if not present, con refuerzo para motivos médicos
        if 'impacto_area_numerico' not in df.columns or df['impacto_area_numerico'].isna().all():
            base = (
                df['dias_solicitados'].fillna(0) * 1.9 +
                df['dias_ult_ano'].fillna(0) * 0.30 -
                df['antiguedad_anios'].fillna(0) * 0.20
            )
            # Refuerzo si el tipo de permiso es ENFERMEDAD
            ref_med = np.where(df['tipo_permiso_real'].fillna('') == 'ENFERMEDAD', 8.0, 0.0)
            impacto = np.clip(base + ref_med, 0, 100)
        else:
            impacto = df['impacto_area_numerico'].fillna(0)

        # Feature engineering adicional
        texto_largo = df['motivo_texto'].fillna('').str.len()
        anomala_bin = (df['es_anomala'].fillna(0) == 1).astype(int)
        vacaciones_bin = (df['tipo_permiso_real'].fillna('') == 'VACACIONES').astype(int)
        enfermedad_bin = (df['tipo_permiso_real'].fillna('') == 'ENFERMEDAD').astype(int)
        sanciones_bin = (df['sanciones_activas'].fillna(0) == 1).astype(int)
        inasistencias = df['inasistencias'].fillna(0).astype(float)
        segmento_ml = df.get('segmento_ml', pd.Series([0]*len(df))).fillna(0).astype(float)

        X = pd.DataFrame({
            'impacto_area': impacto,
            'dias_solicitados': df['dias_solicitados'].fillna(0),
            'antiguedad_anios': df['antiguedad_anios'].fillna(0),
            'dias_ult_ano': df['dias_ult_ano'].fillna(0),
            'texto_largo': texto_largo,
            'anomala_bin': anomala_bin,
            'vacaciones_bin': vacaciones_bin,
            'enfermedad_bin': enfermedad_bin,
            'sanciones_bin': sanciones_bin,
            'inasistencias': inasistencias,
            'segmento_ml': segmento_ml
        })
        
        # Encode labels
        le = LabelEncoder()
        y = le.fit_transform(df['resultado_rrhh'])
        
        # Train model
        base = LogisticRegression(max_iter=1000, class_weight='balanced')
        base.fit(X, y)
        # Calibración para probabilidades mejor comportadas
        try:
            calibrated = CalibratedClassifierCV(base_estimator=base, method='sigmoid', cv=3)
            calibrated.fit(X, y)
            self.models['logistic_calibrated'] = calibrated
            logger.info("Calibrated logistic regression trained (sigmoid, cv=3)")
        except Exception as e:
            logger.warning(f"Calibration skipped: {e}")
        
        self.models['logistic'] = base
        self.models['label_encoder'] = le
        
        # Calculate accuracy
        accuracy = base.score(X, y)
        self.training_metrics['logistic_accuracy'] = accuracy
        
        logger.info(f"Logistic Regression trained. Accuracy: {accuracy:.4f}")
    
    def _train_decision_tree(self, df):
        """Model 5: Decision Tree for resultado_rrhh classification"""
        logger.info("Training Decision Tree model...")
        
        # Same enriched features as logistic regression
        if 'impacto_area_numerico' not in df.columns or df['impacto_area_numerico'].isna().all():
            base = (
                df['dias_solicitados'].fillna(0) * 1.9 +
                df['dias_ult_ano'].fillna(0) * 0.30 -
                df['antiguedad_anios'].fillna(0) * 0.20
            )
            ref_med = np.where(df['tipo_permiso_real'].fillna('') == 'ENFERMEDAD', 8.0, 0.0)
            impacto = np.clip(base + ref_med, 0, 100)
        else:
            impacto = df['impacto_area_numerico'].fillna(0)

        texto_largo = df['motivo_texto'].fillna('').str.len()
        anomala_bin = (df['es_anomala'].fillna(0) == 1).astype(int)
        vacaciones_bin = (df['tipo_permiso_real'].fillna('') == 'VACACIONES').astype(int)
        enfermedad_bin = (df['tipo_permiso_real'].fillna('') == 'ENFERMEDAD').astype(int)

        X = pd.DataFrame({
            'impacto_area': impacto,
            'dias_solicitados': df['dias_solicitados'].fillna(0),
            'antiguedad_anios': df['antiguedad_anios'].fillna(0),
            'dias_ult_ano': df['dias_ult_ano'].fillna(0),
            'texto_largo': texto_largo,
            'anomala_bin': anomala_bin,
            'vacaciones_bin': vacaciones_bin,
            'enfermedad_bin': enfermedad_bin
        })
        
        # Use the same label encoder
        y = self.models['label_encoder'].transform(df['resultado_rrhh'])
        
        # Train model
        model = DecisionTreeClassifier(max_depth=5, random_state=42)
        model.fit(X, y)
        
        self.models['tree'] = model
        
        # Calculate accuracy
        accuracy = model.score(X, y)
        self.training_metrics['tree_accuracy'] = accuracy
        
        logger.info(f"Decision Tree trained. Accuracy: {accuracy:.4f}")
    
    def _train_kmeans(self, df):
        """Model 6: KMeans for employee segmentation"""
        logger.info("Training KMeans model...")
        
        # Prepare features
        X = df[['edad', 'antiguedad_anios', 'dias_ult_ano']].fillna(0)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        model = KMeans(n_clusters=3, random_state=42)
        model.fit(X_scaled)
        
        self.models['kmeans'] = model
        self.models['scaler'] = scaler
        
        # Calculate inertia
        self.training_metrics['kmeans_inertia'] = model.inertia_
        
        logger.info(f"KMeans trained. Inertia: {model.inertia_:.4f}")
    
    def _train_knn(self, df):
        """Model 7: KNN for dias_solicitados suggestion"""
        logger.info("Training KNN model...")
        
        # Prepare data
        X = df[['dias_ult_ano', 'antiguedad_anios', 'edad']].fillna(0)
        y = df['dias_solicitados']
        
        # Train model
        model = KNeighborsRegressor(n_neighbors=5)
        model.fit(X, y)
        
        self.models['knn'] = model
        
        # Calculate R² score
        r2_score = model.score(X, y)
        self.training_metrics['knn_r2'] = r2_score
        
        logger.info(f"KNN trained. R² score: {r2_score:.4f}")
    
    def _save_models(self):
        """Save all trained models to disk"""
        Config.ensure_directories()
        
        for model_name, model_path in Config.MODEL_PATHS.items():
            if model_name in self.models:
                joblib.dump(self.models[model_name], model_path)
                logger.info(f"Saved {model_name} to {model_path}")
    
    def _save_training_metadata(self, df):
        """Save training metadata (date, sample count, metrics)"""
        metadata = {
            'training_date': datetime.now().isoformat(),
            'sample_count': len(df),
            'metrics': self.training_metrics
        }
        
        metadata_path = os.path.join(Config.MODELS_DIR, 'training_metadata.pkl')
        joblib.dump(metadata, metadata_path)
        logger.info(f"Saved training metadata to {metadata_path}")

import os
