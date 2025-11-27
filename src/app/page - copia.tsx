'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Bell, ChartPie, CircleCheck, Settings, Heart, CheckCircle, Brain, TrendingUp, Target, Zap, Database, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
    modelo: 'regresion-lineal'
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigateToHome = () => setCurrentView('home');
  const navigateToMetodologia = () => setCurrentView('metodologia');
  const navigateToSimulator = () => setCurrentView('simulator');
  const navigateToDashboard = () => setCurrentView('dashboard');
  const navigateToML = () => setCurrentView('machine-learning');
  const navigateToEquipo = () => setCurrentView('equipo');
  const navigateToColab = () => setCurrentView('colab');
  const navigateToContacto = () => setCurrentView('contacto');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setIsVisible(true);
    }
  }, [mounted]);

  const handleSimulation = async () => {
    setIsProcessing(true);
    
    // Simulación básica según el modelo seleccionado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let result = { aprobado: false, tiempoEstimado: 0, razon: '' };
    
    switch (formData.modelo) {
      case 'regresion-lineal':
        // Lógica simple basada en días disponibles y antigüedad
        result.aprobado = Math.random() > 0.7; // 70% de probabilidad
        result.tiempoEstimado = result.aprobado ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 2;
        result.razon = result.aprobado ? 'Perfil favorable y disponibilidad de días' : 'No cumple con los criterios mínimos';
        break;
        
      case 'regresion-logistica':
        // Lógica basada en tipo de permiso y historial
        const probabilidadVacaciones = 0.85;
        const probabilidadPersonal = 0.60;
        const probabilidadEnfermedad = 0.40;
        
        if (formData.tipo === 'vacaciones') {
          result.aprobado = Math.random() < probabilidadVacaciones;
          result.tiempoEstimado = result.aprobado ? 1 : 3;
          result.razon = result.aprobado ? 'Vacaciones disponibles y buen historial' : 'No hay suficientes días disponibles';
        } else if (formData.tipo === 'personal') {
          result.aprobado = Math.random() < probabilidadPersonal;
          result.tiempoEstimado = result.aprobado ? 2 : 4;
          result.razon = result.aprobado ? 'Permiso personal razonable' : 'Falta justificación o hay conflictos';
        } else {
          result.aprobado = Math.random() < probabilidadEnfermedad;
          result.tiempoEstimado = result.aprobado ? 3 : 5;
          result.razon = result.aprobado ? 'Enfermedad con restricciones' : 'No se aprueba por políticas internas';
        }
        break;
        
      case 'k-means':
        // Agrupación por patrones de comportamiento
        const clusterUsuario = Math.floor(Math.random() * 3);
        const clusterDisponible = clusterUsuario === 1; // Cluster con más disponibilidad
        result.aprobado = clusterDisponible;
        result.tiempoEstimado = result.aprobado ? 1 : 2;
        result.razon = result.aprobado ? 'Usuario en cluster con disponibilidad' : 'Cluster con alta demanda';
        break;
        
      case 'naive-bayes':
        // Clasificación probabilística
        const features = formData.tipo === 'vacaciones' ? ['vacaciones', 'historial_limpio'] : 
                       formData.tipo === 'personal' ? ['personal', 'confiable'] : ['urgente', 'conflicto'];
        const probabilidad = features.reduce((acc, feature) => {
          return acc * 0.8; // Probabilidad acumulada
        }, 0.3);
        
        result.aprobado = probabilidad > 0.6;
        result.tiempoEstimado = result.aprobado ? 1 : 2;
        result.razon = result.aprobado ? 'Alta probabilidad basada en características' : 'Baja probabilidad para este tipo de permiso';
        break;
        
      case 'knn':
        // Basado en usuarios similares
        const vecinosSimilares = Math.floor(Math.random() * 5) + 3;
        const usuariosAprobados = Math.floor(Math.random() * 8) + 2;
        result.aprobado = vecinosSimilares > 6;
        result.tiempoEstimado = result.aprobado ? 1 : 2;
        result.razon = result.aprobado ? 'Usuarios similares fueron aprobados' : 'Patrón diferente a usuarios aprobados';
        break;
        
      case 'arbol-decisiones':
        // Reglas de decisión claras
        const diasDisponibles = formData.tipo === 'vacaciones' ? 15 : 
                              formData.tipo === 'personal' ? 5 : 3;
        const antiguedad = Math.floor(Math.random() * 10) + 1;
        
        result.aprobado = diasDisponibles >= 5 && antiguedad < 5;
        result.tiempoEstimado = result.aprobado ? 1 : 3;
        result.razon = result.aprobado ? 'Cumple con reglas de negocio' : 'No cumple políticas internas';
        break;
        
      case 'svm':
        // Clasificación con margen máximo
        const score = Math.random();
        result.aprobado = score > 0.65;
        result.tiempoEstimado = result.aprobado ? 1 : 2;
        result.razon = result.aprobado ? 'Clasificación con alta precisión' : 'No supera el umbral de decisión';
        break;
        
      default:
        result.aprobado = Math.random() > 0.5;
        result.tiempoEstimado = result.aprobado ? 2 : 4;
        result.razon = 'Decisión basada en criterios internos';
    }
    
    setSimulationResult(result);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-white shadow-sm border-b transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo-mitiempo.png" 
                alt="MiTiempo Logo" 
                className="w-12 h-12 rounded-lg transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-1">
              {/* Menu Horizontal */}
              <div className="flex items-center space-x-1">
                <Button 
                  onClick={navigateToHome}
                  className={`${currentView === 'home' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Inicio
                </Button>
                <Button 
                  onClick={navigateToMetodologia}
                  className={`${currentView === 'metodologia' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Metodología
                </Button>
                <Button 
                  onClick={navigateToML}
                  className={`${currentView === 'machine-learning' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Modelos de ML
                </Button>
                <Button 
                  onClick={navigateToSimulator}
                  className={`${currentView === 'simulator' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Simulador
                </Button>
                <Button 
                  onClick={navigateToDashboard}
                  className={`${currentView === 'dashboard' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={navigateToEquipo}
                  className={`${currentView === 'equipo' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Equipo
                </Button>
                <Button 
                  onClick={navigateToColab}
                  className={`${currentView === 'colab' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Colab
                </Button>
                <Button 
                  onClick={navigateToContacto}
                  className={`${currentView === 'contacto' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  Contáctanos
                </Button>
                <Button 
                  onClick={() => alert('Función de búsqueda próximamente')}
                  className={`${currentView === 'busqueda' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm px-3 py-2`}
                >
                  🔍
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-3">
        {/* Home View */}
        {currentView === 'home' && (
          <>
            <section className={`text-center py-4 md:py-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="max-w-4xl mx-auto">
                <div className="mb-3">
                  <img 
                    src="/logo-mitiempo.png" 
                    alt="MiTiempo Logo" 
                    className="w-32 h-32 mx-auto mb-4"
                  />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block hover:bg-emerald-100 transition-colors duration-300">
                    Más tiempo para lo que realmente importa
                  </span>
                </h1>
                
                <p className="text-base text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
                  Olvídate del papeleo y los correos interminables. Gestiona tus permisos en segundos, 
                  desde cualquier dispositivo.
                </p>
                
                <Button 
                  size="lg" 
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-200"
                  onClick={() => setCurrentView('simulator')}
                >
                  Solicitar Permiso Ahora
                </Button>
              </div>
            </section>

            {/* Features Cards */}
            <section className="py-4">
              <div className="grid md:grid-cols-3 gap-3 max-w-6xl mx-auto">
                <Card className={`text-center p-4 hover:shadow-xl transition-all duration-500 border-emerald-100 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: '200ms'}}>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                      <CalendarDays className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Solicitud en segundos</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 text-sm">
                      24/7, sin papeleo, desde tu celular o PC.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className={`text-center p-4 hover:shadow-xl transition-all duration-500 border-emerald-100 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: '400ms'}}>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                      <Bell className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Notificaciones instantáneas</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 text-sm">
                      Tu jefe recibe la alerta y aprueba con un clic.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className={`text-center p-4 hover:shadow-xl transition-all duration-500 border-emerald-100 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: '600ms'}}>
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                      <ChartPie className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Calendario inteligente</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 text-sm">
                      Evita solapamientos y planifica en equipo.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Reto Comfachocó Section */}
            <section className={`py-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: '800ms'}}>
              <Card className="max-w-4xl mx-auto border-emerald-100 hover:shadow-lg transition-shadow duration-500">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl md:text-4xl text-gray-800 mb-2">
                    ¿Qué es el <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg hover:bg-emerald-100 transition-colors duration-300">Reto Comfachocó?</span>
                  </CardTitle>
                  <CardDescription className="text-lg text-emerald-600 font-semibold">
                    Simplificar, Automatizar y Humanizar la Gestión del Tiempo
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 leading-relaxed text-sm">
                    En muchas organizaciones, solicitar vacaciones o permisos sigue siendo un proceso manual, 
                    lento y propenso a errores. Este reto busca crear una solución digital innovadora que 
                    permita a los empleados gestionar sus permisos de manera{' '}
                    <span className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors duration-300">fácil, rápida y transparente</span>.
                  </p>

                  {/* Objectives */}
                  <div className="grid md:grid-cols-3 gap-3">
                    <Card className="border-emerald-50 hover:shadow-md hover:scale-105 transition-all duration-300">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                          <CircleCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-emerald-700 mb-1 flex items-center justify-center text-sm">
                          <CircleCheck className="w-3 h-3 mr-1" />
                          Simplificar
                        </h3>
                        <p className="text-xs text-gray-600">
                          Procesos intuitivos y fáciles de usar para todos los empleados.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-50 hover:shadow-md hover:scale-105 transition-all duration-300">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                          <Settings className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-emerald-700 mb-1 flex items-center justify-center text-sm">
                          <Settings className="w-3 h-3 mr-1" />
                          Automatizar
                        </h3>
                        <p className="text-xs text-gray-600">
                          Flujos de aprobación automáticos y notificaciones inteligentes.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-emerald-50 hover:shadow-md hover:scale-105 transition-all duration-300">
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                          <Heart className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-emerald-700 mb-1 flex items-center justify-center text-sm">
                          <Heart className="w-3 h-3 mr-1" />
                          Humanizar
                        </h3>
                        <p className="text-xs text-gray-600">
                          Experiencia personalizada que pone a las personas primero.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">Funcionalidades esperadas</h3>
                    <div className="space-y-1">
                      {[
                        "Portal web disponible 24/7 para solicitar permisos desde cualquier dispositivo.",
                        "Cálculo automático de días disponibles según políticas internas.",
                        "Flujo de aprobación con notificaciones instantáneas.",
                        "Calendario compartido para visualizar disponibilidad del equipo.",
                        "Historial centralizado y seguro de todas las solicitudes."
                      ].map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-start space-x-2 p-1 rounded hover:bg-emerald-50 transition-colors duration-300"
                          style={{transitionDelay: `${index * 50}ms`}}
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0 transform hover:scale-110 transition-transform duration-300" />
                          <span className="text-gray-600 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center pt-2 border-t border-emerald-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Este reto busca devolver{' '}
                      <span className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors duration-300 cursor-pointer">tiempo a las personas</span>,{' '}
                      <span className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors duration-300 cursor-pointer">confianza a los equipos</span> y{' '}
                      <span className="font-semibold text-emerald-700 hover:text-emerald-600 transition-colors duration-300 cursor-pointer">eficiencia a las empresas</span>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Simulator View */}
        {currentView === 'simulator' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Simulador de Permisos
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Usa nuestros modelos de Machine Learning para simular la aprobación de tu solicitud de permisos en tiempo real.
                </p>
              </div>

              {/* Simulator Form */}
              <Card className="max-w-2xl mx-auto border-emerald-100">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-emerald-700">Formulario de Solicitud</CardTitle>
                  <CardDescription className="text-gray-600">
                    Completa los datos y selecciona el modelo para predecir el resultado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Empleado</label>
                      <input 
                        type="text" 
                        placeholder="Juan Pérez"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Permiso</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="">Selecciona...</option>
                        <option value="vacaciones">Vacaciones</option>
                        <option value="enfermedad">Enfermedad</option>
                        <option value="personal">Personal</option>
                        <option value="estudio">Estudio</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                    <textarea 
                      placeholder="Necesito unos días para descansar y visitar a mi familia"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo de ML</label>
                    <select className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">Selecciona...</option>
                      <option value="regresion-lineal">Regresión Lineal</option>
                      <option value="regresion-logistica">Regresión Logística</option>
                      <option value="k-means">K-Means</option>
                      <option value="naive-bayes">Naive Bayes</option>
                      <option value="knn">KNN</option>
                      <option value="arbol-decisiones">Árbol de Decisiones</option>
                      <option value="svm">SVM</option>
                    </select>
                  </div>

                <Button 
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 text-base font-semibold"
                  onClick={() => alert('Simulación procesada con éxito')}
                >
                  Simular Aprobación
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="max-w-2xl mx-auto border-emerald-100 mt-6">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-emerald-700">Resultados de la Simulación</CardTitle>
                <CardDescription className="text-gray-600">
                  Predicción basada en el modelo seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 mb-4">
                    <div className="text-3xl font-bold text-emerald-700">85%</div>
                    <div className="text-sm text-gray-600">Probabilidad de Aprobación</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 mb-2">
                    <div className="text-sm text-gray-600">Tiempo estimado de respuesta:</div>
                    <div className="text-lg font-semibold text-emerald-700">2-3 días hábiles</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Modelo utilizado:</div>
                  <div className="text-lg font-semibold text-emerald-700">Regresión Logística</div>
                </div>
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-4">
                    <Button 
                      variant="outline" 
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      onClick={navigateToHome}
                    >
                      ← Volver al Inicio
                    </Button>
                    <Button 
                      className="bg-emerald-700 hover:bg-emerald-600 text-white"
                      onClick={() => alert('Solicitud enviada con éxito')}
                    >
                      Enviar Solicitud
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </section>
        )}

        {/* Metodología View */}
        {currentView === 'metodologia' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Metodología
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Nuestro enfoque metodológico combina principios ágiles con las mejores prácticas de gestión del tiempo y recursos humanos.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-emerald-700 text-lg">Investigación</CardTitle>
                    <CardDescription>Análisis de necesidades y contextos organizacionales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Entrevistas con stakeholders</li>
                      <li>• Análisis de procesos actuales</li>
                      <li>• Identificación de puntos de dolor</li>
                      <li>• Benchmarking sectorial</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-emerald-700 text-lg">Diseño</CardTitle>
                    <CardDescription>Prototipado y diseño centrado en el usuario</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Wireframes y prototipos</li>
                      <li>• Diseño UX/UI intuitivo</li>
                      <li>• Pruebas de usabilidad</li>
                      <li>• Iteraciones rápidas</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-emerald-700 text-lg">Desarrollo</CardTitle>
                    <CardDescription>Implementación ágil con tecnología moderna</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Desarrollo iterativo</li>
                      <li>• Integración continua</li>
                      <li>• Revisión de código</li>
                      <li>• Testing automatizado</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-emerald-700 text-lg">Validación</CardTitle>
                    <CardDescription>Pruebas y mejora continua</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Pruebas piloto</li>
                      <li>• Recolección de feedback</li>
                      <li>• Métricas de éxito</li>
                      <li>• Mejora continua</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Dashboard
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Visualización en tiempo real de métricas y estadísticas de gestión de permisos.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="border-emerald-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-700">156</div>
                    <div className="text-sm text-gray-600">Solicitudes este mes</div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-700">89%</div>
                    <div className="text-sm text-gray-600">Tasa de aprobación</div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-700">2.3d</div>
                    <div className="text-sm text-gray-600">Tiempo promedio</div>
                  </CardContent>
                </Card>
                <Card className="border-emerald-100">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-700">94%</div>
                    <div className="text-sm text-gray-600">Satisfacción</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-emerald-100">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">Tendencias de Solicitudes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600">Gráfico de tendencias</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">Tipos de Permiso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-600">Gráfico de distribución</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Equipo View */}
        {currentView === 'equipo' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Equipo
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Conoce al talentoso equipo detrás del proyecto MiTiempo para el Reto Comfachocó.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">JD</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Juan Díaz</h3>
                    <p className="text-sm text-emerald-600">Líder de Proyecto</p>
                    <p className="text-xs text-gray-600 mt-2">Especialista en gestión ágil y coordinación de equipos multidisciplinarios.</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">MG</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">María García</h3>
                    <p className="text-sm text-emerald-600">Desarrolladora Full Stack</p>
                    <p className="text-xs text-gray-600 mt-2">Experta en React, Node.js y diseño de interfaces intuitivas.</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">CR</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Carlos Rodríguez</h3>
                    <p className="text-sm text-emerald-600">Científico de Datos</p>
                    <p className="text-xs text-gray-600 mt-2">Especialista en Machine Learning y análisis predictivo.</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">AL</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Ana López</h3>
                    <p className="text-sm text-emerald-600">Diseñadora UX/UI</p>
                    <p className="text-xs text-gray-600 mt-2">Apasionada por crear experiencias centradas en el usuario.</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">PM</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Pedro Martínez</h3>
                    <p className="text-sm text-emerald-600">Ingeniero de Backend</p>
                    <p className="text-xs text-gray-600 mt-2">Experto en arquitectura escalable y bases de datos.</p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-xl">SS</span>
                    </div>
                    <h3 className="font-semibold text-gray-800">Sofía Sánchez</h3>
                    <p className="text-sm text-emerald-600">Analista de QA</p>
                    <p className="text-xs text-gray-600 mt-2">Dedicada a garantizar la calidad y el rendimiento.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Colab View */}
        {currentView === 'colab' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Colab
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Espacio colaborativo para compartir ideas, recursos y contribuir al proyecto MiTiempo.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">📚 Recursos Compartidos</CardTitle>
                    <CardDescription>Documentación y materiales de referencia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Guía de usuario</li>
                      <li>• Documentación técnica</li>
                      <li>• Videos tutoriales</li>
                      <li>• Mejores prácticas</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">💡 Ideas y Sugerencias</CardTitle>
                    <CardDescription>Contribuye con mejoras y nuevas funcionalidades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Foro de discusión</li>
                      <li>• Sistema de tickets</li>
                      <li>• Votación de features</li>
                      <li>• Brainstorming colaborativo</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">🤝 Contribuciones</CardTitle>
                    <CardDescription>Participa activamente en el desarrollo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Código abierto</li>
                      <li>• Pull requests</li>
                      <li>• Reporte de bugs</li>
                      <li>• Testing comunitario</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">🌟 Comunidad</CardTitle>
                    <CardDescription>Conecta con otros usuarios y desarrolladores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Slack/Discord</li>
                      <li>• Eventos virtuales</li>
                      <li>• Webinars</li>
                      <li>• Meetups</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-emerald-100">
                <CardHeader className="text-center">
                  <CardTitle className="text-emerald-700">¿Quieres colaborar?</CardTitle>
                  <CardDescription>Únete a nuestra comunidad y contribuye al proyecto</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="bg-emerald-700 hover:bg-emerald-600 text-white">
                    Contactar al Equipo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Contacto View */}
        {currentView === 'contacto' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Contáctanos
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Estamos aquí para ayudarte. Contáctanos para cualquier pregunta, sugerencia o soporte técnico.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">📧 Envíanos un mensaje</CardTitle>
                    <CardDescription>Te responderemos lo antes posible</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          rows="4"
                          placeholder="¿En qué podemos ayudarte?"
                        />
                      </div>
                      <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white">
                        Enviar Mensaje
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-emerald-700">📍 Información de Contacto</CardTitle>
                    <CardDescription>Otras formas de comunicarte con nosotros</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">📧</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Email</h4>
                          <p className="text-sm text-gray-600">info@mitiempo.com</p>
                          <p className="text-sm text-gray-600">soporte@mitiempo.com</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">📱</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Teléfono</h4>
                          <p className="text-sm text-gray-600">+57 1 234 5678</p>
                          <p className="text-sm text-gray-600">Lun-Vie 9:00-18:00</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">📍</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Dirección</h4>
                          <p className="text-sm text-gray-600">Cra. 50 # 45-67</p>
                          <p className="text-sm text-gray-600">Bogotá, Colombia</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 text-sm">💬</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Redes Sociales</h4>
                          <p className="text-sm text-gray-600">@MiTiempoCol</p>
                          <p className="text-sm text-gray-600">Respuesta en 2-4 horas</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 border-emerald-100">
                <CardHeader className="text-center">
                  <CardTitle className="text-emerald-700">🚀 ¿Necesitas ayuda urgente?</CardTitle>
                  <CardDescription>Soporte prioritario para usuarios premium</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button className="bg-emerald-700 hover:bg-emerald-600 text-white mr-2">
                    Soporte Prioritario
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Chat en Vivo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Machine Learning View */}
        {currentView === 'machine-learning' && (
          <section className={`py-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg inline-block">
                    Modelos de Machine Learning
                  </span>
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  Explora los algoritmos fundamentales de aprendizaje automático que impulsan las soluciones inteligentes para la gestión del tiempo y recursos humanos.
                </p>
              </div>

              {/* ML Models Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Regresión Lineal */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Regresión Lineal</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Análisis Predictivo</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Modelo fundamental que establece relaciones lineales entre variables para predecir valores continuos como tiempo de aprobación de permisos.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Predicción</Badge>
                      <Badge variant="secondary" className="text-xs">Estadística</Badge>
                      <Badge variant="secondary" className="text-xs">Supervisado</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Regresión Logística */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Regresión Logística</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Clasificación Binaria</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Algoritmo de clasificación que predice probabilidades binarias, ideal para aprobar/rechazar solicitudes de permisos automáticamente.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Clasificación</Badge>
                      <Badge variant="secondary" className="text-xs">Probabilidad</Badge>
                      <Badge variant="secondary" className="text-xs">Decisión</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* K-Means */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">K-Means</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Clustering No Supervisado</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Agrupa datos en clusters no etiquetados, perfecto para segmentar empleados por patrones de solicitud de permisos.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Clustering</Badge>
                      <Badge variant="secondary" className="text-xs">No Supervisado</Badge>
                      <Badge variant="secondary" className="text-xs">Segmentación</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Naive Bayes */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Database className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Naive Bayes</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Clasificación Probabilística</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Clasificador probabilístico basado en el teorema de Bayes, eficiente para categorizar solicitudes por tipo y urgencia.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Probabilístico</Badge>
                      <Badge variant="secondary" className="text-xs">Rápido</Badge>
                      <Badge variant="secondary" className="text-xs">Independencia</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* KNN */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">KNN</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Vecinos Más Cercanos</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Algoritmo que clasifica basándose en los k vecinos más cercanos, útil para recomendar fechas óptimas de vacaciones.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Instancia-based</Badge>
                      <Badge variant="secondary" className="text-xs">Lazy Learning</Badge>
                      <Badge variant="secondary" className="text-xs">Similaridad</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Árbol de Decisiones */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Brain className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">Árbol de Decisiones</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Modelo de Decisión</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Estructura jerárquica de decisiones que automatiza la aprobación de permisos basada en reglas claras e interpretables.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Interpretable</Badge>
                      <Badge variant="secondary" className="text-xs">Reglas</Badge>
                      <Badge variant="secondary" className="text-xs">Jerárquico</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* SVM */}
                <Card className="border-emerald-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                      <Settings className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-700 text-lg">SVM</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Máquina de Vectores de Soporte</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">
                      Clasificador potente que encuentra hiperplanos óptimos, ideal para detectar patrones complejos en solicitudes de permisos.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">Margen Máximo</Badge>
                      <Badge variant="secondary" className="text-xs">Kernel</Badge>
                      <Badge variant="secondary" className="text-xs">Alta Dimensión</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Applications Section */}
              <Card className="mt-6 border-emerald-100">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl md:text-2xl text-emerald-700">
                    Aplicaciones en MiTiempo
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Cómo estos modelos potencian nuestra plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">Predicción de Aprobación</h4>
                        <p className="text-xs text-gray-600">Regresión logística para estimar probabilidades de aprobación automática</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">Segmentación de Usuarios</h4>
                        <p className="text-xs text-gray-600">K-Means para agrupar empleados por patrones de solicitud</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">Clasificación Inteligente</h4>
                        <p className="text-xs text-gray-600">Árboles de decisión para automatizar decisiones basadas en políticas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800">Análisis de Tendencias</h4>
                        <p className="text-xs text-gray-600">Regresión lineal para predecir demanda de permisos estacionales</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-4">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-emerald-700">MiTiempo</h3>
            <p className="text-sm text-gray-600">Copyright © 2025</p>
            <p className="text-xs text-gray-500">Proyecto de Machine Learning – Reto Comfachocó</p>
          </div>
        </div>
      </footer>
    </div>
  );
}