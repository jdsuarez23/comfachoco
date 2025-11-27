-- =============================================
-- Employee Leave Request Management System
-- Database Schema for SQL Server
-- =============================================

-- Drop tables if they exist (for clean re-creation)
IF OBJECT_ID('solicitudes_permiso', 'U') IS NOT NULL
    DROP TABLE solicitudes_permiso;

IF OBJECT_ID('empleados', 'U') IS NOT NULL
    DROP TABLE empleados;

-- =============================================
-- Table: empleados
-- Description: Master employee data with authentication
-- =============================================
CREATE TABLE empleados (
    empleado_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    hashed_password NVARCHAR(255) NOT NULL,
    rol NVARCHAR(50) NOT NULL DEFAULT 'EMPLEADO', -- EMPLEADO, RRHH
    fecha_ingreso DATE NOT NULL,
    edad INT NULL,
    genero NVARCHAR(10) NULL,
    estado_civil NVARCHAR(20) NULL,
    numero_hijos INT NULL DEFAULT 0,
    area NVARCHAR(100) NULL,
    cargo NVARCHAR(100) NULL,
    salario DECIMAL(12,2) NULL,
    tipo_contrato NVARCHAR(50) NULL,
    sede NVARCHAR(100) NULL,
    sanciones_activas BIT DEFAULT 0,
    inasistencias INT DEFAULT 0,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_empleados_rol CHECK (rol IN ('EMPLEADO', 'RRHH')),
    CONSTRAINT CK_empleados_edad CHECK (edad >= 18 AND edad <= 100),
    CONSTRAINT CK_empleados_numero_hijos CHECK (numero_hijos >= 0)
);

-- =============================================
-- Table: solicitudes_permiso
-- Description: Leave requests with all required fields
-- =============================================
CREATE TABLE solicitudes_permiso (
    solicitud_id INT IDENTITY(1,1) PRIMARY KEY,
    empleado_id INT NOT NULL,
    
    -- Employee demographic data (denormalized for ML training)
    edad INT NULL,
    genero NVARCHAR(10) NULL,
    estado_civil NVARCHAR(20) NULL,
    numero_hijos INT NULL,
    area NVARCHAR(100) NULL,
    cargo NVARCHAR(100) NULL,
    antiguedad_anios INT NULL,
    salario DECIMAL(12,2) NULL,
    tipo_contrato NVARCHAR(50) NULL,
    sede NVARCHAR(100) NULL,
    
    -- Leave request details
    dias_ult_ano INT NULL DEFAULT 0, -- Days taken in last year
    dias_solicitados INT NOT NULL,
    dias_autorizados INT NULL,
    motivo_texto NVARCHAR(MAX) NOT NULL,
    tipo_permiso_real NVARCHAR(50) NOT NULL, -- VACACIONES, MEDICO, PERSONAL, CALAMIDAD, etc.
    impacto_area NVARCHAR(50) NULL, -- BAJO, MEDIO, ALTO
    
    -- Anomaly detection and decision
    es_anomala BIT DEFAULT 0,
    resultado_rrhh NVARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, AUTORIZADO, RECHAZADO
    comentario_rrhh NVARCHAR(MAX) NULL,
    ml_probabilidad_aprobacion DECIMAL(5,4) NULL, -- ML prediction score 0-1
    
    -- Employee history flags
    sanciones_activas BIT DEFAULT 0,
    inasistencias INT DEFAULT 0,
    
    -- Dates
    fecha_solicitud DATETIME2 DEFAULT GETDATE(),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fecha_decision DATETIME2 NULL,
    
    -- Audit
    decidido_por INT NULL, -- empleado_id of RRHH user who made decision
    
    -- Constraints
    CONSTRAINT FK_solicitudes_empleado FOREIGN KEY (empleado_id) 
        REFERENCES empleados(empleado_id) ON DELETE CASCADE,
    CONSTRAINT FK_solicitudes_decidido_por FOREIGN KEY (decidido_por) 
        REFERENCES empleados(empleado_id),
    CONSTRAINT CK_solicitudes_resultado CHECK (resultado_rrhh IN ('PENDIENTE', 'AUTORIZADO', 'RECHAZADO')),
    CONSTRAINT CK_solicitudes_dias_solicitados CHECK (dias_solicitados > 0),
    CONSTRAINT CK_solicitudes_dias_autorizados CHECK (dias_autorizados >= 0),
    CONSTRAINT CK_solicitudes_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_solicitudes_impacto CHECK (impacto_area IN ('BAJO', 'MEDIO', 'ALTO', NULL)),
    CONSTRAINT CK_solicitudes_ml_prob CHECK (ml_probabilidad_aprobacion >= 0 AND ml_probabilidad_aprobacion <= 1)
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Index on empleados email for login queries
CREATE INDEX IX_empleados_email ON empleados(email);

-- Index on empleados rol for filtering RRHH users
CREATE INDEX IX_empleados_rol ON empleados(rol);

-- Index on solicitudes empleado_id for user's requests
CREATE INDEX IX_solicitudes_empleado_id ON solicitudes_permiso(empleado_id);

-- Index on solicitudes resultado_rrhh for pending requests
CREATE INDEX IX_solicitudes_resultado ON solicitudes_permiso(resultado_rrhh);

-- Index on solicitudes fecha_solicitud for chronological queries
CREATE INDEX IX_solicitudes_fecha_solicitud ON solicitudes_permiso(fecha_solicitud DESC);

-- Composite index for RRHH dashboard (pending requests by date)
CREATE INDEX IX_solicitudes_resultado_fecha ON solicitudes_permiso(resultado_rrhh, fecha_solicitud DESC);

-- Index on tipo_permiso_real for analytics
CREATE INDEX IX_solicitudes_tipo_permiso ON solicitudes_permiso(tipo_permiso_real);

-- =============================================
-- Success Message
-- =============================================
PRINT 'Database schema created successfully!';
PRINT 'Tables created: empleados, solicitudes_permiso';
PRINT 'Indexes created: 8 indexes for optimized queries';
