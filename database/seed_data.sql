-- =============================================
-- Seed Data for Employee Leave Request System
-- =============================================
-- Note: Passwords are hashed using bcrypt
-- Default password for all users: "Password123!"
-- Hash: $2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y

USE master;
GO

-- =============================================
-- Insert Employees
-- =============================================

-- RRHH User (for testing approval workflow)
INSERT INTO empleados (nombre, email, hashed_password, rol, fecha_ingreso, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias)
VALUES 
('María González', 'maria.gonzalez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'RRHH', '2015-03-15', 38, 'F', 'CASADA', 2, 'RECURSOS HUMANOS', 'JEFE DE RRHH', 8500000.00, 'INDEFINIDO', 'SEDE PRINCIPAL', 0, 0);

-- Regular Employees
INSERT INTO empleados (nombre, email, hashed_password, rol, fecha_ingreso, edad, genero, estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede, sanciones_activas, inasistencias)
VALUES 
('Carlos Ramírez', 'carlos.ramirez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2018-06-01', 32, 'M', 'SOLTERO', 0, 'TECNOLOGIA', 'DESARROLLADOR SENIOR', 6500000.00, 'INDEFINIDO', 'SEDE PRINCIPAL', 0, 1),
('Ana Martínez', 'ana.martinez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2020-01-15', 28, 'F', 'SOLTERA', 0, 'MARKETING', 'ANALISTA DE MARKETING', 4200000.00, 'INDEFINIDO', 'SEDE PRINCIPAL', 0, 0),
('Luis Fernández', 'luis.fernandez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2017-09-20', 35, 'M', 'CASADO', 2, 'VENTAS', 'GERENTE DE VENTAS', 7200000.00, 'INDEFINIDO', 'SEDE NORTE', 0, 0),
('Patricia López', 'patricia.lopez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2019-04-10', 30, 'F', 'CASADA', 1, 'FINANZAS', 'CONTADOR', 5500000.00, 'INDEFINIDO', 'SEDE PRINCIPAL', 0, 2),
('Jorge Sánchez', 'jorge.sanchez@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2021-02-01', 26, 'M', 'SOLTERO', 0, 'TECNOLOGIA', 'DESARROLLADOR JUNIOR', 3800000.00, 'TERMINO FIJO', 'SEDE PRINCIPAL', 1, 3),
('Laura Díaz', 'laura.diaz@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2016-11-05', 40, 'F', 'CASADA', 3, 'OPERACIONES', 'COORDINADOR DE OPERACIONES', 6800000.00, 'INDEFINIDO', 'SEDE SUR', 0, 0),
('Roberto Torres', 'roberto.torres@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2022-05-15', 24, 'M', 'SOLTERO', 0, 'MARKETING', 'ASISTENTE DE MARKETING', 2800000.00, 'TERMINO FIJO', 'SEDE PRINCIPAL', 0, 1),
('Sandra Morales', 'sandra.morales@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2019-08-20', 33, 'F', 'UNION LIBRE', 1, 'VENTAS', 'EJECUTIVO DE VENTAS', 4500000.00, 'INDEFINIDO', 'SEDE NORTE', 0, 0),
('Miguel Herrera', 'miguel.herrera@comfachoco.com', '$2a$10$rQZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0yJ8YqVxJ5xJ5.5qZ9vXKZ0y', 'EMPLEADO', '2020-10-01', 29, 'M', 'SOLTERO', 0, 'FINANZAS', 'ANALISTA FINANCIERO', 4800000.00, 'INDEFINIDO', 'SEDE PRINCIPAL', 0, 0);

GO

-- =============================================
-- Insert Leave Requests (Solicitudes de Permiso)
-- =============================================

-- Request 1: AUTORIZADO - Vacaciones normales
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(2, 32, 'M', 'SOLTERO', 0, 'TECNOLOGIA', 'DESARROLLADOR SENIOR', 6, 6500000.00, 'INDEFINIDO', 'SEDE PRINCIPAL',
10, 5, 5, 'Vacaciones familiares programadas', 'VACACIONES', 'BAJO', 0,
'AUTORIZADO', 'Aprobado. Buen historial laboral.', 0.8750, 0, 1,
'2024-10-15 09:30:00', '2024-11-20', '2024-11-24', '2024-10-15 14:20:00', 1);

-- Request 2: AUTORIZADO - Permiso médico
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(3, 28, 'F', 'SOLTERA', 0, 'MARKETING', 'ANALISTA DE MARKETING', 4, 4200000.00, 'INDEFINIDO', 'SEDE PRINCIPAL',
5, 2, 2, 'Cita médica especializada programada', 'MEDICO', 'BAJO', 0,
'AUTORIZADO', 'Aprobado con presentación de certificado médico.', 0.9200, 0, 0,
'2024-10-20 10:15:00', '2024-11-05', '2024-11-06', '2024-10-20 16:45:00', 1);

-- Request 3: RECHAZADO - Muchos días en época crítica
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(4, 35, 'M', 'CASADO', 2, 'VENTAS', 'GERENTE DE VENTAS', 7, 7200000.00, 'INDEFINIDO', 'SEDE NORTE',
12, 10, 0, 'Viaje personal', 'PERSONAL', 'ALTO', 0,
'RECHAZADO', 'Rechazado. Época de cierre de trimestre, impacto alto en el área.', 0.3500, 0, 0,
'2024-11-01 11:00:00', '2024-12-15', '2024-12-24', '2024-11-01 15:30:00', 1);

-- Request 4: AUTORIZADO - Calamidad doméstica
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(5, 30, 'F', 'CASADA', 1, 'FINANZAS', 'CONTADOR', 5, 5500000.00, 'INDEFINIDO', 'SEDE PRINCIPAL',
8, 3, 3, 'Fallecimiento de familiar cercano', 'CALAMIDAD', 'MEDIO', 0,
'AUTORIZADO', 'Aprobado. Calamidad doméstica justificada.', 0.9500, 0, 2,
'2024-10-25 08:45:00', '2024-10-26', '2024-10-28', '2024-10-25 09:30:00', 1);

-- Request 5: RECHAZADO - Empleado con sanciones
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(6, 26, 'M', 'SOLTERO', 0, 'TECNOLOGIA', 'DESARROLLADOR JUNIOR', 3, 3800000.00, 'TERMINO FIJO', 'SEDE PRINCIPAL',
15, 7, 0, 'Vacaciones personales', 'VACACIONES', 'MEDIO', 1,
'RECHAZADO', 'Rechazado. Empleado con sanción activa y alto número de inasistencias.', 0.2100, 1, 3,
'2024-11-05 14:20:00', '2024-12-01', '2024-12-07', '2024-11-05 17:00:00', 1);

-- Request 6: AUTORIZADO - Vacaciones empleado con buen historial
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(7, 40, 'F', 'CASADA', 3, 'OPERACIONES', 'COORDINADOR DE OPERACIONES', 8, 6800000.00, 'INDEFINIDO', 'SEDE SUR',
6, 4, 4, 'Vacaciones de fin de año', 'VACACIONES', 'BAJO', 0,
'AUTORIZADO', 'Aprobado. Excelente desempeño y planificación anticipada.', 0.9100, 0, 0,
'2024-11-10 09:00:00', '2024-12-20', '2024-12-23', '2024-11-10 11:30:00', 1);

-- Request 7: PENDIENTE - Solicitud reciente
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin)
VALUES 
(8, 24, 'M', 'SOLTERO', 0, 'MARKETING', 'ASISTENTE DE MARKETING', 2, 2800000.00, 'TERMINO FIJO', 'SEDE PRINCIPAL',
3, 3, 'Asistir a curso de capacitación', 'ESTUDIO', 'BAJO', 0,
'PENDIENTE', 0.7800, 0, 1,
'2024-11-15 10:30:00', '2024-11-25', '2024-11-27');

