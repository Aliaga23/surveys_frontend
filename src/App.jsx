import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Roles from './components/dashboard/roles';
import Canales from './components/dashboard/canales';
import EstadoDocumento from './components/dashboard/estado-documento';
import EstadoEntrega from './components/dashboard/estados-entrega';
import EstadosPago from './components/dashboard/estados-pago';
import TiposPregunta from './components/dashboard/tipos-pregunta';
import MetodoPago from './components/dashboard/metodos-pago';
import EstadosCampaña from './components/dashboard/estados-campana';
import Planes from './components/dashboard/planes';
import PlantillasPage from './components/dashboard-suscriptor/plantillas';
import CampanasPage from './components/dashboard-suscriptor/campanas';
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
          <Route path="/dashboard/estados-entrega" element={<EstadoEntrega />} />
          <Route path="/dashboard/estados-pago" element={<EstadosPago />} />
          <Route path="/dashboard/tipos-pregunta" element={<TiposPregunta />} />
          <Route path="/dashboard/metodos-pago" element={<MetodoPago />} />
          <Route path="/dashboard/estados-campana" element={<EstadosCampaña />} />
          <Route path="/dashboard/planes" element={<Planes />} />
          <Route path="/dashboard-suscriptor/plantillas" element={<PlantillasPage />} />
          <Route path="/dashboard-suscriptor/campanas" element={<CampanasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
