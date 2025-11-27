/**
 * Leave Request Routes (Solicitudes)
 * Handles employee leave request creation and retrieval
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sql, getPool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { getPredictions } = require('../services/mlService');
const { classifyMotivo } = require('../services/aiClassifier');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

/**
 * @route   POST /api/solicitudes
 * @desc    Create new leave request (tipo_permiso is classified by ML Naive Bayes)
 * @access  Private (Employee)
 */
router.post('/', authMiddleware, upload.single('archivo_soporte'), [
    // tipo_permiso_real is NO LONGER required - ML Naive Bayes will classify it
    body('motivo_texto').trim().notEmpty().withMessage('Reason is required').isLength({ min: 20 }).withMessage('Reason must be at least 20 characters for ML analysis'),
    body('dias_solicitados').isInt({ min: 1 }).withMessage('Days requested must be at least 1').toInt(),
    body('fecha_inicio').isDate().withMessage('Valid start date is required'),
    body('fecha_fin').isDate().withMessage('Valid end date is required'),
    body('impacto_area').optional().isIn(['BAJO', 'MEDIO', 'ALTO']).withMessage('Invalid impact level'),
    body('dias_ult_ano').optional().isInt({ min: 0 }).toInt()
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            motivo_texto,
            dias_solicitados,
            fecha_inicio,
            fecha_fin,
            impacto_area,
            dias_ult_ano
        } = req.body;

        // Validate date range
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        const pool = await getPool();

        // Get employee data
        const empleadoResult = await pool.request()
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo,
                       salario, tipo_contrato, sede, sanciones_activas, inasistencias, fecha_ingreso
                FROM empleados
                WHERE empleado_id = @empleado_id
            `);

        if (empleadoResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const empleado = empleadoResult.recordset[0];

        // Calculate antiguedad
        const fechaIngreso = new Date(empleado.fecha_ingreso);
        const hoy = new Date();
        const antiguedad_anios = Math.floor((hoy - fechaIngreso) / (365.25 * 24 * 60 * 60 * 1000));

        // Get ML predictions (including tipo_permiso classification from Naive Bayes)
        console.log(`🤖 Requesting ML prediction for employee ${req.user.nombre}...`);
        console.log(`📝 Analyzing motivo: "${motivo_texto.substring(0, 50)}..."`);

        // Primero, clasificar el motivo con el agente OpenAI (si hay API key)
        let aiTipo = null;
        if (process.env.OPENAI_API_KEY) {
            const ai = await classifyMotivo(motivo_texto);
            if (ai.success) {
                aiTipo = ai.label;
                console.log(`🤖 AI Tipo sugerido: ${aiTipo}`);
            } else {
                console.warn('⚠ AI classifier fallback to ML:', ai.error);
            }
        }

        const mlResult = await getPredictions(
            req.user.empleado_id,
            dias_solicitados,
            motivo_texto,
            fecha_inicio,
            fecha_fin
        );

        let tipo_permiso_real;
        let ml_probabilidad;
        let es_anomala;
        let impacto_area_numerico;
        let ml_dias_sugeridos;

        if (mlResult.success) {
            // ML service returned predictions
            tipo_permiso_real = mlResult.data.tipo_permiso_real; // Predicción ML
            // Si el agente OpenAI dio una etiqueta válida, preferirla
            if (aiTipo) {
                tipo_permiso_real = aiTipo;
            }
            ml_probabilidad = mlResult.data.ml_probabilidad_aprobacion;
            es_anomala = mlResult.data.es_anomala;
            impacto_area_numerico = mlResult.data.impacto_area_numerico;
            ml_dias_sugeridos = mlResult.data.ml_dias_sugeridos;

            console.log(`✅ ML Classification: ${tipo_permiso_real}`);
            console.log(`📊 Approval probability: ${(ml_probabilidad * 100).toFixed(2)}%`);
        } else {
            // ML service failed - use fallback
            console.warn('⚠ ML service unavailable, using fallback classification');
            // Fallback: usar AI si está disponible
            tipo_permiso_real = aiTipo || 'PERSONAL';
            ml_probabilidad = 0.5;
            es_anomala = dias_solicitados > 15;
            impacto_area_numerico = null;
            ml_dias_sugeridos = null;
        }

        // Insert leave request
        const result = await pool.request()
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .input('edad', sql.Int, empleado.edad)
            .input('genero', sql.NVarChar, empleado.genero)
            .input('estado_civil', sql.NVarChar, empleado.estado_civil)
            .input('numero_hijos', sql.Int, empleado.numero_hijos)
            .input('area', sql.NVarChar, empleado.area)
            .input('cargo', sql.NVarChar, empleado.cargo)
            .input('antiguedad_anios', sql.Int, antiguedad_anios)
            .input('salario', sql.Decimal(12, 2), empleado.salario)
            .input('tipo_contrato', sql.NVarChar, empleado.tipo_contrato)
            .input('sede', sql.NVarChar, empleado.sede)
            .input('dias_ult_ano', sql.Int, dias_ult_ano || 0)
            .input('dias_solicitados', sql.Int, dias_solicitados)
            .input('motivo_texto', sql.NVarChar, motivo_texto)
            .input('tipo_permiso_real', sql.NVarChar, tipo_permiso_real) // From ML Naive Bayes
            .input('impacto_area', sql.NVarChar, impacto_area || 'BAJO')
            .input('impacto_area_numerico', sql.Decimal(5, 2), impacto_area_numerico)
            .input('es_anomala', sql.Bit, es_anomala)
            .input('ml_probabilidad_aprobacion', sql.Decimal(5, 4), ml_probabilidad)
            .input('ml_dias_sugeridos', sql.Int, ml_dias_sugeridos)
            .input('sanciones_activas', sql.Bit, empleado.sanciones_activas)
            .input('inasistencias', sql.Int, empleado.inasistencias)
            .input('fecha_inicio', sql.Date, fecha_inicio)
            .input('fecha_fin', sql.Date, fecha_fin)
            .query(`
                INSERT INTO solicitudes_permiso (
                    empleado_id, edad, genero, estado_civil, numero_hijos, area, cargo,
                    antiguedad_anios, salario, tipo_contrato, sede, dias_ult_ano, dias_solicitados,
                    motivo_texto, tipo_permiso_real, impacto_area, impacto_area_numerico, es_anomala,
                    ml_probabilidad_aprobacion, ml_dias_sugeridos, sanciones_activas, inasistencias,
                    fecha_inicio, fecha_fin, resultado_rrhh
                )
                OUTPUT INSERTED.*
                VALUES (
                    @empleado_id, @edad, @genero, @estado_civil, @numero_hijos, @area, @cargo,
                    @antiguedad_anios, @salario, @tipo_contrato, @sede, @dias_ult_ano, @dias_solicitados,
                    @motivo_texto, @tipo_permiso_real, @impacto_area, @impacto_area_numerico, @es_anomala,
                    @ml_probabilidad_aprobacion, @ml_dias_sugeridos, @sanciones_activas, @inasistencias,
                    @fecha_inicio, @fecha_fin, 'PENDIENTE'
                )
            `);

        const newSolicitud = result.recordset[0];

        // If file was uploaded, update the record with file path
        if (req.file) {
            await pool.request()
                .input('solicitud_id', sql.Int, newSolicitud.solicitud_id)
                .input('archivo_soporte', sql.NVarChar, req.file.filename)
                .query(`
                    UPDATE solicitudes_permiso
                    SET archivo_soporte = @archivo_soporte
                    WHERE solicitud_id = @solicitud_id
                `);
            newSolicitud.archivo_soporte = req.file.filename;
        }

        // Log notification to RRHH (simulated email)
        console.log('📧 [SIMULATED EMAIL] New leave request notification:');
        console.log(`   To: RRHH Department`);
        console.log(`   Subject: New Leave Request from ${req.user.nombre}`);
        console.log(`   Request ID: ${newSolicitud.solicitud_id}`);
        console.log(`   Type (ML Classified): ${tipo_permiso_real}`);
        console.log(`   Days: ${dias_solicitados}`);
        console.log(`   ML Probability: ${(ml_probabilidad * 100).toFixed(2)}%`);
        console.log(`   Anomalous: ${es_anomala ? 'YES' : 'NO'}`)

            ;

        res.status(201).json({
            success: true,
            message: 'Leave request created successfully',
            solicitud: newSolicitud,
            ml_prediction: {
                tipo_permiso_clasificado: tipo_permiso_real,
                probabilidad_aprobacion: ml_probabilidad,
                porcentaje: `${(ml_probabilidad * 100).toFixed(2)}%`,
                es_anomala: es_anomala
            }
        });

    } catch (error) {
        console.error('Create solicitud error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating leave request',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/solicitudes/mis-solicitudes
 * @desc    Get current user's leave requests
 * @access  Private (Employee)
 */
router.get('/mis-solicitudes', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT solicitud_id, tipo_permiso_real, motivo_texto, dias_solicitados, 
                       dias_autorizados, fecha_inicio, fecha_fin, fecha_solicitud,
                       resultado_rrhh, comentario_rrhh, ml_probabilidad_aprobacion,
                       es_anomala, impacto_area
                FROM solicitudes_permiso
                WHERE empleado_id = @empleado_id
                ORDER BY fecha_solicitud DESC
            `);

        res.json({
            success: true,
            count: result.recordset.length,
            solicitudes: result.recordset
        });

    } catch (error) {
        console.error('Get mis-solicitudes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching requests'
        });
    }
});

