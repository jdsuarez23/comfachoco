"""
Pydantic Models for ML Prediction Service
Request and response validation schemas
"""

from pydantic import BaseModel, Field
from typing import Optional


class PredictionRequest(BaseModel):
    """
    Request model for leave approval prediction
    All features required for ML model
    """
    edad: int = Field(..., ge=18, le=100, description="Employee age")
    genero: str = Field(..., description="Gender (M/F)")
    estado_civil: str = Field(..., description="Marital status")
    numero_hijos: int = Field(..., ge=0, description="Number of children")
    area: str = Field(..., description="Department/Area")
    cargo: str = Field(..., description="Job position")
    antiguedad_anios: int = Field(..., ge=0, description="Years of service")
    salario: float = Field(..., gt=0, description="Salary")
    tipo_contrato: str = Field(..., description="Contract type")
    sede: str = Field(..., description="Office location")
    dias_ult_ano: int = Field(..., ge=0, description="Days taken last year")
    dias_solicitados: int = Field(..., ge=1, description="Days requested")
    tipo_permiso_real: str = Field(..., description="Leave type")
    impacto_area: str = Field(..., description="Area impact (BAJO/MEDIO/ALTO)")
    sanciones_activas: int = Field(..., ge=0, le=1, description="Active sanctions (0/1)")
    inasistencias: int = Field(..., ge=0, description="Number of absences")

    class Config:
        json_schema_extra = {
            "example": {
                "edad": 32,
                "genero": "M",
                "estado_civil": "SOLTERO",
                "numero_hijos": 0,
                "area": "TECNOLOGIA",
                "cargo": "DESARROLLADOR SENIOR",
                "antiguedad_anios": 6,
                "salario": 6500000.0,
                "tipo_contrato": "INDEFINIDO",
                "sede": "SEDE PRINCIPAL",
                "dias_ult_ano": 10,
                "dias_solicitados": 5,
                "tipo_permiso_real": "VACACIONES",
                "impacto_area": "BAJO",
                "sanciones_activas": 0,
                "inasistencias": 1
            }
        }


class PredictionResponse(BaseModel):
    """
    Response model for prediction
    """
    probabilidad_aprobacion: float = Field(..., ge=0.0, le=1.0, description="Approval probability (0-1)")
    confianza: str = Field(..., description="Confidence level")
    mensaje: str = Field(..., description="Human-readable message")

    class Config:
        json_schema_extra = {
            "example": {
                "probabilidad_aprobacion": 0.8750,
                "confianza": "ALTA",
                "mensaje": "Alta probabilidad de aprobación"
            }
        }


class HealthResponse(BaseModel):
    """
    Health check response
    """
    status: str
    model_loaded: bool
    timestamp: str
