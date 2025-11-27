/**
 * Main App Component
 * Routing and authentication setup
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RRHHPanel from './pages/RRHHPanel';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/rrhh"
                            element={
                                <ProtectedRoute requireRRHH={true}>
                                    <RRHHPanel />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
