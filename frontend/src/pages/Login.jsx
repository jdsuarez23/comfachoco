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
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
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
        <div className="auth-container" style={{ backgroundColor: '#f8fdfb' }}>
            <div className="auth-card" style={{ border: '1px solid #a7f3d0', borderRadius: 12 }}>
                <div className="auth-header" style={{ textAlign: 'center', color: '#065f46' }}>
                    <h1 style={{ color: '#065f46' }}>🏢 Comfachoco</h1>
                    <h2 style={{ color: '#065f46' }}>Sistema de Permisos</h2>
                    <p style={{ color: '#047857' }}>Inicia sesión para continuar</p>
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
                        style={{
                            backgroundColor: '#059669',
                            borderColor: '#047857',
                            color: 'white'
                        }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>

                <div className="demo-credentials" style={{ backgroundColor: '#ecfdf5', borderRadius: 8, padding: 8 }}>
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
