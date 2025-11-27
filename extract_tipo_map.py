import json

# Load notebook
with open('Simulador_completo1.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Find cells with tipo_map
for cell in notebook['cells']:
    source = ''.join(cell.get('source', []))
    if 'tipo_map = {' in source:
        print("="*80)
        print("TIPO_MAP DEFINITION:")
        print("="*80)
        print(source)
        print("\n")
