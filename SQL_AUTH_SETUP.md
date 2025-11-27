# SQL Server Authentication Setup

## Error Actual
```
✗ Database connection failed: Could not connect (sequence)
```

Esto significa que la conexión llega al servidor pero falla la autenticación.

## Solución: Configurar Usuario SA

### Paso 1: Habilitar Autenticación SQL Server

1. Abre **SQL Server Management Studio**
2. Conecta con Windows Authentication
3. Click derecho en el servidor → **Properties**
4. **Security** → Selecciona **SQL Server and Windows Authentication mode**
5. Click **OK**

### Paso 2: Configurar Contraseña de SA

Ejecuta este script en SSMS:

```sql
USE master;
GO

-- Habilitar el login sa
ALTER LOGIN sa ENABLE;
GO

-- Establecer contraseña (usa una segura)
ALTER LOGIN sa WITH PASSWORD = 'Jdsuarez23';
GO

-- Verificar
SELECT name, is_disabled 
FROM sys.sql_logins 
WHERE name = 'sa';
GO
```

### Paso 3: Reiniciar SQL Server

1. Abre **Services** (Win + R → services.msc)
2. Busca **SQL Server (ASUS)**
3. Click derecho → **Restart**

### Paso 4: Actualizar Configuración Backend

Crea el archivo `backend/.env`:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ComfachocoLeaveDB
DB_USER=sa
DB_PASSWORD=Password123!
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

### Paso 5: Probar Conexión

```bash
cd backend
node server.js
```

Deberías ver:
```
✓ Database connected successfully
✓ Server is running on port 5000
```

## Alternativa: Crear Nuevo Usuario

Si prefieres no usar `sa`:

```sql
USE master;
GO

CREATE LOGIN comfachoco_user WITH PASSWORD = 'StrongPassword123!';
GO

USE ComfachocoLeaveDB;
GO

CREATE USER comfachoco_user FOR LOGIN comfachoco_user;
GO

ALTER ROLE db_owner ADD MEMBER comfachoco_user;
GO
```

Luego usa:
```env
DB_USER=comfachoco_user
DB_PASSWORD=StrongPassword123!
```
