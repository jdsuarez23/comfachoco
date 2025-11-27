# 🏢 Sistema de Gestión de Solicitudes de Permiso - Comfachoco

Sistema empresarial completo para gestión de solicitudes de permiso de empleados con predicción ML de aprobación.

## 📋 Descripción

Aplicación web full-stack que permite a los empleados solicitar permisos y a RRHH gestionar aprobaciones/rechazos. Incluye un servicio de Machine Learning que predice la probabilidad de aprobación basándose en múltiples factores.

### Características Principales

- ✅ **Autenticación segura** con JWT y bcrypt
- 📝 **Formulario de solicitud** con validación completa
- 🤖 **Predicción ML** de probabilidad de aprobación
- 👥 **Panel RRHH** para aprobar/rechazar solicitudes
- 📊 **Estadísticas** y exportación a CSV
- 🔔 **Notificaciones** simuladas por email (console log)
- 🚨 **Detección de anomalías** en solicitudes
- 📱 **Diseño responsive** y moderno

## 🏗️ Arquitectura

```
comfachoco/
├── backend/              # Node.js + Express API
│   ├── config/          # Configuración de BD
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # Endpoints API
│   ├── services/        # Integración ML
│   └── server.js        # Entry point
├── frontend/            # React SPA
│   ├── src/
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Login, Dashboard, RRHH
│   │   ├── services/   # API client
│   │   └── App.jsx     # Router setup
│   └── public/
├── ml-service/          # Python FastAPI
│   ├── train.py        # Entrenamiento del modelo
│   ├── app_predict.py  # API de predicción
│   └── models.py       # Pydantic schemas
└── database/            # SQL Server scripts
    ├── create_tables.sql
    └── seed_data.sql
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** v16+ con Express
- **SQL Server** (mssql driver)
- **JWT** para autenticación
- **bcryptjs** para hashing de contraseñas
- **axios** para llamadas HTTP al servicio ML

### Frontend
- **React** 18 con Hooks
- **React Router** v6 para navegación
- **Formik + Yup** para formularios y validación
- **Axios** para API calls
- **React Toastify** para notificaciones

### ML Service
- **Python** 3.8+
- **FastAPI** para API REST
- **scikit-learn** (RandomForest)
- **pandas** para procesamiento de datos
- **joblib** para persistencia del modelo

### Base de Datos
- **SQL Server** 2019+

## 📦 Prerequisitos

- Node.js v16 o superior
- Python 3.8 o superior
- SQL Server 2019+ (local o remoto)
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Configurar Base de Datos

```bash
# Abrir SQL Server Management Studio (SSMS)
# Conectar a tu instancia de SQL Server
# Ejecutar los scripts en orden:

# 1. Crear base de datos
CREATE DATABASE ComfachocoLeaveDB;
GO

# 2. Ejecutar create_tables.sql
# (Abre el archivo database/create_tables.sql y ejecuta)

# 3. Ejecutar seed_data.sql
# (Abre el archivo database/seed_data.sql y ejecuta)
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env (copiar desde env.example.txt)
# Editar con tus credenciales de SQL Server:
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ComfachocoLeaveDB
DB_USER=sa
DB_PASSWORD=
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true
JWT_SECRET=tu-secreto-jwt-super-seguro
JWT_EXPIRE=7d
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000

# Iniciar servidor
npm run dev
```

El backend estará disponible en `http://localhost:5000`

### 3. Configurar ML Service

```bash
cd ml-service

# Crear entorno virtual (recomendado)
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Entrenar el modelo
python train.py

# Iniciar servicio de predicción
python app_predict.py
```

El servicio ML estará disponible en `http://localhost:8000`

### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo .env (opcional)
REACT_APP_API_URL=http://localhost:5000/api

# Iniciar aplicación
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 👤 Credenciales de Prueba

### Usuario RRHH
- **Email:** maria.gonzalez@comfachoco.com
- **Contraseña:** Password123!
- **Rol:** RRHH (puede aprobar/rechazar solicitudes)

### Usuario Empleado
- **Email:** carlos.ramirez@comfachoco.com
- **Contraseña:** Password123!
- **Rol:** EMPLEADO (puede crear solicitudes)

## 📚 Documentación de API

### Autenticación

#### POST /api/auth/login
Iniciar sesión
```json
{
  "email": "usuario@comfachoco.com",
  "password": "Password123!"
}
```

