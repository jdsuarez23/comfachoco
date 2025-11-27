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
from sklearn.metrics import (
    precision_recall_fscore_support,
    confusion_matrix,
    roc_auc_score,
    mean_absolute_error,
    mean_squared_error,
    silhouette_score
)

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
        # Text classification models (multi-clase tipo_permiso_real)
        self._train_naive_bayes(df)
        self._train_svm_text(df)
        try:
            self._train_logreg_text(df)
        except Exception as e:
            logger.warning(f"LogReg text training skipped: {e}")

        # Anomaly detection (no split required unsupervised)
        self._train_one_class_svm(df)

        # Regression / classification with business features
        self._train_linear_regression(df)
        self._train_logistic_regression(df)
        self._train_decision_tree(df)

        # Clustering & recommendation
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
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        # Spanish-oriented TF-IDF: with stopwords and wider n-grams
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=20000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_train_vect = vectorizer.fit_transform(X_train)
        X_test_vect = vectorizer.transform(X_test)
        model = MultinomialNB()
        model.fit(X_train_vect, y_train)
        self.models['naive_bayes'] = model
        # Save under both keys for backward compatibility and new usage
        self.models['vectorizer'] = vectorizer
        self.models['tfidf'] = vectorizer
        y_train_pred = model.predict(X_train_vect)
        y_test_pred = model.predict(X_test_vect)
        train_acc = model.score(X_train_vect, y_train)
        test_acc = model.score(X_test_vect, y_test)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_test_pred)
        self.training_metrics.update({
            'naive_bayes_train_accuracy': train_acc,
            'naive_bayes_test_accuracy': test_acc,
            'naive_bayes_test_precision': prec,
            'naive_bayes_test_recall': rec,
            'naive_bayes_test_f1': f1,
            'naive_bayes_test_confusion_matrix': cm.tolist()
        })
        logger.info(f"Naive Bayes (TF-IDF) trained. Acc(train): {train_acc:.4f} Acc(test): {test_acc:.4f} F1(test): {f1:.4f}")

    def _train_svm_text(self, df):
        """Model 1B: Linear SVM with TF-IDF for robust text classification (tipo_permiso_real)"""
        logger.info("Training Linear SVM (TF-IDF) text classifier...")
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=30000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_train_tfidf = vectorizer.fit_transform(X_train)
        X_test_tfidf = vectorizer.transform(X_test)
        svm_clf = LinearSVC()
        svm_clf.fit(X_train_tfidf, y_train)
        self.models['svm_text'] = svm_clf
        # ensure we persist this vectorizer; predictor will prefer tfidf
        self.models['tfidf'] = vectorizer
        y_train_pred = svm_clf.predict(X_train_tfidf)
        y_test_pred = svm_clf.predict(X_test_tfidf)
        train_acc = svm_clf.score(X_train_tfidf, y_train)
        test_acc = svm_clf.score(X_test_tfidf, y_test)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_test_pred)
        self.training_metrics.update({
            'svm_text_train_accuracy': train_acc,
            'svm_text_test_accuracy': test_acc,
            'svm_text_test_precision': prec,
            'svm_text_test_recall': rec,
            'svm_text_test_f1': f1,
            'svm_text_test_confusion_matrix': cm.tolist()
        })
        logger.info(f"Linear SVM trained. Acc(train): {train_acc:.4f} Acc(test): {test_acc:.4f} F1(test): {f1:.4f}")

    def _train_logreg_text(self, df):
        """Model 1C: One-vs-Rest Logistic Regression over TF-IDF for text classification."""
        logger.info("Training One-vs-Rest Logistic Regression text classifier...")
        X = df['motivo_texto'].fillna('')
        y = df['tipo_permiso_real']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        spanish_stopwords = [
            'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo','como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra','él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas','algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os','mío','mía','míos','mías','tuyo','tuya','tuyos','tuyas','suyo','suya','suyos','suyas','nuestro','nuestra','nuestros','nuestras','vuestro','vuestra','vuestros','vuestras','esos','esas'
        ]
        vectorizer = TfidfVectorizer(max_features=30000, ngram_range=(1, 3), sublinear_tf=True, stop_words=spanish_stopwords)
        X_train_tfidf = vectorizer.fit_transform(X_train)
        X_test_tfidf = vectorizer.transform(X_test)
        clf = OneVsRestClassifier(LogisticRegression(max_iter=1000))
        clf.fit(X_train_tfidf, y_train)
        self.models['logreg_text'] = clf
        self.models['tfidf_logreg'] = vectorizer
        y_train_pred = clf.predict(X_train_tfidf)
        y_test_pred = clf.predict(X_test_tfidf)
        train_acc = clf.score(X_train_tfidf, y_train)
        test_acc = clf.score(X_test_tfidf, y_test)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_test_pred)
        self.training_metrics.update({
            'logreg_text_train_accuracy': train_acc,
            'logreg_text_test_accuracy': test_acc,
            'logreg_text_test_precision': prec,
            'logreg_text_test_recall': rec,
            'logreg_text_test_f1': f1,
            'logreg_text_test_confusion_matrix': cm.tolist()
        })
        logger.info(f"LogReg (OvR) trained. Acc(train): {train_acc:.4f} Acc(test): {test_acc:.4f} F1(test): {f1:.4f}")
    
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
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = LinearRegression()
        model.fit(X_train, y_train)
        self.models['regression'] = model
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        r2_train = model.score(X_train, y_train)
        r2_test = model.score(X_test, y_test)
        mae_test = mean_absolute_error(y_test, y_test_pred)
        rmse_test = mean_squared_error(y_test, y_test_pred, squared=False)
        self.training_metrics.update({
            'regression_r2_train': r2_train,
            'regression_r2_test': r2_test,
            'regression_test_mae': mae_test,
            'regression_test_rmse': rmse_test
        })
        logger.info(f"Linear Regression trained. R2(train): {r2_train:.4f} R2(test): {r2_test:.4f} MAE(test): {mae_test:.2f}")
    
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
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        base = LogisticRegression(max_iter=1000, class_weight='balanced')
        base.fit(X_train, y_train)
        # Calibración sobre conjunto de entrenamiento (simple); ideal: usar validación interna
        try:
            calibrated = CalibratedClassifierCV(base_estimator=base, method='sigmoid', cv=3)
            calibrated.fit(X_train, y_train)
            self.models['logistic_calibrated'] = calibrated
            logger.info("Calibrated logistic regression trained (sigmoid, cv=3)")
        except Exception as e:
            logger.warning(f"Calibration skipped: {e}")

        self.models['logistic'] = base
        self.models['label_encoder'] = le

        y_train_pred = base.predict(X_train)
        y_test_pred = base.predict(X_test)
        train_acc = base.score(X_train, y_train)
        test_acc = base.score(X_test, y_test)
        # Probabilidades para ROC-AUC (solo si binario)
        try:
            if len(le.classes_) == 2:
                y_test_proba = base.predict_proba(X_test)[:, list(le.classes_).index('AUTORIZADO')] if 'AUTORIZADO' in le.classes_ else base.predict_proba(X_test)[:,1]
                auc = roc_auc_score(y_test, y_test_proba)
            else:
                auc = None
        except Exception:
            auc = None
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_test_pred).tolist()
        self.training_metrics.update({
            'logistic_train_accuracy': train_acc,
            'logistic_test_accuracy': test_acc,
            'logistic_test_precision': prec,
            'logistic_test_recall': rec,
            'logistic_test_f1': f1,
            'logistic_test_auc': auc,
            'logistic_test_confusion_matrix': cm
        })
        logger.info(f"Logistic Regression trained. Acc(train): {train_acc:.4f} Acc(test): {test_acc:.4f} F1(test): {f1:.4f} AUC(test): {auc if auc is not None else 'n/a'}")
    
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
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        model = DecisionTreeClassifier(max_depth=5, random_state=42)
        model.fit(X_train, y_train)
        self.models['tree'] = model
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        train_acc = model.score(X_train, y_train)
        test_acc = model.score(X_test, y_test)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_test_pred).tolist()
        self.training_metrics.update({
            'tree_train_accuracy': train_acc,
            'tree_test_accuracy': test_acc,
            'tree_test_precision': prec,
            'tree_test_recall': rec,
            'tree_test_f1': f1,
            'tree_test_confusion_matrix': cm
        })
        logger.info(f"Decision Tree trained. Acc(train): {train_acc:.4f} Acc(test): {test_acc:.4f} F1(test): {f1:.4f}")
    
    def _train_kmeans(self, df):
        """Model 6: KMeans for employee segmentation"""
        logger.info("Training KMeans model...")
        
        # Prepare features
        X = df[['edad', 'antiguedad_anios', 'dias_ult_ano']].fillna(0)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        model = KMeans(n_clusters=3, random_state=42, n_init='auto')
        model.fit(X_scaled)
        
        self.models['kmeans'] = model
        self.models['scaler'] = scaler
        
        # Calculate inertia
        self.training_metrics['kmeans_inertia'] = model.inertia_
        try:
            sil = silhouette_score(X_scaled, model.labels_)
        except Exception:
            sil = None
        self.training_metrics['kmeans_silhouette'] = sil
        logger.info(f"KMeans trained. Inertia: {model.inertia_:.4f} Silhouette: {sil if sil is not None else 'n/a'}")
    
    def _train_knn(self, df):
        """Model 7: KNN for dias_solicitados suggestion"""
        logger.info("Training KNN model...")
        
        # Prepare data
        X = df[['dias_ult_ano', 'antiguedad_anios', 'edad']].fillna(0)
        y = df['dias_solicitados']
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        model = KNeighborsRegressor(n_neighbors=5)
        model.fit(X_train, y_train)
        self.models['knn'] = model
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        r2_train = model.score(X_train, y_train)
        r2_test = model.score(X_test, y_test)
        mae_test = mean_absolute_error(y_test, y_test_pred)
        rmse_test = mean_squared_error(y_test, y_test_pred, squared=False)
        self.training_metrics.update({
            'knn_r2_train': r2_train,
            'knn_r2_test': r2_test,
            'knn_test_mae': mae_test,
            'knn_test_rmse': rmse_test
        })
        logger.info(f"KNN trained. R2(train): {r2_train:.4f} R2(test): {r2_test:.4f} MAE(test): {mae_test:.2f}")
    
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
