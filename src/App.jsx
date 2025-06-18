import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/dashboard-layout';
import Roles from './components/dashboard/roles';
import Canales from './components/dashboard/canales';
import EstadoDocumento from './components/dashboard/estado-documento';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
          <Route path="/dashboard/roles" element={<Roles />} />
          <Route path="/dashboard/canales" element={<Canales />} />
          <Route path="/dashboard/estado-documento" element={<EstadoDocumento />} />
        
        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
