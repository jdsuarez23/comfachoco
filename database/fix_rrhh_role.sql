-- =============================================
-- CORREGIR ROL DE MARÍA GONZÁLEZ A RRHH
-- =============================================

USE ComfachocoLeaveDB;
GO

PRINT '==============================================';
PRINT 'Verificando rol actual de María González...';
PRINT '==============================================';

SELECT empleado_id, nombre, email, rol
FROM empleados
WHERE email = 'maria.gonzalez@comfachoco.com';
GO

PRINT '==============================================';
PRINT 'Actualizando rol a RRHH...';
PRINT '==============================================';

UPDATE empleados
SET rol = 'RRHH'
WHERE email = 'maria.gonzalez@comfachoco.com';
GO

PRINT '✓ Rol actualizado';
PRINT '';
PRINT '==============================================';
PRINT 'Verificación final:';
PRINT '==============================================';

SELECT empleado_id, nombre, email, rol
FROM empleados
WHERE email = 'maria.gonzalez@comfachoco.com';
GO

PRINT '';
PRINT '✓ SCRIPT COMPLETADO';
PRINT 'Ahora María González puede acceder al panel RRHH';
PRINT 'Email: maria.gonzalez@comfachoco.com';
PRINT 'Password: Password123!';
PRINT '==============================================';
GO
