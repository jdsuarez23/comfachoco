import requests
import json

# Test different tipos
test_cases = [
    {
        "name": "MEDICO - Cita médica",
        "motivo": "Necesito ausentarme por cita médica con mi especialista en cardiología",
        "expected": "MEDICO"
    },
    {
        "name": "VACACIONES - Descanso",
        "motivo": "Solicito vacaciones para descanso programado con mi familia",
        "expected": "VACACIONES"
    },
    {
        "name": "CALAMIDAD - Emergencia",
        "motivo": "Emergencia familiar urgente, fallecimiento de familiar cercano",
        "expected": "CALAMIDAD"
    },
    {
        "name": "ESTUDIO - Examen",
        "motivo": "Examen académico universitario, presentación de tesis",
        "expected": "ESTUDIO"
    },
    {
        "name": "PERSONAL - Trámite",
        "motivo": "Trámite personal en notaría, documentos bancarios",
        "expected": "PERSONAL"
    }
]

url = "http://localhost:8000/api/ml/predict"

print("="*80)
print("TESTING NAIVE BAYES CLASSIFICATION")
print("="*80)

for test in test_cases:
    data = {
        "empleado_id": 1,
        "dias_solicitados": 1,
        "motivo_texto": test["motivo"],
        "fecha_inicio": "2025-11-27",
        "fecha_fin": "2025-11-27"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            classified_as = result.get('tipo_permiso_real')
            is_correct = classified_as == test["expected"]
            
            print(f"\n{test['name']}")
            print(f"  Motivo: {test['motivo'][:60]}...")
            print(f"  Expected: {test['expected']}")
            print(f"  Classified as: {classified_as}")
            print(f"  ✅ CORRECT" if is_correct else f"  ❌ INCORRECT")
            print(f"  Probability: {result.get('ml_probabilidad_aprobacion'):.2%}")
        else:
            print(f"\n❌ Error for {test['name']}: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"\n❌ Exception for {test['name']}: {e}")

print("\n" + "="*80)
