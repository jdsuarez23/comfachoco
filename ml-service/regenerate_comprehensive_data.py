"""
Generate comprehensive training data with detailed motivo patterns
Based on Simulador_completo1.ipynb and user's specific examples
"""
import pyodbc
import random
from datetime import datetime, timedelta
import sys
sys.path.append('ml-service')
from config import Config

# Connection
conn = pyodbc.connect(Config.DB_CONNECTION_STRING)
cursor = conn.cursor()

# Clear existing synthetic data
print("Clearing old synthetic training data...")
cursor.execute("DELETE FROM solicitudes_permiso WHERE solicitud_id > 13")
conn.commit()

# COMPREHENSIVE motivos for each tipo_permiso with SPECIFIC keywords
MOTIVOS_POR_TIPO = {
    'MEDICO': [
        # Cirugías y procedimientos
        'Cirugía programada de rodilla',
        'Cirugía de menisco',
        'Operación quirúrgica urgente',
        'Procedimiento médico ambulatorio',
        'Cirugía de apendicitis',
        'Intervención quirúrgica',
        # Citas médicas
        'Cita médica con especialista',
        'Cita con traumatólogo',
        'Consulta con cardiólogo',
        'Cita con oftalmólogo',
        'Revisión médica general',
        'Examen médico de rutina',
        # Tratamientos
        'Terapia física y rehabilitación',
        'Sesión de fisioterapia',
        'Tratamiento médico especializado',
        'Quimioterapia programada',
        'Radioterapia',
        # Incapacidades
        'Incapacidad por enfermedad',
        'Incapacidad médica temporal',
        'Reposo médico ordenado',
        'Convalecencia post-operatoria',
        # Emergencias médicas
        'Emergencia médica personal',
        'Hospitalización urgente',
        'Ingreso hospitalario',
        # Acompañamiento
        'Acompañamiento médico a familiar',
        'Llevar familiar a cirugía',
        'Cuidado de familiar hospitalizado',
        # Prenatal
        'Cita prenatal de control',
        'Ecografía de embarazo',
        'Control ginecológico'
    ],
    'VACACIONES': [
        'Vacaciones programadas',
        'Vacaciones de fin de año',
        'Vacaciones familiares',
        'Descanso vacacional',
        'Viaje de vacaciones',
        'Vacaciones de verano',
        'Descanso programado',
        'Compensación en tiempo',
        'Día libre por convenio',
        'Vacaciones navideñas',
        'Vacaciones de semana santa',
        'Tiempo de descanso',
        'Viaje personal programado',
        'Vacaciones con familia'
    ],
    'CALAMIDAD': [
        # Luto y fallecimientos
        'Luto familiar por fallecimiento',
        'Fallecimiento de mi padre',
        'Fallecimiento de mi madre',
        'Muerte de familiar cercano',
        'Luto por pérdida familiar',
        'Funeral de familiar',
        'Velorio de familiar',
        # Emergencias
        'Emergencia familiar urgente',
        'Calamidad doméstica',
        'Emergencia en casa',
        'Situación familiar crítica',
        'Imprevisto urgente familiar',
        'Crisis familiar',
        # Cuidado urgente
        'Cuidado urgente de familiar enfermo',
        'Atención a familiar en emergencia',
        'Familiar hospitalizado de urgencia'
    ],
    'ESTUDIO': [
        'Examen académico universitario',
        'Examen final de carrera',
        'Presentación de tesis',
        'Sustentación de proyecto',
        'Curso de capacitación laboral',
        'Certificación profesional',
        'Seminario de formación',
        'Capacitación técnica',
        'Diplomado',
        'Maestría - clases',
        'Doctorado - investigación',
        'Examen de grado'
    ],
    'PERSONAL': [
        'Trámite personal en notaría',
        'Diligencia bancaria',
        'Trámite de documentos',
        'Gestión en entidad pública',
        'Asunto personal urgente',
        'Mudanza de vivienda',
        'Trámite gubernamental',
        'Renovación de documentos',
        'Cita en consulado',
        'Problemas personales',
        'Gestión administrativa personal'
    ],
    'MATERNIDAD': [
        'Licencia de maternidad',
        'Preparación para parto',
        'Post-parto y lactancia',
        'Cuidado de recién nacido',
        'Licencia maternal'
    ],
    'PATERNIDAD': [
        'Licencia de paternidad',
        'Nacimiento de hijo',
        'Cuidado de recién nacido',
        'Licencia paternal'
    ]
}

# Get existing employees
cursor.execute("SELECT empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso FROM empleados")
empleados = cursor.fetchall()

print(f"Found {len(empleados)} employees")
print("Generating 300 comprehensive leave requests...")

generated = 0
impactos = ['BAJO', 'MEDIO', 'ALTO']

# Generate more samples for MEDICO, CALAMIDAD, VACACIONES (most common)
tipo_weights = {
    'MEDICO': 80,  # More medical examples
    'VACACIONES': 60,
    'CALAMIDAD': 50,
    'ESTUDIO': 40,
    'PERSONAL': 40,
    'MATERNIDAD': 15,
    'PATERNIDAD': 15
}

for tipo_permiso, count in tipo_weights.items():
    for i in range(count):
        # Select random employee
        emp = random.choice(empleados)
        empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso = emp
        
        # Calculate antiguedad
        fecha_ing = datetime.strptime(str(fecha_ingreso)[:10], '%Y-%m-%d')
        antiguedad_anios = (datetime.now() - fecha_ing).days // 365
        
        # Random motivo for this type
        motivo_texto = random.choice(MOTIVOS_POR_TIPO[tipo_permiso])
        
        # Days based on type
        if tipo_permiso == 'MATERNIDAD':
            dias_solicitados = random.randint(60, 90)
        elif tipo_permiso == 'PATERNIDAD':
            dias_solicitados = random.randint(8, 15)
        elif tipo_permiso == 'VACACIONES':
            dias_solicitados = random.randint(5, 15)
        elif tipo_permiso == 'MEDICO':
            if 'cirugía' in motivo_texto.lower() or 'operación' in motivo_texto.lower():
                dias_solicitados = random.randint(3, 10)
            else:
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
            if (generated % 50) == 0:
                print(f"  Generated {generated} requests...")
        except Exception as e:
            print(f"Error inserting request: {e}")

conn.commit()
print(f"\n✅ Successfully generated {generated} comprehensive leave requests!")

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

print("\n✅ Now retrain the models!")
