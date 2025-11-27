/**
 * Employee Dashboard
 * Create leave requests and view own requests
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Validation schema
    const validationSchema = Yup.object({
        motivo_texto: Yup.string()
            .required('Motivo requerido')
            .min(20, 'Por favor describe tu solicitud con al menos 20 caracteres para que el sistema pueda analizarla'),
        dias_solicitados: Yup.number().required('Días requeridos').min(1, 'Mínimo 1 día'),
        fecha_inicio: Yup.date().required('Fecha de inicio requerida'),
        fecha_fin: Yup.date()
            .required('Fecha de fin requerida')
            .min(Yup.ref('fecha_inicio'), 'Fecha fin debe ser después de fecha inicio'),
        impacto_area: Yup.string().required('Impacto requerido')
    });

    // Formik form
    const formik = useFormik({
        initialValues: {
            motivo_texto: '',
            dias_solicitados: 1,
            fecha_inicio: '',
            fecha_fin: '',
            impacto_area: 'BAJO',
            dias_ult_ano: 0
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setLoading(true);
            try {
                // Create FormData for file upload
                const formData = new FormData();
                Object.keys(values).forEach(key => {
                    formData.append(key, values[key]);
                });

                // Append file if selected
                if (selectedFile) {
                    formData.append('archivo_soporte', selectedFile);
                }

                const response = await solicitudesAPI.create(formData);
                toast.success('Solicitud creada exitosamente');

                // Show ML prediction
                if (response.data.ml_prediction) {
                    const prob = response.data.ml_prediction.porcentaje;
                    toast.info(`Probabilidad de aprobación: ${prob}`, { autoClose: 5000 });
                }

                resetForm();
                setSelectedFile(null);
                setShowForm(false);
                loadSolicitudes();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al crear solicitud');
            }
            setLoading(false);
        }
    });

    // Load user's solicitudes
    const loadSolicitudes = async () => {
        try {
            const response = await solicitudesAPI.getMySolicitudes();
            setSolicitudes(response.data.solicitudes);
        } catch (error) {
            toast.error('Error al cargar solicitudes');
        }
    };

    useEffect(() => {
        loadSolicitudes();
    }, []);

    const getStatusBadge = (resultado) => {
        const badges = {
            'PENDIENTE': 'badge-warning',
            'AUTORIZADO': 'badge-success',
            'RECHAZADO': 'badge-danger'
        };
        return badges[resultado] || 'badge-secondary';
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard - {user?.nombre}</h1>
                    <p className="text-muted">{user?.email} | {user?.cargo || 'Empleado'}</p>
                </div>
                <button onClick={logout} className="btn btn-secondary">
                    Cerrar Sesión
                </button>
            </header>

            <div className="dashboard-content">
                <div className="actions-section">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                    >
                        {showForm ? '✕ Cancelar' : '+ Nueva Solicitud'}
                    </button>
                </div>

                {showForm && (
                    <div className="form-card">
                        <h3>Nueva Solicitud de Permiso</h3>
                        <div className="info-box" style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#1976d2' }}>
                                🤖 <strong>Proceso Inteligente:</strong> Describe tu solicitud y nuestro sistema ML clasificará automáticamente el tipo de permiso.
                            </p>
                        </div>
                        <form onSubmit={formik.handleSubmit}>
                            {/* PASO 1: Motivo (Naive Bayes lo analizará) */}
                            <div className="form-group">
                                <label>📝 Motivo de la Solicitud *</label>
                                <p className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                                    Describe detalladamente el motivo de tu solicitud. El sistema analizará tu texto para clasificar automáticamente el tipo de permiso.
                                </p>
                                <textarea
                                    name="motivo_texto"
                                    rows="5"
                                    placeholder="Ejemplo: Necesito ausentarme por cita médica de control con mi especialista el próximo viernes..."
                                    value={formik.values.motivo_texto}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    style={{ fontSize: '14px' }}
                                ></textarea>
                                {formik.touched.motivo_texto && formik.errors.motivo_texto && (
                                    <span className="error">{formik.errors.motivo_texto}</span>
                                )}
                            </div>

                            {/* PASO 2: Detalles de la solicitud */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>📅 Días Solicitados *</label>
                                    <input
                                        type="number"
                                        name="dias_solicitados"
                                        min="1"
                                        value={formik.values.dias_solicitados}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.dias_solicitados && formik.errors.dias_solicitados && (
                                        <span className="error">{formik.errors.dias_solicitados}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>📊 Impacto en el Área *</label>
                                    <select
                                        name="impacto_area"
                                        value={formik.values.impacto_area}
                                        onChange={formik.handleChange}
                                    >
                                        <option value="BAJO">Bajo</option>
                                        <option value="MEDIO">Medio</option>
                                        <option value="ALTO">Alto</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>📆 Fecha Inicio *</label>
                                    <input
                                        type="date"
                                        name="fecha_inicio"
                                        value={formik.values.fecha_inicio}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.fecha_inicio && formik.errors.fecha_inicio && (
                                        <span className="error">{formik.errors.fecha_inicio}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>📆 Fecha Fin *</label>
                                    <input
                                        type="date"
                                        name="fecha_fin"
                                        value={formik.values.fecha_fin}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.fecha_fin && formik.errors.fecha_fin && (
                                        <span className="error">{formik.errors.fecha_fin}</span>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Archivo de Soporte (Opcional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="file-input"
                                />
                                {selectedFile && (
                                    <div className="file-selected">
                                        📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </div>
                                )}
                                <small className="text-muted">PDF o imágenes (JPG, PNG). Máximo 5MB</small>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || !formik.isValid}
                            >
                                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="solicitudes-section">
                    <h3>Mis Solicitudes</h3>
                    {solicitudes.length === 0 ? (
                        <p className="text-muted">No tienes solicitudes aún.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Tipo</th>
                                        <th>Días</th>
                                        <th>Fecha Inicio</th>
                                        <th>Estado</th>
                                        <th>ML Score</th>
                                        <th>Comentario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.solicitud_id}>
                                            <td>{sol.solicitud_id}</td>
                                            <td>{sol.tipo_permiso_real}</td>
                                            <td>{sol.dias_solicitados}</td>
                                            <td>{format(new Date(sol.fecha_inicio), 'dd/MM/yyyy')}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(sol.resultado_rrhh)}`}>
                                                    {sol.resultado_rrhh}
                                                </span>
                                            </td>
                                            <td>
                                                {sol.ml_probabilidad_aprobacion
                                                    ? `${(sol.ml_probabilidad_aprobacion * 100).toFixed(1)}%`
                                                    : 'N/A'}
                                            </td>
                                            <td>{sol.comentario_rrhh || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
