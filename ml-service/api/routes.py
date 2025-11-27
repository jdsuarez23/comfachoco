from flask import Blueprint, request, jsonify
import logging
from models.trainer import ModelTrainer
from models.predictor import ModelPredictor

logger = logging.getLogger(__name__)

# Create blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api/ml')

# Initialize predictor (will be loaded on first request)
predictor = None

def get_predictor():
    """Lazy load predictor"""
    global predictor
    if predictor is None:
        predictor = ModelPredictor()
    return predictor

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ml-service'
    }), 200

@api_bp.route('/models/status', methods=['GET'])
def models_status():
    """Get status of loaded models"""
    try:
        pred = get_predictor()
        status = pred.get_model_status()
        return jsonify(status), 200
    except Exception as e:
        logger.error(f"Failed to get model status: {str(e)}")
        return jsonify({
            'error': 'Failed to get model status',
            'message': str(e)
        }), 500

@api_bp.route('/predict', methods=['POST'])
def predict():
    """
    Make predictions for a new leave request
    
    Request body:
    {
        "empleado_id": int,
        "dias_solicitados": int,
        "motivo_texto": str,
        "fecha_inicio": str (YYYY-MM-DD),
        "fecha_fin": str (YYYY-MM-DD)
    }
    
    Response:
    {
        "tipo_permiso_real": str,
        "es_anomala": bool,
        "impacto_area_numerico": float,
        "ml_probabilidad_aprobacion": float,
        "probabilidades": {
            "aprobado": float,
            "rechazado": float,
            "revisar": float
        },
        "resultado_rrhh": str,
        "segmento_ml": int,
        "ml_dias_sugeridos": int
    }
    """
    try:
        # Validate request
        data = request.get_json()
        
        required_fields = ['empleado_id', 'dias_solicitados', 'motivo_texto']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Make prediction
        pred = get_predictor()
        predictions = pred.predict(data)
        
        # Convert numpy types to Python native types for JSON serialization
        def numpy_to_python(obj):
            """Convert numpy types to Python native types"""
            import numpy as np
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {key: numpy_to_python(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [numpy_to_python(item) for item in obj]
            else:
                return obj
        
        predictions = numpy_to_python(predictions)
        
        return jsonify(predictions), 200
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return jsonify({
            'error': 'Validation error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@api_bp.route('/train', methods=['POST'])
def train_models():
    """
    Train/retrain all ML models with current database data
    
    Response:
    {
        "status": "success",
        "metrics": {
            "naive_bayes_accuracy": float,
            "svm_anomaly_rate": float,
            ...
        }
    }
    """
    try:
        logger.info("Starting model training...")
        
        trainer = ModelTrainer()
        metrics = trainer.train_all_models()
        
        # Reload predictor with new models
        global predictor
        predictor = None  # Force reload on next prediction
        
        return jsonify({
            'status': 'success',
            'message': 'Models trained successfully',
            'metrics': metrics
        }), 200
        
    except ValueError as e:
        logger.error(f"Training validation error: {str(e)}")
        return jsonify({
            'error': 'Training validation error',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        return jsonify({
            'error': 'Training failed',
            'message': str(e)
        }), 500
