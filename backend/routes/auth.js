/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sql, getPool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new employee (optional feature)
 * @access  Public
 */
router.post('/register', [
    body('nombre').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('fecha_ingreso').isDate().withMessage('Valid hire date is required')
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

        const { nombre, email, password, fecha_ingreso, edad, genero, estado_civil,
            numero_hijos, area, cargo, salario, tipo_contrato, sede } = req.body;

        const pool = await getPool();

        // Check if email already exists
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT empleado_id FROM empleados WHERE email = @email');

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);

        // Insert new employee
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('hashed_password', sql.NVarChar, hashed_password)
            .input('rol', sql.NVarChar, 'EMPLEADO')
            .input('fecha_ingreso', sql.Date, fecha_ingreso)
            .input('edad', sql.Int, edad || null)
            .input('genero', sql.NVarChar, genero || null)
            .input('estado_civil', sql.NVarChar, estado_civil || null)
            .input('numero_hijos', sql.Int, numero_hijos || 0)
            .input('area', sql.NVarChar, area || null)
            .input('cargo', sql.NVarChar, cargo || null)
            .input('salario', sql.Decimal(12, 2), salario || null)
            .input('tipo_contrato', sql.NVarChar, tipo_contrato || null)
            .input('sede', sql.NVarChar, sede || null)
            .query(`
                INSERT INTO empleados (nombre, email, hashed_password, rol, fecha_ingreso, edad, genero, 
                                      estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede)
                OUTPUT INSERTED.empleado_id, INSERTED.nombre, INSERTED.email, INSERTED.rol
                VALUES (@nombre, @email, @hashed_password, @rol, @fecha_ingreso, @edad, @genero, 
                        @estado_civil, @numero_hijos, @area, @cargo, @salario, @tipo_contrato, @sede)
            `);

        const newUser = result.recordset[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                empleado_id: newUser.empleado_id,
                email: newUser.email,
                rol: newUser.rol,
                nombre: newUser.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Employee registered successfully',
            token,
            user: {
                empleado_id: newUser.empleado_id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
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

        const { email, password } = req.body;

        const pool = await getPool();

        // Find user by email
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(`
                SELECT empleado_id, nombre, email, hashed_password, rol, activo
                FROM empleados
                WHERE email = @email
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.recordset[0];

        // Check if user is active
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.hashed_password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                empleado_id: user.empleado_id,
                email: user.email,
                rol: user.rol,
                nombre: user.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                empleado_id: user.empleado_id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('empleado_id', sql.Int, req.user.empleado_id)
            .query(`
                SELECT empleado_id, nombre, email, rol, fecha_ingreso, edad, genero, 
                       estado_civil, numero_hijos, area, cargo, salario, tipo_contrato, sede,
                       sanciones_activas, inasistencias
                FROM empleados
                WHERE empleado_id = @empleado_id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: result.recordset[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    }
});

module.exports = router;
