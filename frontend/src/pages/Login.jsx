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
        <div
            className="auth-container"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
            }}
        >
            <div
                className="auth-card"
                style={{
                    width: '100%',
                    maxWidth: 420,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(4, 120, 87, 0.15)',
                    border: '1px solid #a7f3d0',
                    padding: 24
                }}
            >
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h1 style={{ margin: 0, fontSize: 24, color: '#064e3b' }}>🏢 Comfachoco</h1>
                    <h2 style={{ margin: '6px 0 8px', fontSize: 18, color: '#065f46' }}>Sistema de Permisos</h2>
                    <p style={{ margin: 0, color: '#047857' }}>Inicia sesión para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group" style={{ marginBottom: 12 }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: 6, color: '#065f46' }}>Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.email@comfachoco.com"
                            required
                            autoComplete="email"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid #a7f3d0',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 16 }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: 6, color: '#065f46' }}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid #a7f3d0',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: '#059669',
                            borderColor: '#047857',
                            color: 'white',
                            borderRadius: 8
                        }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: 12, textAlign: 'center' }}>
                    
                </div>

                <div className="demo-credentials" style={{ marginTop: 14, fontSize: 13, color: '#065f46' }}>
                    <p style={{ marginBottom: 6 }}><strong>Credenciales de prueba:</strong></p>
                    <p style={{ margin: 0 }}>RRHH: maria.gonzalez@comfachoco.com</p>
                    <p style={{ margin: 0 }}>Empleado: carlos.ramirez@comfachoco.com</p>
                    <p style={{ marginTop: 6 }}>Contraseña: Password123!</p>
                </div>

                <div className="card-actions" style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
                    <a href="http://localhost:3000/" className="btn btn-outline" style={{ borderColor: '#047857', color: '#065f46' }}>
                        ← Volver al Inicio
                    </a>
                    
                </div>
            </div>
        </div>
    );
};

export default Login;
