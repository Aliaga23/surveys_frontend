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
import PrivateRoute from './components/PrivateRoute';
function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/encuestas/:token" element={<EncuestaPage />} />

        {/* Rutas protegidas - admin */}
        <Route path="/dashboard/roles" element={
          <PrivateRoute requiredType="admin"><Roles /></PrivateRoute>
        } />
        <Route path="/dashboard/canales" element={
          <PrivateRoute requiredType="admin"><Canales /></PrivateRoute>
        } />
        <Route path="/dashboard/estado-documento" element={
          <PrivateRoute requiredType="admin"><EstadoDocumento /></PrivateRoute>
        } />
        <Route path="/dashboard/estados-entrega" element={
          <PrivateRoute requiredType="admin"><EstadoEntrega /></PrivateRoute>
        } />
        <Route path="/dashboard/estados-pago" element={
          <PrivateRoute requiredType="admin"><EstadosPago /></PrivateRoute>
        } />
        <Route path="/dashboard/tipos-pregunta" element={
          <PrivateRoute requiredType="admin"><TiposPregunta /></PrivateRoute>
        } />
        <Route path="/dashboard/metodos-pago" element={
          <PrivateRoute requiredType="admin"><MetodoPago /></PrivateRoute>
        } />
        <Route path="/dashboard/estados-campana" element={
          <PrivateRoute requiredType="admin"><EstadosCampaña /></PrivateRoute>
        } />
        <Route path="/dashboard/planes" element={
          <PrivateRoute requiredType="admin"><Planes /></PrivateRoute>
        } />

        {/* Rutas protegidas - suscriptor */}
        <Route path="/dashboard-suscriptor/plantillas" element={
          <PrivateRoute requiredType="suscriptor"><PlantillasPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/campanas" element={
          <PrivateRoute requiredType="suscriptor"><CampanasPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/destinatarios" element={
          <PrivateRoute requiredType="suscriptor"><DestinatariosPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/entregas" element={
          <PrivateRoute requiredType="suscriptor"><EntregasPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/respuestas" element={
          <PrivateRoute requiredType="suscriptor"><RespuestasPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
