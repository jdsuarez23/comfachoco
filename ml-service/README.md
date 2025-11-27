# 🤖 ML Service - Machine Learning Integration

Sistema de Machine Learning para predicción de aprobación de solicitudes de permiso.

## 📋 Descripción

Este servicio integra 7 modelos de Machine Learning del notebook `Simulador_completo1.ipynb` con la base de datos SQL Server para proporcionar predicciones en tiempo real sobre solicitudes de permiso.

## 🧠 Modelos Implementados

### 1. Naive Bayes - Clasificación de Tipo de Permiso
- **Entrada**: `motivo_texto` (texto libre)
- **Salida**: `tipo_permiso_real` (VACACIONES, MEDICO, CALAMIDAD, etc.)
- **Propósito**: Clasificar automáticamente el tipo de permiso basándose en la descripción

### 2. One-Class SVM - Detección de Anomalías
- **Entrada**: Datos del empleado y solicitud
- **Salida**: `es_anomala` (boolean)
- **Propósito**: Detectar solicitudes atípicas que requieren revisión especial

### 3. Regresión Lineal - Predicción de Impacto
- **Entrada**: Características de la solicitud
- **Salida**: `impacto_area_numerico` (0-100)
- **Propósito**: Estimar el impacto numérico de la ausencia en el área

### 4. Regresión Logística - Probabilidad de Aprobación
- **Entrada**: Datos completos del empleado y solicitud
- **Salida**: `ml_probabilidad_aprobacion` (0.0-1.0)
- **Propósito**: Calcular la probabilidad de que RRHH apruebe la solicitud

### 5. Árbol de Decisión - Decisión Sugerida
- **Entrada**: Todas las características
- **Salida**: `resultado_rrhh` (AUTORIZADO/RECHAZADO/REVISAR)
- **Propósito**: Sugerir una decisión final (RRHH puede modificarla)

### 6. K-Means - Segmentación de Empleados
- **Entrada**: Perfil del empleado
- **Salida**: `segmento_ml` (cluster ID)
- **Propósito**: Agrupar empleados con perfiles similares

### 7. KNN - Sugerencia de Días
- **Entrada**: Historial y características
- **Salida**: `ml_dias_sugeridos` (número de días)
- **Propósito**: Sugerir cuántos días autorizar basándose en casos similares

## 🏗️ Arquitectura

```
ml-service/
├── app.py                  # Aplicación Flask principal
├── config.py               # Configuración y variables de entorno
├── requirements.txt        # Dependencias Python
├── Dockerfile             # Imagen Docker
├── .env.example           # Plantilla de configuración
├── database/
│   ├── __init__.py
│   └── connection.py      # Gestión de conexiones SQL Server
├── models/
│   ├── __init__.py
│   ├── data_loader.py     # Carga de datos desde BD
│   ├── trainer.py         # Entrenamiento de modelos
│   └── predictor.py       # Predicciones en tiempo real
├── api/
│   ├── __init__.py
│   └── routes.py          # Endpoints REST
├── trained_models/        # Modelos .pkl guardados
└── logs/                  # Logs del servicio
```

## 🚀 Instalación

### Opción 1: Local (Desarrollo)

```bash
cd ml-service

# Crear entorno virtual
python -m venv venv
.\\venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
# Crear archivo .env basado en .env.example

# Entrenar modelos inicialmente
python -c "from models.trainer import ModelTrainer; ModelTrainer().train_all_models()"

# Iniciar servicio
python app.py
```

### Opción 2: Docker

```bash
# Desde la raíz del proyecto
docker-compose up ml-service
```

## 📡 API Endpoints

### Health Check
```http
GET /api/ml/health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "ml-service"
}
```

### Estado de Modelos
```http
GET /api/ml/models/status
```

**Respuesta:**
```json
{
  "models_loaded": true,
  "last_training": "2024-01-15T10:30:00",
  "models": {
    "naive_bayes": "loaded",
    "svm": "loaded",
    ...
  }
}
```

### Predicción
```http
POST /api/ml/predict
Content-Type: application/json

{
  "empleado_id": 1,
  "dias_solicitados": 5,
  "motivo_texto": "Vacaciones familiares",
  "fecha_inicio": "2024-12-20",
  "fecha_fin": "2024-12-24"
}
```

**Respuesta:**
```json
{
  "tipo_permiso_real": "VACACIONES",
  "es_anomala": false,
  "impacto_area_numerico": 35.5,
  "ml_probabilidad_aprobacion": 0.8523,
  "probabilidades": {
    "aprobado": 0.85,
    "rechazado": 0.10,
    "revisar": 0.05
  },
  "resultado_rrhh": "AUTORIZADO",
  "segmento_ml": 2,
  "ml_dias_sugeridos": 5
}
```