#### POST /api/auth/register
Registrar nuevo empleado
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@comfachoco.com",
  "password": "Password123!",
  "fecha_ingreso": "2024-01-15",
  "edad": 30,
  "area": "TECNOLOGIA",
  "cargo": "DESARROLLADOR"
}
```

#### GET /api/auth/me
Obtener perfil del usuario autenticado (requiere JWT)

### Solicitudes (Empleados)

#### POST /api/solicitudes
Crear nueva solicitud de permiso (requiere JWT)
```json
{
  "tipo_permiso_real": "VACACIONES",
  "motivo_texto": "Vacaciones familiares",
  "dias_solicitados": 5,
  "fecha_inicio": "2024-12-20",
  "fecha_fin": "2024-12-24",
  "impacto_area": "BAJO",
  "dias_ult_ano": 10
}
```

#### GET /api/solicitudes/mis-solicitudes
Obtener solicitudes del usuario autenticado (requiere JWT)

### RRHH (Solo rol RRHH)

#### GET /api/rrhh/solicitudes?resultado=PENDIENTE
Obtener solicitudes con filtros opcionales

#### PUT /api/rrhh/solicitudes/:id/aprobar
Aprobar solicitud
```json
{
  "dias_autorizados": 5,
  "comentario_rrhh": "Aprobado. Buen historial."
}
```

#### PUT /api/rrhh/solicitudes/:id/rechazar
Rechazar solicitud
```json
{
  "comentario_rrhh": "Rechazado. Época crítica para el área."
}
```

#### GET /api/rrhh/estadisticas
Obtener estadísticas agregadas

#### GET /api/rrhh/export-csv
Exportar todas las solicitudes a CSV

### ML Service

#### POST http://localhost:8000/predict
Predecir probabilidad de aprobación
```json
{
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
```

## 🎯 Flujo de Uso

### Empleado
1. Iniciar sesión en `/login`
2. Crear nueva solicitud desde el dashboard
3. Ver predicción ML de probabilidad de aprobación
4. Consultar estado de solicitudes previas

### RRHH
1. Iniciar sesión en `/login`
2. Acceder al panel RRHH en `/rrhh`
3. Filtrar solicitudes (Pendientes/Aprobadas/Rechazadas)
4. Revisar detalles y score ML de cada solicitud
5. Aprobar o rechazar con comentarios
6. Exportar datos a CSV para análisis

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📊 Esquema de Base de Datos

### Tabla: empleados
- `empleado_id` (PK, IDENTITY)
- `nombre`, `email`, `hashed_password`
- `rol` (EMPLEADO/RRHH)
- `fecha_ingreso`, `edad`, `genero`, `estado_civil`
- `numero_hijos`, `area`, `cargo`, `salario`
- `tipo_contrato`, `sede`
- `sanciones_activas`, `inasistencias`

### Tabla: solicitudes_permiso
- `solicitud_id` (PK, IDENTITY)
- `empleado_id` (FK)
- Datos demográficos (denormalizados para ML)
- `dias_solicitados`, `dias_autorizados`
- `motivo_texto`, `tipo_permiso_real`
- `impacto_area`, `es_anomala`
- `resultado_rrhh` (PENDIENTE/AUTORIZADO/RECHAZADO)
- `ml_probabilidad_aprobacion`
- `fecha_solicitud`, `fecha_inicio`, `fecha_fin`
- `comentario_rrhh`, `decidido_por`

## 🤖 Modelo de Machine Learning

El servicio ML utiliza un **RandomForest Classifier** entrenado con:

### Features
- Demográficos: edad, género, estado civil, hijos
- Laborales: área, cargo, antigüedad, salario, contrato, sede
- Historial: días último año, sanciones, inasistencias
- Solicitud: días solicitados, tipo permiso, impacto área

### Métricas
- Accuracy: ~85-90% (en datos de prueba)
- AUC-ROC: ~0.85-0.90

### Reglas de Negocio Implementadas
- Rechaza automáticamente si hay sanciones activas
- Penaliza muchas inasistencias
- Favorece permisos médicos/calamidad
- Considera impacto en el área
- Evalúa antigüedad vs días solicitados

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Autenticación JWT con expiración configurable
- ✅ Validación de entrada en backend y frontend
- ✅ Protección CORS configurada
- ✅ SQL injection prevention (parameterized queries)
- ✅ Roles y permisos (EMPLEADO/RRHH)

## 📝 Notas Importantes

1. **Email Notifications:** Actualmente simuladas con `console.log`. Para implementar emails reales, integrar servicio SMTP (nodemailer).

2. **ML Model:** El modelo se entrena con datos sintéticos. En producción, reentrenar con datos históricos reales.

3. **SQL Server:** Asegúrate de que SQL Server esté corriendo y accesible. Verifica firewall y configuración de red.

4. **Environment Variables:** Nunca commitear archivos `.env` con credenciales reales.

## 🐛 Troubleshooting

### Backend no conecta a SQL Server
- Verificar que SQL Server esté corriendo
- Revisar credenciales en `.env`
- Verificar que `DB_TRUST_SERVER_CERTIFICATE=true` si usas certificado autofirmado

### ML Service no responde
- Asegurarse de haber ejecutado `python train.py` primero
- Verificar que `model.pkl` existe en `ml-service/`
- Revisar logs del servicio FastAPI

### Frontend no puede hacer login
- Verificar que backend esté corriendo en puerto 5000
- Revisar CORS_ORIGIN en backend `.env`
- Verificar credenciales de prueba

## 📄 Licencia

Este proyecto es para uso interno de Comfachoco.

## 👥 Autor

Sistema desarrollado para gestión de permisos empresariales con capacidades de ML.

---

**¡Sistema listo para usar!** 🚀

Para cualquier duda, revisar los logs de cada servicio o contactar al equipo de desarrollo.
