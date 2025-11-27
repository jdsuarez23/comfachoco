/**
 * Request Details Modal
 * Shows complete request information for RRHH
 */

import React, { useState, useEffect } from 'react';
import { solicitudesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const RequestDetailsModal = ({ solicitudId, onClose, onAction }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetails();
    }, [solicitudId]);

    const loadDetails = async () => {
        try {
            const response = await solicitudesAPI.getDetails(solicitudId);
            setDetails(response.data.solicitud);
        } catch (error) {
            toast.error('Error al cargar detalles');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await solicitudesAPI.downloadFile(solicitudId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', details.archivo_soporte);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Archivo descargado');
        } catch (error) {
            toast.error('Error al descargar archivo');
        }
    };

    const getMLConfidence = (prob) => {
        if (prob >= 0.7) return { level: 'Alta', class: 'confidence-high' };
        if (prob >= 0.4) return { level: 'Media', class: 'confidence-medium' };
        return { level: 'Baja', class: 'confidence-low' };
    };

    if (loading) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Cargando detalles...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!details) {
        return null;
    }

    const mlConfidence = getMLConfidence(details.ml_probabilidad_aprobacion);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📋 Detalles de Solicitud #{details.solicitud_id}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Employee Information */}
                    <div className="detail-section">
                        <h3>👤 Información del Empleado</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Nombre:</label>
                                <span>{details.empleado_nombre}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{details.empleado_email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Área:</label>
                                <span>{details.empleado_area}</span>
                            </div>
                            <div className="detail-item">
                                <label>Cargo:</label>
                                <span>{details.empleado_cargo}</span>
                            </div>
                            <div className="detail-item">
                                <label>Sede:</label>
                                <span>{details.empleado_sede}</span>
                            </div>
                            <div className="detail-item">
                                <label>Antigüedad:</label>
                                <span>{details.antiguedad_anios_actual} años</span>
                            </div>
                            <div className="detail-item">
                                <label>Tipo Contrato:</label>
                                <span>{details.empleado_tipo_contrato}</span>
                            </div>
                        </div>
                    </div>

                    {/* Request Information */}
                    <div className="detail-section">
                        <h3>📝 Información de la Solicitud</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Tipo de Permiso:</label>
                                <span className="badge badge-info">{details.tipo_permiso_real}</span>
                            </div>
                            <div className="detail-item">
                                <label>Días Solicitados:</label>
                                <span>{details.dias_solicitados}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fecha Inicio:</label>
                                <span>{format(new Date(details.fecha_inicio), 'dd/MM/yyyy')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fecha Fin:</label>
                                <span>{format(new Date(details.fecha_fin), 'dd/MM/yyyy')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fecha Solicitud:</label>
                                <span>{format(new Date(details.fecha_solicitud), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            <div className="detail-item">
                                <label>Impacto en Área:</label>
                                <span className={`badge badge-${details.impacto_area === 'ALTO' ? 'danger' : details.impacto_area === 'MEDIO' ? 'warning' : 'success'}`}>
                                    {details.impacto_area}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Estado:</label>
                                <span className={`badge badge-${details.resultado_rrhh === 'AUTORIZADO' ? 'success' : details.resultado_rrhh === 'RECHAZADO' ? 'danger' : 'warning'}`}>
                                    {details.resultado_rrhh}
                                </span>
                            </div>
                            {details.es_anomala && (
                                <div className="detail-item">
                                    <label>⚠️ Anomalía:</label>
                                    <span className="badge badge-danger">Detectada</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-item full-width">
                            <label>Motivo:</label>
                            <p className="motivo-text">{details.motivo_texto}</p>
                        </div>
                    </div>

                    {/* ML Prediction */}
                    <div className="detail-section">
                        <h3>🤖 Predicción ML</h3>
                        <div className="ml-prediction-box">
                            <div className="ml-score">
                                <div className="score-value">{(details.ml_probabilidad_aprobacion * 100).toFixed(1)}%</div>
                                <div className="score-label">Probabilidad de Aprobación</div>
                            </div>
                            <div className={`ml-confidence ${mlConfidence.class}`}>
                                <span>Confianza: {mlConfidence.level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Support File */}
                    {details.archivo_soporte && (
                        <div className="detail-section">
                            <h3>📎 Archivo de Soporte</h3>
                            <div className="file-attachment">
                                <span className="file-icon">📄</span>
                                <span className="file-name">{details.archivo_soporte}</span>
                                <button className="btn btn-sm btn-primary" onClick={handleDownload}>
                                    ⬇ Descargar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* RRHH Comments */}
                    {details.comentario_rrhh && (
                        <div className="detail-section">
                            <h3>💬 Comentario RRHH</h3>
                            <p className="rrhh-comment">{details.comentario_rrhh}</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {details.resultado_rrhh === 'PENDIENTE' && onAction && (
                        <>
                            <button
                                className="btn btn-success"
                                onClick={() => onAction('aprobar', details.solicitud_id)}
                            >
                                ✓ Aprobar
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => onAction('rechazar', details.solicitud_id)}
                            >
                                ✗ Rechazar
                            </button>
                        </>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;
