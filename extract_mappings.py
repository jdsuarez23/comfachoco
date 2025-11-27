import json
import sys

# Load notebook
with open('Simulador_completo1.ipynb', 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Find the cell with motivos list
print("Searching for motivos and tipo_map...")
print("="*80)

for i, cell in enumerate(notebook['cells']):
    source = ''.join(cell.get('source', []))
    
    # Look for motivos definition
    if 'motivos = [' in source and 'Cita médica' in source:
        print(f"\nCell {i} - MOTIVOS LIST:")
        print("-"*80)
        # Print first 2000 chars
        print(source[:2000])
        print("...")
        
    # Look for tipo_map definition  
    if 'tipo_map = {' in source:
        print(f"\nCell {i} - TIPO_MAP:")
        print("-"*80)
        print(source[:3000])
        print("...")
