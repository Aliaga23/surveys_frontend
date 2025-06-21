import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { verifyRegistrationRequest } from '../services/auth';

const VerifyRegistrationPage = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasVerified = useRef(false); // Esto asegura una sola ejecución

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }

    if (hasVerified.current) {
      return; // Si ya verificamos, no lo hacemos otra vez
    }

    hasVerified.current = true; // Marcamos que ya hicimos la verificación

    const verify = async () => {
      try {
        await verifyRegistrationRequest(token);
        setStatus('success');
        setMessage('¡Tu cuenta ha sido verificada correctamente! Redirigiendo...');
        setTimeout(() => {
          navigate('/dashboard-suscriptor/plantillas');
        }, 3000);
      } catch (err) {
        console.error(err);
        setStatus('error');
        setMessage(err.message || 'El enlace de verificación es inválido o ha expirado.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="h-10 w-10 text-blue-600 mr-2" />
          <span className="text-xl font-bold text-gray-900">SurveySaaS</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verificación de Cuenta</h1>
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message || 'Verificando tu cuenta, por favor espera...'}
        </p>
        {status === 'loading' && (
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        )}
        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyRegistrationPage;
