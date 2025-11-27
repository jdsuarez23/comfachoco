/**
 * ML Service Integration
 * Communicates with Python Flask ML service for comprehensive predictions
 * Includes all 7 ML models from Simulador_completo1.ipynb
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Get comprehensive ML predictions for a leave request
 * @param {number} empleado_id - Employee ID
 * @param {number} dias_solicitados - Days requested
 * @param {string} motivo_texto - Reason text
 * @param {string} fecha_inicio - Start date (YYYY-MM-DD)
 * @param {string} fecha_fin - End date (YYYY-MM-DD)
 * @returns {object} All ML predictions
 */
async function getPredictions(empleado_id, dias_solicitados, motivo_texto, fecha_inicio, fecha_fin) {
    try {
        console.log('📊 Calling ML service for comprehensive prediction...');

        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/predict`,
            {
                empleado_id,
                dias_solicitados,
                motivo_texto,
                fecha_inicio,
                fecha_fin
            },
            {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data) {
            console.log(`✓ ML predictions received:`);
            console.log(`  - Tipo permiso: ${response.data.tipo_permiso_real}`);
            console.log(`  - Anomalía: ${response.data.es_anomala ? 'Sí' : 'No'}`);
            console.log(`  - Impacto: ${response.data.impacto_area_numerico}`);
            console.log(`  - Prob. aprobación: ${(response.data.ml_probabilidad_aprobacion * 100).toFixed(2)}%`);
            console.log(`  - Decisión: ${response.data.resultado_rrhh}`);

            return {
                success: true,
                data: response.data
            };
        }

        console.warn('⚠ ML service returned invalid format');
        return {
            success: false,
            error: 'Invalid response format'
        };

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.warn('⚠ ML service not available (connection refused)');
        } else if (error.code === 'ETIMEDOUT') {
            console.warn('⚠ ML service timeout');
        } else {
            console.error('✗ ML service error:', error.message);
        }

        return {
            success: false,
            error: error.message || 'ML service unavailable'
        };
    }
}

/**
 * Trigger model retraining
 * @returns {object} Training result
 */
async function trainModels() {
    try {
        console.log('🔄 Triggering ML model training...');

        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/train`,
            {},
            { timeout: 300000 } // 5 minutes for training
        );

        console.log('✓ Model training completed');
        return {
            success: true,
            data: response.data
        };

    } catch (error) {
        console.error('✗ Model training failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if ML service is available
 * @returns {boolean} True if service is reachable
 */
async function checkMLServiceHealth() {
    try {
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/ml/health`,
            { timeout: 2000 }
        );
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

/**
 * Get model status and metrics
 * @returns {object} Model status
 */
async function getModelStatus() {
    try {
        const response = await axios.get(
            `${ML_SERVICE_URL}/api/ml/models/status`,
            { timeout: 5000 }
        );
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getPredictions instead
 */
async function predictApproval(empleado, solicitud) {
    const result = await getPredictions(
        empleado.empleado_id,
        solicitud.dias_solicitados,
        solicitud.motivo_texto,
        solicitud.fecha_inicio,
        solicitud.fecha_fin
    );

    if (result.success) {
        return result.data.ml_probabilidad_aprobacion;
    }
    return 0.5; // Default fallback
}

module.exports = {
    getPredictions,
    trainModels,
    checkMLServiceHealth,
    getModelStatus,
    predictApproval // Legacy support
};
