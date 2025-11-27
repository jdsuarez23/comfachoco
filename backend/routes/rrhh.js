/**
 * RRHH Management Routes
 * Handles leave request approval/rejection and administrative functions
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sql, getPool } = require('../config/database');
const { authMiddleware, requireRRHH } = require('../middleware/auth');

// All routes require RRHH role
router.use(authMiddleware, requireRRHH);

/**
 * @route   GET /api/rrhh/solicitudes
 * @desc    Get all leave requests (with optional filters)
 * @access  Private (RRHH only)
 */
router.get('/solicitudes', async (req, res) => {
    try {
        const { resultado, tipo_permiso, empleado_id, fecha_desde, fecha_hasta } = req.query;

        const pool = await getPool();
        let query = `
            SELECT s.*, e.nombre as empleado_nombre, e.email as empleado_email
            FROM solicitudes_permiso s
            JOIN empleados e ON s.empleado_id = e.empleado_id
            WHERE 1=1
        `;

        const request = pool.request();

        // Apply filters
        if (resultado) {
            query += ' AND s.resultado_rrhh = @resultado';
            request.input('resultado', sql.NVarChar, resultado);
        }

        if (tipo_permiso) {
            query += ' AND s.tipo_permiso_real = @tipo_permiso';
            request.input('tipo_permiso', sql.NVarChar, tipo_permiso);
        }

        if (empleado_id) {
            query += ' AND s.empleado_id = @empleado_id';
            request.input('empleado_id', sql.Int, parseInt(empleado_id));
        }

        if (fecha_desde) {
            query += ' AND s.fecha_solicitud >= @fecha_desde';
            request.input('fecha_desde', sql.DateTime2, fecha_desde);
        }

        if (fecha_hasta) {
            query += ' AND s.fecha_solicitud <= @fecha_hasta';
            request.input('fecha_hasta', sql.DateTime2, fecha_hasta);
        }

        query += ' ORDER BY s.fecha_solicitud DESC';

        const result = await request.query(query);

        res.json({
            success: true,
            count: result.recordset.length,
            solicitudes: result.recordset
        });

    } catch (error) {
        console.error('Get RRHH solicitudes error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching requests'
        });
    }
});

/**
 * @route   PUT /api/rrhh/solicitudes/:id/aprobar
 * @desc    Approve leave request
 * @access  Private (RRHH only)
 */
router.put('/solicitudes/:id/aprobar', [
    body('dias_autorizados').isInt({ min: 1 }).withMessage('Authorized days must be at least 1'),
    body('comentario_rrhh').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { dias_autorizados, comentario_rrhh } = req.body;
        const solicitud_id = req.params.id;

        const pool = await getPool();

        // Check if request exists and is pending
        const checkResult = await pool.request()
            .input('solicitud_id', sql.Int, solicitud_id)
            .query(`
                SELECT solicitud_id, resultado_rrhh, dias_solicitados, empleado_id
                FROM solicitudes_permiso
                WHERE solicitud_id = @solicitud_id
            `);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const solicitud = checkResult.recordset[0];

        if (solicitud.resultado_rrhh !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: `Request already ${solicitud.resultado_rrhh.toLowerCase()}`
            });
        }

        // Validate authorized days
        if (dias_autorizados > solicitud.dias_solicitados) {
            return res.status(400).json({
                success: false,
                message: 'Authorized days cannot exceed requested days'
            });
        }

        // Update request to approved
        const updateResult = await pool.request()
            .input('solicitud_id', sql.Int, solicitud_id)
            .input('dias_autorizados', sql.Int, dias_autorizados)
            .input('comentario_rrhh', sql.NVarChar, comentario_rrhh || 'Aprobado')
            .input('decidido_por', sql.Int, req.user.empleado_id)
            .query(`
                UPDATE solicitudes_permiso
                SET resultado_rrhh = 'AUTORIZADO',
                    dias_autorizados = @dias_autorizados,
                    comentario_rrhh = @comentario_rrhh,
                    fecha_decision = GETDATE(),
                    decidido_por = @decidido_por
                OUTPUT INSERTED.*
                WHERE solicitud_id = @solicitud_id
            `);

        const updatedSolicitud = updateResult.recordset[0];

        // Log notification (simulated email)
        console.log('📧 [SIMULATED EMAIL] Leave request approved notification:');
        console.log(`   To: Employee ID ${solicitud.empleado_id}`);
        console.log(`   Subject: Your Leave Request Has Been Approved`);
        console.log(`   Request ID: ${solicitud_id}`);
        console.log(`   Days Authorized: ${dias_autorizados}`);
        console.log(`   Comment: ${comentario_rrhh || 'Aprobado'}`);

        res.json({
            success: true,
            message: 'Leave request approved successfully',
            solicitud: updatedSolicitud
        });

    } catch (error) {
        console.error('Approve solicitud error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error approving request'
        });
    }
});

/**
 * @route   PUT /api/rrhh/solicitudes/:id/rechazar
 * @desc    Reject leave request
 * @access  Private (RRHH only)
 */
