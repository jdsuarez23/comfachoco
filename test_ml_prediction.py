import requests
import json
import traceback

url = "http://localhost:8000/api/ml/predict"
data = {
    "empleado_id": 1,
    "dias_solicitados": 1,
    "motivo_texto": "Necesito ausentarme por cita medica de control con mi especialista en cardiologia",
    "fecha_inicio": "2025-11-27",
    "fecha_fin": "2025-11-27"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"✅ Success!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"❌ Error!")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
    traceback.print_exc()
