/**
 * RRHH Management Panel
 * Review, approve, and reject leave requests
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { rrhhAPI } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import RequestDetailsModal from '../components/RequestDetailsModal';

const RRHHPanel = () => {
    const { user, logout } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('PENDIENTE');
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'aprobar' or 'rechazar'
    const [diasAutorizados, setDiasAutorizados] = useState(0);
    const [comentario, setComentario] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsSolicitudId, setDetailsSolicitudId] = useState(null);

    const loadSolicitudes = async () => {
        setLoading(true);
        try {
            const params = filter ? { resultado: filter } : {};
            const response = await rrhhAPI.getSolicitudes(params);
            setSolicitudes(response.data.solicitudes);
        } catch (error) {
            toast.error('Error al cargar solicitudes');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSolicitudes();
    }, [filter]);

    const handleOpenModal = (solicitud, type) => {
        setSelectedSolicitud(solicitud);
        setModalType(type);
        setDiasAutorizados(solicitud.dias_solicitados);
        setComentario('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedSolicitud(null);
        setModalType('');
        setDiasAutorizados(0);
        setComentario('');
    };

    const handleAprobar = async () => {
        if (!selectedSolicitud) return;

        try {
            await rrhhAPI.aprobar(selectedSolicitud.solicitud_id, {
                dias_autorizados: diasAutorizados,
                comentario_rrhh: comentario || 'Aprobado'
            });
            toast.success('Solicitud aprobada exitosamente');
            handleCloseModal();
            loadSolicitudes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al aprobar');
        }
    };

    const handleRechazar = async () => {
        if (!selectedSolicitud || !comentario.trim()) {
            toast.error('El comentario es requerido para rechazar');
            return;
        }

        try {
            await rrhhAPI.rechazar(selectedSolicitud.solicitud_id, {
                comentario_rrhh: comentario
            });
            toast.success('Solicitud rechazada');
            handleCloseModal();
            loadSolicitudes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al rechazar');
        }
    };

    const handleExportCSV = async () => {
        try {
            const response = await rrhhAPI.exportCSV();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `solicitudes_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('CSV exportado exitosamente');
        } catch (error) {
            toast.error('Error al exportar CSV');
        }
    };

    const getStatusBadge = (resultado) => {
        const badges = {
            'PENDIENTE': 'badge-warning',
            'AUTORIZADO': 'badge-success',
            'RECHAZADO': 'badge-danger'
        };
        return badges[resultado] || 'badge-secondary';
    };

    const getProbabilityColor = (prob) => {
        if (prob >= 0.7) return 'text-success';
        if (prob >= 0.4) return 'text-warning';
        return 'text-danger';
    };

    return (
        <div className="rrhh-container" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: 16 }}>
            <header className="dashboard-header" style={{ maxWidth: 1100, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#064e3b' }}>Panel RRHH - {user?.nombre}</h1>
                    <p className="text-muted" style={{ margin: 0, color: '#065f46' }}>Gestión de Solicitudes de Permiso</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <a href="http://localhost:3000/" className="btn btn-outline" style={{ borderColor: '#047857', color: '#065f46' }}>
                        ← Volver al Inicio
                    </a>
                    <button onClick={logout} className="btn btn-secondary" style={{ backgroundColor: '#059669', borderColor: '#047857', color: 'white' }}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main className="rrhh-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
                <section className="card">
                    <div className="card-header" style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 6px 16px rgba(4, 120, 87, 0.12)', border: '1px solid #a7f3d0', padding: 16 }}>
                        <h2 style={{ margin: 0, color: '#065f46' }}>Solicitudes de Empleados</h2>
                    </div>
                    <div className="card-body" style={{ backgroundColor: 'white', borderRadius: 12, boxShadow: '0 6px 16px rgba(4, 120, 87, 0.10)', border: '1px solid #a7f3d0', padding: 16, marginTop: 12 }}>
                        <div className="actions-section" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                            <button
                                className={`btn ${filter === 'PENDIENTE' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setFilter('PENDIENTE')}
                                style={{ backgroundColor: filter === 'PENDIENTE' ? '#059669' : undefined, borderColor: '#047857' }}
                            >
                                Pendientes
                            </button>
                            <button
                                className={`btn ${filter === 'AUTORIZADO' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setFilter('AUTORIZADO')}
                                style={{ backgroundColor: filter === 'AUTORIZADO' ? '#059669' : undefined, borderColor: '#047857' }}
                            >
                                Autorizadas
                            </button>
                            <button
                                className={`btn ${filter === 'RECHAZADO' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setFilter('RECHAZADO')}
                                style={{ backgroundColor: filter === 'RECHAZADO' ? '#059669' : undefined, borderColor: '#047857' }}
                            >
                                Rechazadas
                            </button>
                            <button
                                className={`btn ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setFilter('')}
                                style={{ backgroundColor: filter === '' ? '#059669' : undefined, borderColor: '#047857' }}
                            >
                                Todas
                            </button>
                            <button onClick={handleExportCSV} className="btn btn-success" style={{ backgroundColor: '#10B981', borderColor: '#059669' }}>
                                📥 Exportar CSV
                            </button>
                        </div>

                        <div className="solicitudes-section">
                            <h3>Solicitudes ({solicitudes.length})</h3>
                            {loading ? (
                                <p>Cargando...</p>
                            ) : solicitudes.length === 0 ? (
                                <p className="text-muted">No hay solicitudes para mostrar.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Empleado</th>
                                                <th>Tipo</th>
                                                <th>Días</th>
                                                <th>Fecha Inicio</th>
                                                <th>Impacto</th>
                                                <th>ML Score</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solicitudes.map((sol) => (
                                                <tr key={sol.solicitud_id}>
                                                    <td>{sol.solicitud_id}</td>
                                                    <td>
                                                        <div>{sol.empleado_nombre}</div>
                                                        <small className="text-muted">{sol.empleado_email}</small>
                                                    </td>
                                                    <td>{sol.tipo_permiso_real}</td>
                                                    <td>{sol.dias_solicitados}</td>
                                                    <td>{format(new Date(sol.fecha_inicio), 'dd/MM/yyyy')}</td>
                                                    <td>
                                                        <span className={`badge badge-${sol.impacto_area === 'ALTO' ? 'danger' : sol.impacto_area === 'MEDIO' ? 'warning' : 'info'}`}>
                                                            {sol.impacto_area}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={getProbabilityColor(sol.ml_probabilidad_aprobacion)}>
                                                            {sol.ml_probabilidad_aprobacion
                                                                ? `${(sol.ml_probabilidad_aprobacion * 100).toFixed(1)}%`
                                                                : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(sol.resultado_rrhh)}`}>
                                                            {sol.resultado_rrhh}
                                                        </span>
                                                        {sol.es_anomala && (
                                                            <span className="badge badge-danger ml-1">⚠ Anómala</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn btn-sm btn-info"
                                                                style={{ backgroundColor: '#14B8A6', borderColor: '#0D9488' }}
                                                                onClick={() => {
                                                                    setDetailsSolicitudId(sol.solicitud_id);
                                                                    setShowDetailsModal(true);
                                                                }}
                                                            >
                                                                👁 Ver Detalles
                                                            </button>
                                                            {sol.resultado_rrhh === 'PENDIENTE' && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-sm btn-success"
                                                                        style={{ backgroundColor: '#10B981', borderColor: '#059669' }}
                                                                        onClick={() => handleOpenModal(sol, 'aprobar')}
                                                                    >
                                                                        ✓ Aprobar
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-danger"
                                                                        style={{ backgroundColor: '#DC2626', borderColor: '#B91C1C' }}
                                                                        onClick={() => handleOpenModal(sol, 'rechazar')}
                                                                    >
                                                                        ✕ Rechazar
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={async () => {
                                                                            try {
                                                                                await rrhhAPI.delete(sol.solicitud_id);
                                                                                toast.success(`Solicitud ${sol.solicitud_id} eliminada`);
                                                                                loadSolicitudes();
                                                                            } catch (err) {
                                                                                toast.error(err.response?.data?.message || 'Error al eliminar');
                                                                            }
                                                                        }}
                                                                    >
                                                                        🗑 Eliminar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Modal */}
            {showModal && selectedSolicitud && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {modalType === 'aprobar' ? '✓ Aprobar Solicitud' : '✕ Rechazar Solicitud'}
                            </h3>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="solicitud-details">
                                <p><strong>Empleado:</strong> {selectedSolicitud.empleado_nombre}</p>
                                <p><strong>Tipo:</strong> {selectedSolicitud.tipo_permiso_real}</p>
                                <p><strong>Días solicitados:</strong> {selectedSolicitud.dias_solicitados}</p>
                                <p><strong>Motivo:</strong> {selectedSolicitud.motivo_texto}</p>
                                <p><strong>ML Probabilidad:</strong>
                                    <span className={getProbabilityColor(selectedSolicitud.ml_probabilidad_aprobacion)}>
                                        {' '}{(selectedSolicitud.ml_probabilidad_aprobacion * 100).toFixed(1)}%
                                    </span>
                                </p>
                            </div>

                            {modalType === 'aprobar' && (
                                <div className="form-group">
                                    <label>Días Autorizados *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={selectedSolicitud.dias_solicitados}
                                        value={diasAutorizados}
                                        onChange={(e) => setDiasAutorizados(parseInt(e.target.value))}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Comentario {modalType === 'rechazar' && '*'}</label>
                                <textarea
                                    rows="4"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder={modalType === 'aprobar'
                                        ? 'Comentario opcional...'
                                        : 'Explica el motivo del rechazo...'}
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button
                                className={`btn ${modalType === 'aprobar' ? 'btn-success' : 'btn-danger'}`}
                                onClick={modalType === 'aprobar' ? handleAprobar : handleRechazar}
                            >
                                {modalType === 'aprobar' ? 'Aprobar' : 'Rechazar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && detailsSolicitudId && (
                <RequestDetailsModal
                    solicitudId={detailsSolicitudId}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setDetailsSolicitudId(null);
                    }}
                    onAction={(action, id) => {
                        setShowDetailsModal(false);
                        const solicitud = solicitudes.find(s => s.solicitud_id === id);
                        if (solicitud) {
                            handleOpenModal(solicitud, action);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default RRHHPanel;
