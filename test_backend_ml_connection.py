import requests
import json

# Test the exact flow: backend -> ML service
print("="*80)
print("TESTING BACKEND -> ML SERVICE CONNECTION")
print("="*80)

# Test 1: Direct ML service call
print("\n1. Testing ML service directly (port 8000)...")
try:
    response = requests.post(
        "http://localhost:8000/api/ml/predict",
        json={
            "empleado_id": 1,
            "dias_solicitados": 3,
            "motivo_texto": "Necesito ausentarme por cirugía de rodilla con mi traumatólogo",
            "fecha_inicio": "2025-11-27",
            "fecha_fin": "2025-11-29"
        }
    )
    if response.status_code == 200:
        result = response.json()
        print(f"   ✅ ML Service responds correctly")
        print(f"   Tipo clasificado: {result.get('tipo_permiso_real')}")
        print(f"   Probabilidad: {result.get('ml_probabilidad_aprobacion'):.2%}")
    else:
        print(f"   ❌ Error: {response.status_code}")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ❌ Exception: {e}")

# Test 2: Backend health check
print("\n2. Testing backend health (port 5000)...")
try:
    response = requests.get("http://localhost:5000/health")
    if response.status_code == 200:
        print(f"   ✅ Backend is running")
    else:
        print(f"   ❌ Backend error: {response.status_code}")
except Exception as e:
    print(f"   ❌ Backend not reachable: {e}")

# Test 3: Check if backend can reach ML service
print("\n3. Checking backend configuration...")
with open('backend/services/mlService.js', 'r') as f:
    content = f.read()
    if 'localhost:8000' in content:
        print("   ✅ Backend configured for port 8000")
    elif 'localhost:5000' in content:
        print("   ❌ Backend still configured for port 5000!")
    else:
        print("   ⚠ Cannot determine ML service URL")

print("\n" + "="*80)
