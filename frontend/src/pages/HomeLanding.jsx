import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeLanding = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5' }}>
        <h1 style={{ margin: 0, color: '#065f46', fontSize: '1.75rem', fontWeight: 700 }}>🏢 MiTiempo</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#059669', border: '1px solid #047857', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
          >
            Iniciar Sesión
          </button>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 16px' }}>
        <h2 style={{ fontSize: '2.4rem', color: '#065f46', marginBottom: 16 }}>Más tiempo para lo que realmente importa</h2>
        <p style={{ maxWidth: 720, fontSize: '1.1rem', lineHeight: 1.5, color: '#047857', marginBottom: 32 }}>
          Gestiona tus permisos laborales de forma rápida, inteligente y transparente. Clasificación automática con IA y modelos de Machine Learning para vacaciones, salud y otros tipos de permisos.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ backgroundColor: '#059669', border: '1px solid #047857', color: 'white', padding: '14px 28px', borderRadius: 10, fontSize: '1.125rem', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
        >
          Comenzar Ahora →
        </button>
      </main>
      <footer style={{ padding: '12px 24px', textAlign: 'center', fontSize: '0.875rem', backgroundColor: '#ecfdf5', color: '#047857', borderTop: '1px solid #d1fae5' }}>
        © {new Date().getFullYear()} MiTiempo · Sistema de Permisos
      </footer>
    </div>
  );
};

export default HomeLanding;
