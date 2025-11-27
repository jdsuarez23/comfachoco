'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Backend base URL (ajusta si cambia puerto)
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya hay sesión previa, redirigir según rol
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && userRaw) {
      try {
        const u = JSON.parse(userRaw);
        if (u.rol === 'RRHH') {
          router.replace('/?view=dashboard-rrhh');
        } else {
          router.replace('/?view=dashboard');
        }
      } catch {
        router.replace('/?view=dashboard');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.message || 'Error de autenticación');
      }

      const data = await resp.json();
      const { token, user } = data;
      if (!token || !user) throw new Error('Respuesta inválida del servidor');

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirigir según rol (si hubiera vista RRHH específica puedes usar view=rrhh)
      if (user.rol === 'RRHH') {
        router.replace('/?view=dashboard-rrhh');
      } else {
        router.replace('/?view=dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-700 text-center mb-1">MiTiempo</h1>
        <p className="text-sm text-emerald-600 text-center mb-4">Sistema de Gestión de Permisos</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="usuario@comfachoco.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p><strong>Demo RRHH:</strong> maria.gonzalez@comfachoco.com</p>
          <p><strong>Demo Empleado:</strong> carlos.ramirez@comfachoco.com</p>
          <p><strong>Contraseña:</strong> Password123!</p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-emerald-600 text-sm hover:underline"
          >Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}
