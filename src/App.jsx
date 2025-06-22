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
import PerfilAdmin from './components/dashboard/perfil-admin';
import PerfilSuscriptor from './components/dashboard-suscriptor/perfil-suscriptor';
import PlantillasPage from './components/dashboard-suscriptor/plantillas';
import CampanasPage from './components/dashboard-suscriptor/campanas';
import DestinatariosPage from './components/dashboard-suscriptor/destinatarios';
import EntregasPage from './components/dashboard-suscriptor/entregas';
import RespuestasPage from './components/dashboard-suscriptor/respuestas';
import ConfiguracionPage from './components/dashboard-suscriptor/configuracion';  // Nuevo
import PlanesSuscriptorPage from './components/dashboard-suscriptor/planes';      // Nuevo
import EncuestaPage from './pages/EncuestaPage';
import EmailSentPage from './pages/EmailSentPage';
import VerifyRegistrationPage from './pages/VerifyRegistrationPage';
import CancelPage from './components/dashboard-suscriptor/cancel'; // Nueva página de cancelación
import SuccessPage from './components/dashboard-suscriptor/success'; // Nueva página de éxito
import PrivateRoute from './components/PrivateRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/encuestas/:token" element={<EncuestaPage />} />
        <Route path="/email-sent" element={<EmailSentPage />} />
        <Route path="/verify-registration" element={<VerifyRegistrationPage />} />
        
        {/* Ruta pública para cancelación */}
        <Route path="/dashboard-suscriptor/planes/cancel" element={<CancelPage />} /> {/* Ruta para la página de cancelación */}
        
        {/* Ruta pública para éxito */}
        <Route path="/dashboard-suscriptor/planes/success" element={<SuccessPage />} /> {/* Ruta para la página de éxito */}

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
        <Route path="/dashboard/perfil-admin" element={
          <PrivateRoute requiredType="admin"><PerfilAdmin /></PrivateRoute>
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
        <Route path="/dashboard-suscriptor/configuracion" element={
          <PrivateRoute requiredType="suscriptor"><ConfiguracionPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/planes" element={
          <PrivateRoute requiredType="suscriptor"><PlanesSuscriptorPage /></PrivateRoute>
        } />
        <Route path="/dashboard-suscriptor/perfil-suscriptor" element={
          <PrivateRoute requiredType="suscriptor"><PerfilSuscriptor /></PrivateRoute>
        } />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
