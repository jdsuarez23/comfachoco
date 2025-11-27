"""
Regenerate training data with proper motivo_texto patterns for each tipo_permiso
Based on Simulador_completo1.ipynb mappings
"""
import pyodbc
import random
from datetime import datetime, timedelta
from config import Config

# Connection
conn = pyodbc.connect(Config.DB_CONNECTION_STRING)
cursor = conn.cursor()

# Clear existing synthetic data (keep only real user requests)
print("Clearing old synthetic training data...")
cursor.execute("DELETE FROM solicitudes_permiso WHERE solicitud_id > 13")
conn.commit()

# Define motivos for each tipo_permiso based on notebook
MOTIVOS_POR_TIPO = {
    'MEDICO': [
        'Cita médica con especialista',
        'Terapia o rehabilitación',
        'Incapacidad por enfermedad',
        'Acompañamiento médico a familiar',
        'Hospitalización de familiar',
        'Cita prenatal',
        'Complicación de embarazo',
        'Incapacidad por accidente laboral',
        'Consulta médica de rutina',
        'Exámenes médicos',
        'Procedimiento médico',
        'Tratamiento médico'
    ],
    'VACACIONES': [
        'Vacaciones',
        'Compensación en tiempo',
        'Día libre por convenio',
        'Descanso programado',
        'Vacaciones familiares',
        'Viaje personal',
        'Vacaciones de fin de año'
    ],
    'CALAMIDAD': [
        'Calamidad doméstica',
        'Emergencia familiar',
        'Fallecimiento de familiar',
        'Imprevisto urgente',
        'Cuidado temporal de familiar',
        'Situación urgente familiar',
        'Emergencia en casa'
    ],
    'ESTUDIO': [
        'Examen académico',
        'Curso o capacitación',
        'Certificación profesional',
        'Estudio',
        'Presentación académica',
        'Tesis o proyecto final',
        'Capacitación laboral'
    ],
    'PERSONAL': [
        'Problemas personales',
        'Trámite de documentos',
        'Trámite bancario',
        'Mudanza',
        'Notaría',
        'Cita gubernamental',
        'Asunto personal',
        'Diligencia personal',
        'Trámite personal'
    ],
    'MATERNIDAD': [
        'Licencia de maternidad',
        'Preparación para parto',
        'Post-parto'
    ],
    'PATERNIDAD': [
        'Licencia de paternidad',
        'Nacimiento de hijo'
    ]
}

# Get existing employees
cursor.execute("SELECT empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso FROM empleados")
empleados = cursor.fetchall()

print(f"Found {len(empleados)} employees")
print("Generating 150 synthetic leave requests with proper tipo classification...")

generated = 0
impactos = ['BAJO', 'MEDIO', 'ALTO']
resultados = ['AUTORIZADO', 'RECHAZADO', 'PENDIENTE']

for i in range(150):
    # Select random employee
    emp = random.choice(empleados)
    empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso = emp
    
    # Calculate antiguedad
    fecha_ing = datetime.strptime(str(fecha_ingreso)[:10], '%Y-%m-%d')
    antiguedad_anios = (datetime.now() - fecha_ing).days // 365
    
    # Random tipo_permiso and corresponding motivo
    tipo_permiso = random.choice(list(MOTIVOS_POR_TIPO.keys()))
    motivo_texto = random.choice(MOTIVOS_POR_TIPO[tipo_permiso])
    
    # Days based on type
    if tipo_permiso == 'MATERNIDAD':
        dias_solicitados = random.randint(60, 90)
    elif tipo_permiso == 'PATERNIDAD':
        dias_solicitados = random.randint(8, 15)
    elif tipo_permiso == 'VACACIONES':
        dias_solicitados = random.randint(5, 15)
    elif tipo_permiso == 'MEDICO':
        dias_solicitados = random.randint(1, 3)
    elif tipo_permiso == 'CALAMIDAD':
        dias_solicitados = random.randint(1, 5)
    elif tipo_permiso == 'ESTUDIO':
        dias_solicitados = random.randint(1, 2)
    else:  # PERSONAL
        dias_solicitados = random.randint(1, 3)
    
    dias_ult_ano = random.randint(0, 20)
    impacto_area = random.choice(impactos)
    
    # Dates
    fecha_inicio = datetime.now() + timedelta(days=random.randint(1, 60))
    fecha_fin = fecha_inicio + timedelta(days=dias_solicitados - 1)
    
    # ML predictions (simulated for training)
    if sanciones_activas or inasistencias > 5:
        ml_prob = random.uniform(0.1, 0.4)
        resultado = 'RECHAZADO'
    elif tipo_permiso in ['MEDICO', 'CALAMIDAD', 'MATERNIDAD', 'PATERNIDAD']:
        ml_prob = random.uniform(0.7, 0.95)
        resultado = 'AUTORIZADO'
    else:
        ml_prob = random.uniform(0.4, 0.8)
        resultado = random.choice(['AUTORIZADO', 'RECHAZADO'])
    
    es_anomala = dias_solicitados > 15 or (sanciones_activas and dias_solicitados > 3)
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
        if (generated % 30) == 0:
            print(f"  Generated {generated} requests...")
    except Exception as e:
        print(f"Error inserting request: {e}")

conn.commit()
print(f"✅ Successfully generated {generated} synthetic leave requests!")

# Verify distribution
cursor.execute("""
    SELECT tipo_permiso_real, COUNT(*) as count 
    FROM solicitudes_permiso 
    GROUP BY tipo_permiso_real 
    ORDER BY count DESC
""")
print("\n📊 Distribution by tipo_permiso:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} requests")

cursor.execute("SELECT COUNT(*) FROM solicitudes_permiso")
total = cursor.fetchone()[0]
print(f"\n📊 Total requests in database: {total}")

cursor.close()
conn.close()

print("\n✅ Now retrain the models with: python -c \"from models.trainer import ModelTrainer; trainer = ModelTrainer(); trainer.train_all_models()\"")
