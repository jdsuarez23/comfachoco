# Solución de Problemas de Conexión SQL Server

## Problema Actual

El backend no puede conectarse a SQL Server. Error:
```
✗ Database connection failed: LAPTOP-9H85B25H\\ASUS in 30000ms
```

## Soluciones Posibles

### Opción 1: Configurar Autenticación SQL Server

1. **Abrir SQL Server Management Studio**
2. **Click derecho en el servidor** → Properties
3. **Security** → Cambiar a "SQL Server and Windows Authentication mode"
4. **Reiniciar el servicio SQL Server**

5. **Ejecutar este script:**
```sql
USE master;
GO

-- Habilitar usuario sa
ALTER LOGIN sa ENABLE;
GO

-- Cambiar contraseña de sa
ALTER LOGIN sa WITH PASSWORD = 'TuContraseña123!';
GO
```

6. **Actualizar backend/.env:**
```
DB_USER=sa
DB_PASSWORD=TuContraseña123!
```

### Opción 2: Verificar que SQL Server esté corriendo

1. Abrir **Services** (services.msc)
2. Buscar "SQL Server (ASUS)"
3. Verificar que esté **Running**
4. Si no, click derecho → Start

### Opción 3: Habilitar TCP/IP

1. Abrir **SQL Server Configuration Manager**
2. **SQL Server Network Configuration** → Protocols for ASUS
3. **TCP/IP** → Enable
4. Reiniciar servicio SQL Server

## Información Necesaria

Por favor proporciona:
- ¿Cuál es la contraseña de `sa`?
- ¿Está el servicio SQL Server corriendo?
- ¿Prefieres usar Windows Authentication?
