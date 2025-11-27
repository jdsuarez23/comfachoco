import pandas as pd
import numpy as np
import joblib
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import OneClassSVM
from sklearn.linear_model import LinearRegression, LogisticRegression
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
        """Model 1: Naive Bayes for text classification (tipo_permiso_real)"""
        logger.info("Training Naive Bayes model...")
        
        # Prepare data
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        
        # Vectorize text
        vectorizer = CountVectorizer(max_features=100)
        X_vect = vectorizer.fit_transform(X)
        
        # Train model
        model = MultinomialNB()
        model.fit(X_vect, y)
        
        # Store models
        self.models['naive_bayes'] = model
        self.models['vectorizer'] = vectorizer
        
        # Calculate accuracy
        accuracy = model.score(X_vect, y)
        self.training_metrics['naive_bayes_accuracy'] = accuracy
        
        logger.info(f"Naive Bayes trained. Accuracy: {accuracy:.4f}")
    
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
        # Calculate impacto if not present
        if 'impacto_area_numerico' not in df.columns or df['impacto_area_numerico'].isna().all():
            impacto = (
                df['dias_solicitados'] * 1.7 +
                df['dias_ult_ano'] * 0.25 -
                df['antiguedad_anios'] * 0.15
            )
            impacto = np.clip(impacto, 0, 100)
        else:
            impacto = df['impacto_area_numerico'].fillna(0)
        
        X = pd.DataFrame({
            'impacto_area': impacto,
            'dias_solicitados': df['dias_solicitados'].fillna(0),
            'antiguedad_anios': df['antiguedad_anios'].fillna(0)
        })
        
        # Encode labels
        le = LabelEncoder()
        y = le.fit_transform(df['resultado_rrhh'])
        
        # Train model
        model = LogisticRegression(max_iter=1000)
        model.fit(X, y)
        
        self.models['logistic'] = model
        self.models['label_encoder'] = le
        
        # Calculate accuracy
        accuracy = model.score(X, y)
        self.training_metrics['logistic_accuracy'] = accuracy
        
        logger.info(f"Logistic Regression trained. Accuracy: {accuracy:.4f}")
    
    def _train_decision_tree(self, df):
        """Model 5: Decision Tree for resultado_rrhh classification"""
        logger.info("Training Decision Tree model...")
        
        # Use same features as logistic regression
        if 'impacto_area_numerico' not in df.columns or df['impacto_area_numerico'].isna().all():
            impacto = (
                df['dias_solicitados'] * 1.7 +
                df['dias_ult_ano'] * 0.25 -
                df['antiguedad_anios'] * 0.15
            )
            impacto = np.clip(impacto, 0, 100)
        else:
            impacto = df['impacto_area_numerico'].fillna(0)
        
        X = pd.DataFrame({
            'impacto_area': impacto,
            'dias_solicitados': df['dias_solicitados'].fillna(0),
            'antiguedad_anios': df['antiguedad_anios'].fillna(0)
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
