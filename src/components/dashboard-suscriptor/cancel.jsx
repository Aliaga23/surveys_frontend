import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Usamos react-router-dom
import DashboardSuscriptorLayout from './layout';

export default function CancelPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  // Usamos useNavigate de react-router-dom

  useEffect(() => {
    // Esta página es solo para mostrar que el pago fue cancelado
    setMessage("La suscripción ha sido cancelada. No se realizó el pago.");

    // Opcional: Redirigir después de un tiempo (si lo deseas)
    setTimeout(() => {
      navigate("/dashboard-suscriptor/planes");  // Redirige después de 5 segundos
    }, 5000);
  }, [navigate]);

  return (
    <DashboardSuscriptorLayout activeSection="planes">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-purple-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <h1 className="text-2xl font-bold mb-2">Pago Cancelado</h1>
          <p className="text-sm text-red-600">{message || "El pago fue cancelado. No se realizó la suscripción."}</p>

          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard-suscriptor/planes")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">Si no puedes realizar el pago, contacta con soporte.</p>
        </div>
      </div>
    </DashboardSuscriptorLayout>
  );
}
