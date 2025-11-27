/**
 * Authentication Context
 * Manages user authentication state and provides auth functions
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            toast.success('¡Inicio de sesión exitoso!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            toast.success('¡Registro exitoso!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Error al registrarse';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info('Sesión cerrada');
    };

    const isRRHH = () => {
        return user?.rol === 'RRHH';
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isRRHH,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Protected Route Component
export const ProtectedRoute = ({ children, requireRRHH = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    if (requireRRHH && user.rol !== 'RRHH') {
        return (
            <div className="error-container">
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta página.</p>
            </div>
        );
    }

    return children;
};
