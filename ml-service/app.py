from flask import Flask
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import logging
import sys
from config import Config
from api.routes import api_bp
from models.trainer import ModelTrainer

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(api_bp)
    
    # Ensure directories exist
    Config.ensure_directories()
    
    logger.info("ML Service started successfully")
    
    return app

def train_models_job():
    """Background job to retrain models periodically"""
    try:
        logger.info("Starting scheduled model training...")
        trainer = ModelTrainer()
        metrics = trainer.train_all_models()
        logger.info(f"Scheduled training completed. Metrics: {metrics}")
    except Exception as e:
        logger.error(f"Scheduled training failed: {str(e)}")

def setup_scheduler(app):
    """Setup background scheduler for automatic model retraining"""
    scheduler = BackgroundScheduler()
    
    # Schedule training every X hours (configured in Config)
    scheduler.add_job(
        func=train_models_job,
        trigger="interval",
        hours=Config.TRAINING_SCHEDULE_HOURS,
        id='model_training',
        name='Automatic model retraining',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info(f"Scheduler started. Models will retrain every {Config.TRAINING_SCHEDULE_HOURS} hours")
    
    return scheduler

if __name__ == '__main__':
    app = create_app()
    
    # Setup automatic retraining
    scheduler = setup_scheduler(app)
    
    # Run Flask app
    try:
        app.run(
            host=Config.API_HOST,
            port=Config.API_PORT,
            debug=Config.DEBUG
        )
    finally:
        scheduler.shutdown()
