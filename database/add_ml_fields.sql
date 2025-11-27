-- =============================================
-- Add ML-related fields to database
-- =============================================

USE ComfachocoLeaveDB;
GO

-- Add impacto_area_numerico to solicitudes_permiso
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('solicitudes_permiso') 
    AND name = 'impacto_area_numerico'
)
BEGIN
    ALTER TABLE solicitudes_permiso 
    ADD impacto_area_numerico DECIMAL(5,2) NULL;
    PRINT 'Added column: impacto_area_numerico';
END
ELSE
BEGIN
    PRINT 'Column impacto_area_numerico already exists';
END
GO

-- Add ml_dias_sugeridos to solicitudes_permiso
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('solicitudes_permiso') 
    AND name = 'ml_dias_sugeridos'
)
BEGIN
    ALTER TABLE solicitudes_permiso 
    ADD ml_dias_sugeridos INT NULL;
    PRINT 'Added column: ml_dias_sugeridos';
END
ELSE
BEGIN
    PRINT 'Column ml_dias_sugeridos already exists';
END
GO

-- Add segmento_ml to empleados
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('empleados') 
    AND name = 'segmento_ml'
)
BEGIN
    ALTER TABLE empleados 
    ADD segmento_ml INT NULL;
    PRINT 'Added column: segmento_ml';
END
ELSE
BEGIN
    PRINT 'Column segmento_ml already exists';
END
GO

-- Add constraint for impacto_area_numerico
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_solicitudes_impacto_numerico'
)
BEGIN
    ALTER TABLE solicitudes_permiso
    ADD CONSTRAINT CK_solicitudes_impacto_numerico 
    CHECK (impacto_area_numerico >= 0 AND impacto_area_numerico <= 100);
    PRINT 'Added constraint: CK_solicitudes_impacto_numerico';
END
GO

-- Add constraint for ml_dias_sugeridos
IF NOT EXISTS (
    SELECT * FROM sys.check_constraints 
    WHERE name = 'CK_solicitudes_ml_dias'
)
BEGIN
    ALTER TABLE solicitudes_permiso
    ADD CONSTRAINT CK_solicitudes_ml_dias 
    CHECK (ml_dias_sugeridos > 0);
    PRINT 'Added constraint: CK_solicitudes_ml_dias';
END
GO

PRINT '=============================================';
PRINT 'ML fields migration completed successfully!';
PRINT '=============================================';
PRINT 'Added fields:';
PRINT '  - solicitudes_permiso.impacto_area_numerico (DECIMAL(5,2))';
PRINT '  - solicitudes_permiso.ml_dias_sugeridos (INT)';
PRINT '  - empleados.segmento_ml (INT)';
