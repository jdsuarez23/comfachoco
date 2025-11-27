import sys
sys.path.append('ml-service')

import pyodbc
from config import Config

conn = pyodbc.connect(Config.DB_CONNECTION_STRING)
cursor = conn.cursor()

# Get last 10 requests
cursor.execute("""
    SELECT TOP 10 solicitud_id, motivo_texto, tipo_permiso_real, ml_probabilidad_aprobacion 
    FROM solicitudes_permiso 
    ORDER BY solicitud_id DESC
""")

print("="*80)
print("ÚLTIMAS 10 SOLICITUDES (más recientes primero)")
print("="*80)

for row in cursor.fetchall():
    print(f"\nID: {row[0]}")
    print(f"  Motivo: {row[1][:60]}...")
    print(f"  Tipo: {row[2]}")
    print(f"  ML Prob: {row[3]:.2%}" if row[3] else "  ML Prob: None")

cursor.close()
conn.close()
