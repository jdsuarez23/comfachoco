# ✅ SOLUCIÓN ENCONTRADA - SQL Server Browser

## Problema Identificado

El servicio **SQL Server Browser está detenido**. Este servicio es necesario para conectarse a instancias con nombre como `LAPTOP-9H85B25H\ASUS`.

## Solución (2 minutos)

### Opción 1: Iniciar SQL Server Browser (Recomendado)

1. Presiona `Win + R`
2. Escribe: `services.msc` y presiona Enter
3. Busca **SQL Server Browser**
4. Click derecho → **Start** (Iniciar)
5. Click derecho → **Properties** → Startup type: **Automatic** (para que inicie siempre)
6. Click **OK**

### Opción 2: Usar Puerto Específico

Si prefieres no usar SQL Server Browser, necesitas:

1. Abrir **SQL Server Configuration Manager**
2. **SQL Server Network Configuration** → **Protocols for ASUS**
3. **TCP/IP** → Properties → **IP Addresses** tab
4. Buscar **IPAll** → Anotar el **TCP Dynamic Port** (ej: 49172)
5. Actualizar `backend/config/database.js`:
   ```javascript
   server: 'localhost',
   port: 49172, // El puerto que anotaste
   ```

## Después de Iniciar SQL Server Browser

Ejecuta:
```bash
cd backend
node server.js
```

Deberías ver:
```
✓ Database connected successfully
✓ Server is running on port 5000
```

## Verificar que Funcionó

```bash
# En otra terminal
curl http://localhost:5000/health
```

Debería responder:
```json
{"success":true,"message":"Server is running"}
```