router.put('/solicitudes/:id/rechazar', [
    body('comentario_rrhh').trim().notEmpty().withMessage('Rejection reason is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { comentario_rrhh } = req.body;
        const solicitud_id = req.params.id;

        const pool = await getPool();

        // Check if request exists and is pending
        const checkResult = await pool.request()
            .input('solicitud_id', sql.Int, solicitud_id)
            .query(`
                SELECT solicitud_id, resultado_rrhh, empleado_id
                FROM solicitudes_permiso
                WHERE solicitud_id = @solicitud_id
            `);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const solicitud = checkResult.recordset[0];

        if (solicitud.resultado_rrhh !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: `Request already ${solicitud.resultado_rrhh.toLowerCase()}`
            });
        }

        // Update request to rejected
        const updateResult = await pool.request()
            .input('solicitud_id', sql.Int, solicitud_id)
            .input('comentario_rrhh', sql.NVarChar, comentario_rrhh)
            .input('decidido_por', sql.Int, req.user.empleado_id)
            .query(`
                UPDATE solicitudes_permiso
                SET resultado_rrhh = 'RECHAZADO',
                    dias_autorizados = 0,
                    comentario_rrhh = @comentario_rrhh,
                    fecha_decision = GETDATE(),
                    decidido_por = @decidido_por
                OUTPUT INSERTED.*
                WHERE solicitud_id = @solicitud_id
            `);

        const updatedSolicitud = updateResult.recordset[0];

        // Log notification (simulated email)
        console.log('📧 [SIMULATED EMAIL] Leave request rejected notification:');
        console.log(`   To: Employee ID ${solicitud.empleado_id}`);
        console.log(`   Subject: Your Leave Request Has Been Rejected`);
        console.log(`   Request ID: ${solicitud_id}`);
        console.log(`   Reason: ${comentario_rrhh}`);

        res.json({
            success: true,
            message: 'Leave request rejected',
            solicitud: updatedSolicitud
        });

    } catch (error) {
        console.error('Reject solicitud error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error rejecting request'
        });
    }
});

/**
 * @route   GET /api/rrhh/estadisticas
 * @desc    Get aggregated statistics
 * @access  Private (RRHH only)
 */
router.get('/estadisticas', async (req, res) => {
    try {
        const pool = await getPool();

        // Get various statistics
        const stats = await pool.request().query(`
            SELECT 
                COUNT(*) as total_solicitudes,
                SUM(CASE WHEN resultado_rrhh = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN resultado_rrhh = 'AUTORIZADO' THEN 1 ELSE 0 END) as autorizadas,
                SUM(CASE WHEN resultado_rrhh = 'RECHAZADO' THEN 1 ELSE 0 END) as rechazadas,
                SUM(CASE WHEN es_anomala = 1 THEN 1 ELSE 0 END) as anomalas,
                AVG(CAST(ml_probabilidad_aprobacion AS FLOAT)) as promedio_ml_probabilidad,
                AVG(CAST(dias_solicitados AS FLOAT)) as promedio_dias_solicitados
            FROM solicitudes_permiso
        `);

        const byType = await pool.request().query(`
            SELECT tipo_permiso_real, COUNT(*) as cantidad
            FROM solicitudes_permiso
            GROUP BY tipo_permiso_real
            ORDER BY cantidad DESC
        `);

        const byArea = await pool.request().query(`
            SELECT area, COUNT(*) as cantidad
            FROM solicitudes_permiso
            WHERE area IS NOT NULL
            GROUP BY area
            ORDER BY cantidad DESC
        `);

        res.json({
            success: true,
            estadisticas: {
                general: stats.recordset[0],
                por_tipo: byType.recordset,
                por_area: byArea.recordset
            }
        });

    } catch (error) {
        console.error('Get estadisticas error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching statistics'
        });
    }
});

/**
 * @route   GET /api/rrhh/export-csv
 * @desc    Export leave requests to CSV format
 * @access  Private (RRHH only)
 */
router.get('/export-csv', async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT 
                s.solicitud_id,
                e.nombre as empleado_nombre,
                e.email as empleado_email,
                s.edad, s.genero, s.estado_civil, s.numero_hijos,
                s.area, s.cargo, s.antiguedad_anios, s.salario,
                s.tipo_contrato, s.sede,
                s.tipo_permiso_real, s.dias_solicitados, s.dias_autorizados,
                s.motivo_texto, s.impacto_area,
                s.resultado_rrhh, s.comentario_rrhh,
                s.ml_probabilidad_aprobacion, s.es_anomala,
                s.sanciones_activas, s.inasistencias,
                s.fecha_solicitud, s.fecha_inicio, s.fecha_fin, s.fecha_decision
            FROM solicitudes_permiso s
            JOIN empleados e ON s.empleado_id = e.empleado_id
            ORDER BY s.fecha_solicitud DESC
        `);

        // Convert to CSV
        const data = result.recordset;

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No data to export'
            });
        }

        // Create CSV header
        const headers = Object.keys(data[0]).join(',');

        // Create CSV rows
        const rows = data.map(row => {
            return Object.values(row).map(value => {
                // Handle null values and escape commas
                if (value === null) return '';
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=solicitudes_${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error exporting data'
        });
    }
});

module.exports = router;
