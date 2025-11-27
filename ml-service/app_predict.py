"""
FastAPI Prediction Service
ML-based leave approval probability prediction
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os
from models import PredictionRequest, PredictionResponse, HealthResponse

# Initialize FastAPI app
app = FastAPI(
    title="Leave Approval Prediction Service",
    description="ML service for predicting leave request approval probability",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and encoders
model = None
label_encoders = None


def load_model_artifacts():
    """
    Load trained model and label encoders
    """
    global model, label_encoders
    
    try:
        if os.path.exists('model.pkl') and os.path.exists('label_encoders.pkl'):
            model = joblib.load('model.pkl')
            label_encoders = joblib.load('label_encoders.pkl')
            print("✓ Model and encoders loaded successfully")
            return True
        else:
            print("⚠ Model files not found. Please run train.py first.")
            return False
    except Exception as e:
        print(f"✗ Error loading model: {e}")
        return False


# Load model on startup
@app.on_event("startup")
async def startup_event():
    """
    Load model when service starts
    """
    print("=" * 60)
    print("Starting ML Prediction Service...")
    print("=" * 60)
    load_model_artifacts()


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with service information
    """
    return {
        "service": "Leave Approval Prediction Service",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None,
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(request: PredictionRequest):
    """
    Predict leave approval probability
    
    Returns probability between 0 and 1:
    - 0.0 = Very unlikely to be approved
    - 1.0 = Very likely to be approved
    """
    if model is None or label_encoders is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train the model first by running train.py"
        )
    
    try:
        # Convert request to DataFrame
        data = pd.DataFrame([request.dict()])
        
        # Preprocess features
        categorical_cols = ['genero', 'estado_civil', 'area', 'cargo', 'tipo_contrato', 
                           'sede', 'tipo_permiso_real', 'impacto_area']
        
        for col in categorical_cols:
            if col in label_encoders:
                le = label_encoders[col]
                value = str(data[col].iloc[0])
                
                # Handle unknown categories
                if value in le.classes_:
                    data[col] = le.transform([value])[0]
                else:
                    # Use most common class for unknown values
                    data[col] = 0
                    print(f"⚠ Unknown value '{value}' for {col}, using default")
        
        # Make prediction
        probability = model.predict_proba(data)[0][1]  # Probability of approval (class 1)
        
        # Determine confidence level
        if probability >= 0.8:
            confianza = "ALTA"
            mensaje = "Alta probabilidad de aprobación"
        elif probability >= 0.6:
            confianza = "MEDIA-ALTA"
            mensaje = "Buena probabilidad de aprobación"
        elif probability >= 0.4:
            confianza = "MEDIA"
            mensaje = "Probabilidad moderada de aprobación"
        elif probability >= 0.2:
            confianza = "MEDIA-BAJA"
            mensaje = "Baja probabilidad de aprobación"
        else:
            confianza = "BAJA"
            mensaje = "Muy baja probabilidad de aprobación"
        
        # Log prediction
        print(f"📊 Prediction: {probability:.4f} ({confianza}) - {request.tipo_permiso_real}, {request.dias_solicitados} días")
        
        return {
            "probabilidad_aprobacion": round(probability, 4),
            "confianza": confianza,
            "mensaje": mensaje
        }
        
    except Exception as e:
        print(f"✗ Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error making prediction: {str(e)}"
        )


@app.post("/reload-model", tags=["Admin"])
async def reload_model():
    """
    Reload model from disk (useful after retraining)
    """
    success = load_model_artifacts()
    
    if success:
        return {
            "success": True,
            "message": "Model reloaded successfully"
        }
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to reload model"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("\n" + "=" * 60)
    print("Starting FastAPI ML Prediction Service")
    print("=" * 60)
    print("Server will run on: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
