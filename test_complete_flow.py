import requests
import json

# Login first to get token
print("="*80)
print("TESTING COMPLETE BACKEND FLOW")
print("="*80)

# Step 1: Login
print("\n1. Logging in...")
login_response = requests.post(
    "http://localhost:5000/api/auth/login",
    json={
        "email": "carlos.ramirez@comfachoco.com",
        "password": "Password123!"
    }
)

if login_response.status_code != 200:
    print(f"   ❌ Login failed: {login_response.status_code}")
    print(f"   Response: {login_response.text}")
    exit(1)

token = login_response.json().get('token')
print(f"   ✅ Login successful, got token")

# Step 2: Create leave request
print("\n2. Creating leave request with motivo 'Cirugía de rodilla'...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

request_data = {
    "motivo_texto": "Necesito ausentarme por cirugía de rodilla programada con mi traumatólogo",
    "dias_solicitados": 3,
    "fecha_inicio": "2025-11-27",
    "fecha_fin": "2025-11-29",
    "impacto_area": "MEDIO",
    "dias_ult_ano": 0
}

create_response = requests.post(
    "http://localhost:5000/api/solicitudes",
    headers=headers,
    json=request_data
)

if create_response.status_code != 201:
    print(f"   ❌ Request creation failed: {create_response.status_code}")
    print(f"   Response: {create_response.text}")
    exit(1)

result = create_response.json()
print(f"   ✅ Request created successfully!")
print(f"   Solicitud ID: {result['solicitud']['solicitud_id']}")
print(f"   Tipo clasificado: {result['solicitud']['tipo_permiso_real']}")
print(f"   ML Probability: {result['solicitud']['ml_probabilidad_aprobacion']:.2%}")

# Check if it's correct
if result['solicitud']['tipo_permiso_real'] == 'MEDICO':
    print(f"   ✅ CORRECT CLASSIFICATION!")
else:
    print(f"   ❌ WRONG! Expected MEDICO, got {result['solicitud']['tipo_permiso_real']}")

print("\n" + "="*80)
