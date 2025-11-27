/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to request
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authorization denied.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user info to request
            req.user = {
                empleado_id: decoded.empleado_id,
                email: decoded.email,
                rol: decoded.rol,
                nombre: decoded.nombre
            };

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication.'
        });
    }
};

/**
 * Check if user has RRHH role
 */
const requireRRHH = (req, res, next) => {
    if (req.user.rol !== 'RRHH') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. RRHH role required.'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    requireRRHH
};
