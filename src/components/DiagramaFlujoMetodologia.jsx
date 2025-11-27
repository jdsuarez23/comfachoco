'use client';

import { useEffect, useRef, useState } from 'react';

export default function DiagramaFlujoMetodologia() {
  const detalleFlotanteRef = useRef(null);
  const [elementoActivo, setElementoActivo] = useState(null);

  const bloques = [
    { id: 1,  titulo: "Solicitante inicia solicitud", descripcion: "Inicio del proceso", detalles: "El empleado accede a la plataforma web para iniciar su solicitud de permiso. Este es el primer paso del flujo.", celda: "B1" },
    { id: 2,  titulo: "Entrada de texto libre", descripcion: "Motivo de la solicitud", detalles: "El empleado describe libremente el motivo de su solicitud de permiso en un campo de texto. Esta información será utilizada por el Modelo 1 para clasificar el tipo de permiso.", celda: "B2" },
    { id: 3,  titulo: "Modelo 1: Naive Bayes", descripcion: "Clasificación de permiso", detalles: "<strong>Algoritmo:</strong> Naive Bayes<br><strong>Función:</strong> Clasifica automáticamente el tipo de permiso (enfermedad, vacaciones, personal, etc.) basándose en el texto libre ingresado por el empleado.", celda: "B3" },
    { id: 4,  titulo: "Formulario detallado", descripcion: "Datos complementarios", detalles: "El empleado completa un formulario con información crítica: días solicitados, fechas, área, antigüedad, etc.", celda: "B4" },
    { id: 5,  titulo: "Validación legal", descripcion: "Cumplimiento normativo", detalles: "<strong>Punto de decisión crítico:</strong> El sistema verifica si la solicitud cumple con la normativa legal vigente. Si incumple, se bloquea.", celda: "B5" },
    { id: 6,  titulo: "Bloqueado", descripcion: "Error legal – FIN", detalles: "La solicitud incumple una norma legal. Se muestra un mensaje de error y el proceso finaliza.", celda: "A6" },
    { id: 7,  titulo: "Modelo 2: SVM", descripcion: "Detección de anomalías", detalles: "<strong>Algoritmo:</strong> Support Vector Machine (SVM)<br><strong>Función:</strong> Detecta si la solicitud es inusual en patrón, frecuencia o contexto.", celda: "C6" },
    { id: 8,  titulo: "Resultado", descripcion: "Evaluación del modelo", detalles: "<strong>Decisión automática:</strong> El modelo SVM determina si la solicitud es anómala o normal.", celda: "C7" },
    { id: 9,  titulo: "Revisión humana", descripcion: "Requiere intervención", detalles: "La solicitud fue marcada como anómala y será revisada obligatoriamente por Recursos Humanos.", celda: "B8" },
    { id:10,  titulo: "Modelo 3: Regresión", descripcion: "Impacto estimado (días)", detalles: "<strong>Algoritmo:</strong> Regresión<br><strong>Función:</strong> Estima el impacto en días considerando carga de trabajo y otros factores.", celda: "D8" },
    { id:11,  titulo: "Modelo 4: RegLog", descripcion: "Probabilidad de aprobación", detalles: "<strong>Algoritmo:</strong> Regresión Logística<br><strong>Función:</strong> Calcula la probabilidad de aprobación basada en todos los datos anteriores.", celda: "D9" },
    { id:12,  titulo: "Modelo 5: Árbol de decisión", descripcion: "Decisión final", detalles: "<strong>Algoritmo:</strong> Árbol de Decisión<br><strong>Función:</strong> Emite la decisión final: Aprobado, Rechazado o Revisar.", celda: "D10" },
    { id:13,  titulo: "Rechazado", descripcion: "Solicitud denegada", detalles: "La solicitud ha sido rechazada. El proceso finaliza.", celda: "C11" },
    { id:14,  titulo: "En revisión", descripcion: "Revisión manual", detalles: "La solicitud fue enviada a revisión humana por RRHH para evaluación final.", celda: "D11" },
    { id:15,  titulo: "Aprobado", descripcion: "Solicitud autorizada", detalles: "La solicitud ha sido aprobada. Continúa al flujo post-aprobación.", celda: "E11" },
    { id:16,  titulo: "Modelo 6: K-means", descripcion: "Segmentación de empleado", detalles: "<strong>Algoritmo:</strong> K-means Clustering<br><strong>Función:</strong> Segmenta al empleado en un grupo con características similares.", celda: "E12" },
    { id:17,  titulo: "Modelo 7: KNN", descripcion: "Recomendaciones contextuales", detalles: "<strong>Algoritmo:</strong> K-Nearest Neighbors (KNN)<br><strong>Función:</strong> Sugiere información basada en empleados similares (ej. promedio de días).", celda: "E13" },
    { id:18,  titulo: "Resumen final", descripcion: "Información personalizada", detalles: "El empleado recibe un resumen completo con impacto estimado, sugerencias y contexto basado en su perfil.", celda: "E14" }
  ];

  const colMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        detalleFlotanteRef.current &&
        !detalleFlotanteRef.current.contains(e.target) &&
        !e.target.closest('.elemento-flujo')
      ) {
        setElementoActivo(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleElementClick = (bloque, e) => {
    e.stopPropagation();
    setElementoActivo(elementoActivo?.id === bloque.id ? null : bloque);
  };

  const getGridArea = (celda) => {
    const colLetra = celda[0];
    const fila = celda.slice(1);
    const colNum = colMap[colLetra];
    return `${fila} / ${colNum} / span 1 / span 1`;
  };

  return (
    <div className="relative">
      {/* Cuadrícula de flujo */}
      <div
        className="flujo-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(14, 100px)',
          gap: '12px',
          marginTop: '20px',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {bloques.map((bloque) => (
          <div
            key={bloque.id}
            className={`elemento-flujo rounded-lg p-4 cursor-pointer flex flex-col justify-center items-center text-center transition-all duration-200 ${
              elementoActivo?.id === bloque.id
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-emerald-50 border-emerald-600 text-emerald-800'
            }`}
            style={{
              border: '2px solid',
              minHeight: '90px',
              gridArea: getGridArea(bloque.celda)
            }}
            onClick={(e) => handleElementClick(bloque, e)}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                elementoActivo?.id === bloque.id
                  ? 'bg-white text-emerald-600'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {bloque.id}
            </div>
            <div className="font-semibold text-xs mb-1">{bloque.titulo}</div>
            <div className="text-[10px] opacity-90">{bloque.descripcion}</div>
          </div>
        ))}
      </div>

      {/* Tooltip flotante */}
      {elementoActivo && (
        <div
          ref={detalleFlotanteRef}
          className="fixed bg-white border-2 border-emerald-600 rounded-lg p-4 shadow-lg z-50 max-w-xs text-sm"
          style={{
            width: '300px',
            top: detalleFlotanteRef.current?.style.top || '100px',
            left: detalleFlotanteRef.current?.style.left || '100px'
          }}
          dangerouslySetInnerHTML={{ __html: `
            <h3 class="text-emerald-700 font-bold text-sm mb-2 border-b border-emerald-300 pb-1">${elementoActivo.titulo}</h3>
            ${elementoActivo.detalles}
          ` }}
        />
      )}

      {/* Estilos internos para el tooltip (solo si no usas Tailwind para esto) */}
      <style jsx>{`
        .flujo-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(14, 100px);
          gap: 12px;
          margin-top: 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .elemento-flujo:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(4, 180, 95, 0.25);
        }
      `}</style>
    </div>
  );
}