-- Request 8: PENDIENTE - Solicitud médica
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin)
VALUES 
(9, 33, 'F', 'UNION LIBRE', 1, 'VENTAS', 'EJECUTIVO DE VENTAS', 5, 4500000.00, 'INDEFINIDO', 'SEDE NORTE',
7, 1, 'Procedimiento médico menor', 'MEDICO', 'BAJO', 0,
'PENDIENTE', 0.8900, 0, 0,
'2024-11-16 08:15:00', '2024-11-22', '2024-11-22');

-- Request 9: PENDIENTE - Vacaciones
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin)
VALUES 
(10, 29, 'M', 'SOLTERO', 0, 'FINANZAS', 'ANALISTA FINANCIERO', 4, 4800000.00, 'INDEFINIDO', 'SEDE PRINCIPAL',
5, 6, 'Vacaciones de navidad', 'VACACIONES', 'MEDIO', 0,
'PENDIENTE', 0.6500, 0, 0,
'2024-11-17 09:45:00', '2024-12-23', '2024-12-28');

-- Request 10: AUTORIZADO - Permiso personal corto
INSERT INTO solicitudes_permiso 
(empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo, antiguedad_anios, salario, tipo_contrato, sede, 
dias_ult_ano, dias_solicitados, dias_autorizados, motivo_texto, tipo_permiso_real, impacto_area, es_anomala, 
resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion, sanciones_activas, inasistencias, 
fecha_solicitud, fecha_inicio, fecha_fin, fecha_decision, decidido_por)
VALUES 
(3, 28, 'F', 'SOLTERA', 0, 'MARKETING', 'ANALISTA DE MARKETING', 4, 4200000.00, 'INDEFINIDO', 'SEDE PRINCIPAL',
5, 1, 1, 'Trámite personal urgente', 'PERSONAL', 'BAJO', 0,
'AUTORIZADO', 'Aprobado. Solicitud de un día con bajo impacto.', 0.8300, 0, 0,
'2024-11-12 13:20:00', '2024-11-18', '2024-11-18', '2024-11-12 15:00:00', 1);

GO

-- =============================================
-- Verification Queries
-- =============================================
PRINT '==============================================';
PRINT 'Seed data inserted successfully!';
PRINT '==============================================';
PRINT 'Total employees: ' + CAST((SELECT COUNT(*) FROM empleados) AS NVARCHAR(10));
PRINT 'Total leave requests: ' + CAST((SELECT COUNT(*) FROM solicitudes_permiso) AS NVARCHAR(10));
PRINT 'Pending requests: ' + CAST((SELECT COUNT(*) FROM solicitudes_permiso WHERE resultado_rrhh = 'PENDIENTE') AS NVARCHAR(10));
PRINT 'Approved requests: ' + CAST((SELECT COUNT(*) FROM solicitudes_permiso WHERE resultado_rrhh = 'AUTORIZADO') AS NVARCHAR(10));
PRINT 'Rejected requests: ' + CAST((SELECT COUNT(*) FROM solicitudes_permiso WHERE resultado_rrhh = 'RECHAZADO') AS NVARCHAR(10));
PRINT '==============================================';
PRINT 'Login credentials (all users):';
PRINT 'Password: Password123!';
PRINT 'RRHH User: maria.gonzalez@comfachoco.com';
PRINT 'Employee User: carlos.ramirez@comfachoco.com';
PRINT '==============================================';