/**
 * @route   GET /api/solicitudes/:id
 * @desc    Get specific leave request details
 * @access  Private (Employee - own requests only)
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('solicitud_id', sql.Int, req.params.id)
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT s.*, e.nombre as empleado_nombre
                FROM solicitudes_permiso s
                JOIN empleados e ON s.empleado_id = e.empleado_id
                WHERE s.solicitud_id = @solicitud_id 
                  AND (s.empleado_id = @empleado_id OR @empleado_id IN (
                      SELECT empleado_id FROM empleados WHERE rol = 'RRHH'
                  ))
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or access denied'
            });
        }

        res.json({
            success: true,
            solicitud: result.recordset[0]
        });

    } catch (error) {
        console.error('Get solicitud error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching request'
        });
    }
});

/**
 * @route   GET /api/solicitudes/:id/details
 * @desc    Get complete request details with employee info
 * @access  Private (RRHH or request owner)
 */
router.get('/:id/details', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('solicitud_id', sql.Int, req.params.id)
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT 
                    s.*,
                    e.nombre as empleado_nombre,
                    e.email as empleado_email,
                    e.area as empleado_area,
                    e.cargo as empleado_cargo,
                    e.fecha_ingreso,
                    e.tipo_contrato as empleado_tipo_contrato,
                    e.sede as empleado_sede
                FROM solicitudes_permiso s
                JOIN empleados e ON s.empleado_id = e.empleado_id
                WHERE s.solicitud_id = @solicitud_id 
                  AND (s.empleado_id = @empleado_id OR @empleado_id IN (
                      SELECT empleado_id FROM empleados WHERE rol = 'RRHH'
                  ))
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or access denied'
            });
        }

        const solicitud = result.recordset[0];

        // Calculate antiguedad
        const fechaIngreso = new Date(solicitud.fecha_ingreso);
        const hoy = new Date();
        const antiguedad_anios = Math.floor((hoy - fechaIngreso) / (365.25 * 24 * 60 * 60 * 1000));
        solicitud.antiguedad_anios_actual = antiguedad_anios;

        res.json({
            success: true,
            solicitud
        });

    } catch (error) {
        console.error('Get solicitud details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching request details'
        });
    }
});

