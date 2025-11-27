"""
Generate synthetic leave request data for ML model training
"""
import pyodbc
import random
from datetime import datetime, timedelta
from config import Config

# Connection
conn = pyodbc.connect(Config.DB_CONNECTION_STRING)
cursor = conn.cursor()

# Get existing employees
cursor.execute("SELECT empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso FROM empleados")
empleados = cursor.fetchall()

print(f"Found {len(empleados)} employees")

# Data options
tipos_permiso = ['VACACIONES', 'MEDICO', 'CALAMIDAD', 'ESTUDIO', 'PERSONAL']
impactos = ['BAJO', 'MEDIO', 'ALTO']
resultados = ['AUTORIZADO', 'RECHAZADO', 'PENDIENTE']
motivos = {
    'VACACIONES': ['Vacaciones familiares', 'Descanso programado', 'Viaje personal', 'Vacaciones de fin de año'],
    'MEDICO': ['Cita médica', 'Procedimiento médico', 'Incapacidad médica', 'Tratamiento'],
    'CALAMIDAD': ['Emergencia familiar', 'Fallecimiento familiar', 'Situación urgente'],
    'ESTUDIO': ['Examen universitario', 'Curso de capacitación', 'Presentación académica'],
    'PERSONAL': ['Trámite personal', 'Asunto familiar', 'Diligencia personal']
}

# Generate 100 synthetic requests
print("Generating 100 synthetic leave requests...")
generated = 0

for i in range(100):
    # Select random employee
    emp = random.choice(empleados)
    empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso = emp
    
    # Calculate antiguedad
    fecha_ing = datetime.strptime(str(fecha_ingreso)[:10], '%Y-%m-%d')
    antiguedad_anios = (datetime.now() - fecha_ing).days // 365
    
    # Random request data
    tipo_permiso = random.choice(tipos_permiso)
    motivo_texto = random.choice(motivos[tipo_permiso])
    dias_solicitados = random.randint(1, 15)
    dias_ult_ano = random.randint(0, 20)
    impacto_area = random.choice(impactos)
    
    # Dates
    fecha_inicio = datetime.now() + timedelta(days=random.randint(1, 60))
    fecha_fin = fecha_inicio + timedelta(days=dias_solicitados - 1)
    
    # ML predictions (simulated for training)
    if sanciones_activas or inasistencias > 5:
        ml_prob = random.uniform(0.1, 0.4)
        resultado = 'RECHAZADO'
    elif tipo_permiso in ['MEDICO', 'CALAMIDAD']:
        ml_prob = random.uniform(0.7, 0.95)
        resultado = 'AUTORIZADO'
    else:
        ml_prob = random.uniform(0.4, 0.8)
        resultado = random.choice(['AUTORIZADO', 'RECHAZADO'])
    
    es_anomala = dias_solicitados > 10 or (sanciones_activas and dias_solicitados > 3)
    dias_autorizados = dias_solicitados if resultado == 'AUTORIZADO' else 0
    
    try:
        cursor.execute("""
            INSERT INTO solicitudes_permiso (
                empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo,
                antiguedad_anios, salario, tipo_contrato, sede, dias_ult_ano, dias_solicitados,
                motivo_texto, tipo_permiso_real, impacto_area, es_anomala,
                ml_probabilidad_aprobacion, sanciones_activas, inasistencias,
                fecha_inicio, fecha_fin, resultado_rrhh, dias_autorizados
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo,
            antiguedad_anios, salario, tipo_contrato, sede, dias_ult_ano, dias_solicitados,
            motivo_texto, tipo_permiso, impacto_area, es_anomala,
            ml_prob, sanciones_activas, inasistencias,
            fecha_inicio, fecha_fin, resultado, dias_autorizados
        ))
        generated += 1
        if (generated % 20) == 0:
            print(f"  Generated {generated} requests...")
    except Exception as e:
        print(f"Error inserting request: {e}")

conn.commit()
print(f"✅ Successfully generated {generated} synthetic leave requests!")

# Verify
cursor.execute("SELECT COUNT(*) FROM solicitudes_permiso")
total = cursor.fetchone()[0]
print(f"📊 Total requests in database: {total}")

cursor.close()
conn.close()
