-- =============================================
-- ADD SUPPORT FILE COLUMN TO SOLICITUDES
-- =============================================

USE ComfachocoLeaveDB;
GO

PRINT '==============================================';
PRINT 'Adding archivo_soporte column...';
PRINT '==============================================';

-- Add column for support file path
ALTER TABLE solicitudes_permiso
ADD archivo_soporte NVARCHAR(500) NULL;
GO

PRINT '✓ Column added successfully';
PRINT '';
PRINT 'Verifying schema...';

-- Verify column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'solicitudes_permiso'
AND COLUMN_NAME = 'archivo_soporte';
GO

PRINT '';
PRINT '✓ MIGRATION COMPLETED';
PRINT 'Employees can now upload support files with requests';
PRINT '==============================================';
GO