### Re-entrenar Modelos
```http
POST /api/ml/train
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Models trained successfully",
  "metrics": {
    "naive_bayes_accuracy": 0.89,
    "svm_anomaly_rate": 0.05,
    "regression_r2": 0.76,
    "logistic_accuracy": 0.87,
    "tree_accuracy": 0.84,
    "kmeans_silhouette": 0.62,
    "knn_accuracy": 0.81
  }
}
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DB_SERVER` | Servidor SQL Server | localhost |
| `DB_PORT` | Puerto SQL Server | 1433 |
| `DB_NAME` | Nombre de la base de datos | ComfachocoLeaveDB |
| `DB_USER` | Usuario de BD | sa |
| `DB_PASSWORD` | Contraseña de BD | - |
| `API_PORT` | Puerto del servicio ML | 5000 |
| `API_HOST` | Host del servicio | 0.0.0.0 |
| `DEBUG` | Modo debug | False |
| `TRAINING_SCHEDULE_HOURS` | Horas entre re-entrenamientos | 24 |
| `MIN_TRAINING_SAMPLES` | Mínimo de muestras para entrenar | 100 |
| `LOG_LEVEL` | Nivel de logging | INFO |

## 📊 Proceso de Entrenamiento

### Automático
El servicio re-entrena los modelos automáticamente cada 24 horas (configurable) usando los datos más recientes de la base de datos.

### Manual
```bash
# Desde el backend
curl -X POST http://localhost:8000/api/ml/train

# O desde Python
from models.trainer import ModelTrainer
trainer = ModelTrainer()
metrics = trainer.train_all_models()
print(metrics)
```

## 🗄️ Mapeo de Campos BD

| Campo Notebook | Campo BD | Cálculo |
|----------------|----------|---------|
| `empleado_id` | `empleado_id` | Directo |
| `edad` | `edad` | Directo |
| `area` | `area` | Directo |
| `antiguedad_anios` | Calculado | `DATEDIFF(YEAR, fecha_ingreso, GETDATE())` |
| `dias_ult_ano` | Calculado | `SUM(dias_autorizados)` último año |
| `dias_solicitados` | `dias_solicitados` | Directo |
| `motivo_texto` | `motivo_texto` | Directo |
| `tipo_permiso_real` | `tipo_permiso_real` | Predicho por Naive Bayes |
| `impacto_area` | `impacto_area_numerico` | Predicho por Regresión |
| `resultado_rrhh` | `resultado_rrhh` | Predicho por Árbol (editable) |

## 📈 Métricas y Evaluación

Los modelos se evalúan con las siguientes métricas:

- **Naive Bayes**: Accuracy, Precision, Recall
- **One-Class SVM**: Tasa de anomalías detectadas
- **Regresión Lineal**: R², MAE, RMSE
- **Regresión Logística**: Accuracy, AUC-ROC
- **Árbol de Decisión**: Accuracy, F1-Score
- **K-Means**: Silhouette Score
- **KNN**: Accuracy, Precision

## 🔒 Seguridad

- ✅ Servicio en red privada (no expuesto públicamente)
- ✅ Solo el backend puede comunicarse con ml-service
- ✅ Credenciales de BD en variables de entorno
- ✅ Logs de predicciones para auditoría
- ✅ Validación de entrada en todos los endpoints

## 🐛 Troubleshooting

### Error: "Models not found"
```bash
# Entrenar modelos manualmente
python -c "from models.trainer import ModelTrainer; ModelTrainer().train_all_models()"
```

### Error: "Database connection failed"
- Verificar que SQL Server esté corriendo
- Revisar credenciales en `.env`
- Verificar que la base de datos `ComfachocoLeaveDB` existe

### Error: "Insufficient training data"
- Se necesitan al menos 100 solicitudes históricas
- Ejecutar `database/seed_data.sql` para datos de prueba

## 📝 Logs

Los logs se guardan en:
- **Archivo**: `logs/ml_service.log`
- **Consola**: stdout (para Docker)

Niveles de log:
- `DEBUG`: Información detallada de debugging
- `INFO`: Eventos normales del servicio
- `WARNING`: Advertencias (ej: datos faltantes)
- `ERROR`: Errores que requieren atención

## 🚀 Roadmap

- [x] Fase 1: Integración básica de modelos
- [ ] Fase 2: Re-entrenamiento automático periódico
- [ ] Fase 3: Dashboard de métricas de modelos
- [ ] Fase 4: A/B testing de versiones de modelos
- [ ] Fase 5: Feedback loop con decisiones de RRHH

## 📄 Licencia

Uso interno de Comfachoco.

---

**¿Preguntas?** Revisar logs o contactar al equipo de desarrollo.
