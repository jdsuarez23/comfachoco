import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container" style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5' }}>
        <h1 style={{ margin: 0, color: '#065f46', fontSize: '1.75rem', fontWeight: 700 }}>🏢 Comfachoco</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              style={{ backgroundColor: '#059669', border: '1px solid #047857', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
            >
              Iniciar Sesión
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={() => navigate(user?.rol === 'RRHH' ? '/rrhh' : '/dashboard')}
              style={{ backgroundColor: '#10B981', border: '1px solid #059669', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
            >
              Ir al Panel
            </button>
          )}
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
        <h2 style={{ fontSize: '2.25rem', color: '#065f46', marginBottom: 16 }}>Sistema de Gestión de Permisos</h2>
        <p style={{ maxWidth: 680, fontSize: '1.125rem', lineHeight: 1.5, color: '#047857', marginBottom: 32 }}>
          Administra solicitudes de permisos laborales de forma inteligente con modelos de Machine Learning y clasificación asistida por IA. Optimiza la autorización de licencias médicas, vacaciones y otros permisos, reduciendo tiempos y manteniendo transparencia.
        </p>
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#059669', border: '1px solid #047857', color: 'white', padding: '14px 28px', borderRadius: 10, fontSize: '1.125rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
          >
            Comenzar Ahora →
          </button>
        )}
        {isAuthenticated && (
          <div style={{ color: '#065f46', fontSize: '1rem', marginTop: 24 }}>
            Bienvenido {user?.nombre}. Usa el botón para ir a tu panel.
          </div>
        )}
      </main>
      <footer style={{ padding: '12px 24px', textAlign: 'center', fontSize: '0.875rem', backgroundColor: '#ecfdf5', color: '#047857', borderTop: '1px solid #d1fae5' }}>
        © {new Date().getFullYear()} Comfachoco · Sistema de Permisos
      </footer>
    </div>
  );
};

export default Home;
