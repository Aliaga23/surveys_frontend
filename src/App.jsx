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
import DestinatariosPage from './components/dashboard-suscriptor/destinatarios';
import EncuestaPage from './pages/EncuestaPage';
import EntregasPage from './components/dashboard-suscriptor/entregas';
import RespuestasPage from './components/dashboard-suscriptor/respuestas';
import PerfilAdmin from './components/dashboard/perfil-admin';
import PerfilSuscriptor from './components/dashboard-suscriptor/perfil-suscriptor';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/encuestas/:token" element={<EncuestaPage />} />
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
        <Route path="/dashboard-suscriptor/destinatarios" element={<DestinatariosPage />} />
        <Route path="/dashboard-suscriptor/entregas" element={<EntregasPage />} />
        <Route path="/dashboard-suscriptor/respuestas" element={<RespuestasPage />} />
        <Route path="/dashboard/perfil-admin" element={<PerfilAdmin />} />
        <Route path="/dashboard-suscriptor/perfil-suscriptor" element={<PerfilSuscriptor />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
