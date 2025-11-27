# ⚠️ VERIFICACIÓN CRÍTICA - SQL Server Authentication

## Estado Actual
❌ **Error persiste:** `Could not connect (sequence)` = Autenticación falla

## Checklist de Verificación

### ✅ Paso 1: Verificar Modo de Autenticación

1. Abre **SQL Server Management Studio**
2. Conecta con **Windows Authentication**
3. Click derecho en el servidor (LAPTOP-9H85B25H\ASUS) → **Properties**
4. Ve a **Security**
5. **DEBE estar seleccionado:** `SQL Server and Windows Authentication mode`
6. Si no está así, cámbialo y **reinicia el servicio SQL Server**

### ✅ Paso 2: Ejecutar Script para Habilitar SA

**IMPORTANTE:** Ejecuta este script COMPLETO en SQL Server Management Studio:

```sql
USE master;
GO

-- Ver estado actual de sa
SELECT name, is_disabled, create_date, modify_date
FROM sys.sql_logins 
WHERE name = 'sa';
GO

-- Habilitar sa
ALTER LOGIN sa ENABLE;
GO

-- Establecer contraseña
ALTER LOGIN sa WITH PASSWORD = 'Jdsuarez23';
GO

-- Verificar que se habilitó
SELECT name, is_disabled 
FROM sys.sql_logins 
WHERE name = 'sa';
-- Debe mostrar: is_disabled = 0
GO
```

### ✅ Paso 3: Reiniciar SQL Server

**CRÍTICO:** Debes reiniciar el servicio después de cambiar el modo de autenticación.

1. Presiona `Win + R`
2. Escribe: `services.msc`
3. Busca: **SQL Server (ASUS)**  
4. Click derecho → **Restart**
5. Espera a que el estado sea **Running**

### ✅ Paso 4: Probar Conexión Manualmente

En SQL Server Management Studio:

1. **Disconnect** de la conexión actual
2. Click **Connect** → **Database Engine**
3. **Server name:** `localhost\ASUS` o `localhost,1433`
4. **Authentication:** `SQL Server Authentication`
5. **Login:** `sa`
6. **Password:** `Jdsuarez23`
7. Click **Connect**

**Si esto falla**, el problema está en SQL Server, no en el backend.

### ✅ Paso 5: Verificar Firewall/TCP

Si la conexión manual funciona pero el backend no:

```powershell
# Verificar que el puerto 1433 esté escuchando
netstat -an | findstr "1433"
```

Deberías ver:
```
TCP    0.0.0.0:1433           0.0.0.0:0              LISTENING
```

## Resultado Esperado

Después de completar TODOS los pasos:

```bash
cd backend
node server.js
```

Debe mostrar:
```
✓ Database connected successfully
✓ Server is running on port 5000
```

## Si Sigue Fallando

Dime:
1. ¿Pudiste conectarte manualmente con sa en SSMS?
2. ¿Qué mensaje de error aparece en SSMS?
3. ¿El servicio SQL Server (ASUS) está Running?
