# 🔴 PROBLEMA ENCONTRADO: TCP/IP No Está Habilitado

## Error Identificado

```
Test-NetConnection -Port 1433: FAILED
```

**SQL Server NO está escuchando en el puerto 1433.** Por eso la conexión falla.

## SOLUCIÓN: Habilitar TCP/IP en SQL Server

### Paso 1: Abrir SQL Server Configuration Manager

1. Presiona `Win + R`
2. Escribe: `SQLServerManager16.msc` (o `SQLServerManager15.msc` si es SQL 2019)
   - Si no funciona, busca "SQL Server Configuration Manager" en el menú inicio
3. Presiona Enter

### Paso 2: Habilitar TCP/IP

1. En el panel izquierdo, expande: **SQL Server Network Configuration**
2. Click en: **Protocols for MSSQLSERVER**
3. En el panel derecho, busca: **TCP/IP**
4. **Estado actual:** Probablemente dice "Disabled"
5. Click derecho en **TCP/IP** → **Enable**
6. Aparecerá un mensaje: "Changes will not take effect until service is restarted"
7. Click **OK**

### Paso 3: Configurar Puerto 1433

1. Click derecho en **TCP/IP** → **Properties**
2. Ve a la pestaña **IP Addresses**
3. Scroll hasta el final, busca **IPALL**
4. **TCP Dynamic Ports:** Déjalo vacío (borra si tiene algo)
5. **TCP Port:** Escribe `1433`
6. Click **OK**

### Paso 4: Reiniciar SQL Server

1. En Configuration Manager, panel izquierdo: **SQL Server Services**
2. Click derecho en **SQL Server (MSSQLSERVER)** → **Restart**
3. Espera a que el estado sea **Running**

### Paso 5: Verificar Puerto

Ejecuta en PowerShell:
```powershell
netstat -ano | findstr "1433"
```

Deberías ver algo como:
```
TCP    0.0.0.0:1433           0.0.0.0:0              LISTENING
```

### Paso 6: Probar Backend

```bash
cd backend
node server.js
```

Deberías ver:
```
✓ Database connected successfully
✓ Server is running on port 5000
```

## Alternativa: Usar Named Pipes

Si no quieres habilitar TCP/IP, puedes usar Named Pipes (solo funciona localmente):

1. En Configuration Manager: **Protocols for MSSQLSERVER**
2. Habilita **Named Pipes**
3. Reinicia SQL Server
4. Actualiza `backend/config/database.js`:
   ```javascript
   server: '\\\\.\\pipe\\MSSQL$MSSQLSERVER\\sql\\query'
   ```

## ¿Por Qué Pasó Esto?

Por defecto, SQL Server Express solo habilita **Shared Memory** y **Named Pipes**. TCP/IP está deshabilitado por seguridad. Para conexiones remotas o desde aplicaciones Node.js, necesitas TCP/IP habilitado.