/**
 * @route   GET /api/solicitudes/:id/download
 * @desc    Download support file for a request
 * @access  Private (RRHH or request owner)
 */
router.get('/:id/download', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        // Get request with file info
        const result = await pool.request()
            .input('solicitud_id', sql.Int, req.params.id)
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT archivo_soporte, empleado_id
                FROM solicitudes_permiso
                WHERE solicitud_id = @solicitud_id 
                  AND (empleado_id = @empleado_id OR @empleado_id IN (
                      SELECT empleado_id FROM empleados WHERE rol = 'RRHH'
                  ))
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found or access denied'
            });
        }

        const solicitud = result.recordset[0];

        if (!solicitud.archivo_soporte) {
            return res.status(404).json({
                success: false,
                message: 'No support file attached to this request'
            });
        }

        const filePath = path.join(__dirname, '../uploads', solicitud.archivo_soporte);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Send file
        res.download(filePath);

    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error downloading file'
        });
    }
});

/**
 * @route   DELETE /api/solicitudes/:id
 * @desc    Delete a leave request (owner only and if PENDIENTE)
 * @access  Private (Employee)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        // Ensure the request belongs to the current user and is pending
        const check = await pool.request()
            .input('solicitud_id', sql.Int, req.params.id)
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT solicitud_id, empleado_id, resultado_rrhh
                FROM solicitudes_permiso
                WHERE solicitud_id = @solicitud_id AND empleado_id = @empleado_id
            `);

        if (check.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        const solicitud = check.recordset[0];
        if (solicitud.resultado_rrhh !== 'PENDIENTE') {
            return res.status(400).json({ success: false, message: 'Solo se puede eliminar solicitudes PENDIENTES' });
        }

        await pool.request()
            .input('solicitud_id', sql.Int, req.params.id)
            .query('DELETE FROM solicitudes_permiso WHERE solicitud_id = @solicitud_id');

        res.json({ success: true, message: 'Solicitud eliminada' });
    } catch (error) {
        console.error('Delete solicitud error:', error);
        res.status(500).json({ success: false, message: 'Error eliminando solicitud' });
    }
});

module.exports = router;
