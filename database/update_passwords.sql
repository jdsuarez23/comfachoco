-- =============================================
-- ACTUALIZAR CONTRASEÑAS CON HASH CORRECTO
-- Password: Password123!
-- Hash generado con bcrypt
-- =============================================

USE ComfachocoLeaveDB;
GO

PRINT '==============================================';
PRINT 'Actualizando contraseñas de empleados...';
PRINT '==============================================';

-- Hash bcrypt REAL para "Password123!" generado con bcryptjs
UPDATE empleados
SET hashed_password = '$2a$10$U/.eye4rarbGM9W6Sh6M4OB8EYxJLqbL07SjAXE/Hp5EyUylju/Wu'
WHERE empleado_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
GO

PRINT '✓ Contraseñas actualizadas para 10 empleados';
PRINT '';
PRINT '==============================================';
PRINT 'CREDENCIALES DE ACCESO:';
PRINT '==============================================';
PRINT '';
PRINT 'EMPLEADO:';
PRINT '  Email: carlos.ramirez@comfachoco.com';
PRINT '  Password: Password123!';
PRINT '';
PRINT 'RRHH:';
PRINT '  Email: maria.gonzalez@comfachoco.com';
PRINT '  Password: Password123!';
PRINT '';
PRINT '==============================================';
GO

-- Verificar actualización
SELECT 
    empleado_id, 
    nombre, 
    email, 
    rol,
    SUBSTRING(hashed_password, 1, 20) + '...' AS 'Hash (primeros 20 chars)'
FROM empleados
ORDER BY empleado_id;
GO

PRINT '';
PRINT '✓ SCRIPT COMPLETADO';
PRINT 'Ahora puedes hacer login en http://localhost:3000';
GO
