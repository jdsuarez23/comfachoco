import requests
import json

# Test with user's examples
test_cases = [
    {"motivo": "Necesito ausentarme por cirugía programada", "expected": "MEDICO"},
    {"motivo": "Luto familiar, fallecimiento de mi padre", "expected": "CALAMIDAD"},
    {"motivo": "Vacaciones de fin de año con mi familia", "expected": "VACACIONES"},
    {"motivo": "Cita médica con especialista", "expected": "MEDICO"},
    {"motivo": "Emergencia familiar urgente", "expected": "CALAMIDAD"}
]

url = "http://localhost:8000/api/ml/predict"

output = []
output.append("="*80)
output.append("TESTING WITH USER'S EXAMPLES")
output.append("="*80)

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
            
            output.append(f"\nMotivo: \"{test['motivo']}\"")
            output.append(f"  Expected: {test['expected']}")
            output.append(f"  Got: {classified_as}")
            output.append(f"  {'✅ CORRECT' if is_correct else '❌ WRONG'}")
            output.append(f"  Probability: {result.get('ml_probabilidad_aprobacion'):.2%}")
        else:
            output.append(f"\n❌ Error: {response.status_code}")
            output.append(f"  Response: {response.text}")
    except Exception as e:
        output.append(f"\n❌ Exception: {e}")

output.append("\n" + "="*80)

# Print and save
result_text = "\n".join(output)
print(result_text)

with open('test_results.txt', 'w', encoding='utf-8') as f:
    f.write(result_text)
