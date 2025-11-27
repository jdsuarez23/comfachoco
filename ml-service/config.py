import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database Configuration
    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '1433')
    DB_NAME = os.getenv('DB_NAME', 'ComfachocoLeaveDB')
    DB_USER = os.getenv('DB_USER', 'sa')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Jdsuarez23')
    
    # Connection String
    DB_CONNECTION_STRING = (
        f'DRIVER={{ODBC Driver 17 for SQL Server}};'
        f'SERVER={DB_SERVER},{DB_PORT};'
        f'DATABASE={DB_NAME};'
        f'UID={DB_USER};'
        f'PWD={DB_PASSWORD}'
    )
    
    # ML Models Configuration
    MODELS_DIR = os.path.join(os.path.dirname(__file__), 'trained_models')
    
    # Model file paths
    MODEL_PATHS = {
        'naive_bayes': os.path.join(MODELS_DIR, 'modelo_nb.pkl'),
        'vectorizer': os.path.join(MODELS_DIR, 'vectorizer.pkl'),
        'tfidf': os.path.join(MODELS_DIR, 'tfidf.pkl'),
        'svm_text': os.path.join(MODELS_DIR, 'modelo_svm_text.pkl'),
        'logreg_text': os.path.join(MODELS_DIR, 'modelo_logreg_text.pkl'),
        'tfidf_logreg': os.path.join(MODELS_DIR, 'tfidf_logreg.pkl'),
        'svm': os.path.join(MODELS_DIR, 'modelo_svm.pkl'),
        'regression': os.path.join(MODELS_DIR, 'modelo_regresion.pkl'),
        'logistic': os.path.join(MODELS_DIR, 'modelo_log.pkl'),
        'logistic_calibrated': os.path.join(MODELS_DIR, 'modelo_log_calibrado.pkl'),
        'label_encoder': os.path.join(MODELS_DIR, 'label_rrhh.pkl'),
        'tree': os.path.join(MODELS_DIR, 'modelo_tree.pkl'),
        'kmeans': os.path.join(MODELS_DIR, 'modelo_kmeans.pkl'),
        'scaler': os.path.join(MODELS_DIR, 'scaler.pkl'),
        'knn': os.path.join(MODELS_DIR, 'modelo_knn.pkl')
    }
    
    # Training Configuration
    TRAINING_SCHEDULE_HOURS = int(os.getenv('TRAINING_SCHEDULE_HOURS', '24'))  # Retrain every 24 hours
    MIN_TRAINING_SAMPLES = int(os.getenv('MIN_TRAINING_SAMPLES', '100'))  # Minimum samples needed for training
    
    # API Configuration
    API_PORT = int(os.getenv('API_PORT', '8000'))
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.path.join(os.path.dirname(__file__), 'logs', 'ml_service.log')
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist"""
        os.makedirs(cls.MODELS_DIR, exist_ok=True)
        os.makedirs(os.path.dirname(cls.LOG_FILE), exist_ok=True)
