-- =============================================
-- SCRIPT COMPLETO: Habilitar Autenticación SQL Server
-- Ejecuta TODO este script en SQL Server Management Studio
-- =============================================

USE master;
GO

PRINT '==============================================';
PRINT 'PASO 1: Verificando estado actual de SA';
PRINT '==============================================';

SELECT 
    name AS 'Login',
    is_disabled AS 'Deshabilitado (1=Si, 0=No)',
    create_date AS 'Fecha Creación',
    modify_date AS 'Última Modificación'
FROM sys.sql_logins 
WHERE name = 'sa';
GO

PRINT '==============================================';
PRINT 'PASO 2: Habilitando login SA';
PRINT '==============================================';

ALTER LOGIN sa ENABLE;
GO

PRINT '✓ Login SA habilitado';
GO

PRINT '==============================================';
PRINT 'PASO 3: Estableciendo contraseña';
PRINT '==============================================';

ALTER LOGIN sa WITH PASSWORD = 'Jdsuarez23';
GO

PRINT '✓ Contraseña establecida';
GO

PRINT '==============================================';
PRINT 'PASO 4: Verificando configuración final';
PRINT '==============================================';

SELECT 
    name AS 'Login',
    is_disabled AS 'Deshabilitado (0=Activo)',
    'Jdsuarez23' AS 'Contraseña Configurada'
FROM sys.sql_logins 
WHERE name = 'sa';
GO

PRINT '==============================================';
PRINT '✓ SCRIPT COMPLETADO EXITOSAMENTE';
PRINT '==============================================';
PRINT '';
PRINT 'IMPORTANTE: Ahora debes hacer 2 cosas más:';
PRINT '';
PRINT '1. Habilitar Autenticación Mixta:';
PRINT '   - Click derecho en servidor → Properties';
PRINT '   - Security → SQL Server and Windows Authentication';
PRINT '   - Click OK';
PRINT '';
PRINT '2. Reiniciar SQL Server:';
PRINT '   - Win+R → services.msc';
PRINT '   - SQL Server (MSSQLSERVER) → Restart';
PRINT '';
PRINT '3. Probar conexión:';
PRINT '   - Disconnect de SSMS';
PRINT '   - Connect con: localhost, SQL Auth, sa, Jdsuarez23';
PRINT '==============================================';
GO
