/**
 * Login Page
 * User authentication form
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Get user from localStorage to check role
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                // Redirect based on role
                if (user.rol === 'RRHH') {
                    navigate('/rrhh');
                } else {
                    navigate('/dashboard');
                }
            } else {
                navigate('/dashboard');
            }
        }

        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🏢 Comfachoco</h1>
                    <h2>Sistema de Permisos</h2>
                    <p>Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.email@comfachoco.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>

                <div className="demo-credentials">
                    <p><strong>Credenciales de prueba:</strong></p>
                    <p>RRHH: maria.gonzalez@comfachoco.com</p>
                    <p>Empleado: carlos.ramirez@comfachoco.com</p>
                    <p>Contraseña: Password123!</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
