import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";  // Cambié de 'next/navigation' a 'react-router-dom'
import DashboardSuscriptorLayout from "./layout";

export default function SuccessPage() {
  const [status, setStatus] = useState("loading");  // loading, success, error
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();  // Usamos useNavigate de react-router-dom

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Si no hay session_id, es un error
    if (!sessionId) {
      setStatus("error");
      setMessage("No se proporcionó un session_id válido.");
      return;
    }

    // Aquí ya podrías hacer una llamada al backend para verificar el session_id
    // Si todo está correcto, redirigir al dashboard de suscripción
    const verifyPayment = async () => {
      try {
        // Llamada a tu backend para verificar el session_id si es necesario
        const response = await fetch(`/api/stripe-verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage("¡Pago exitoso! Redirigiendo...");
          setTimeout(() => {
            navigate("/dashboard-suscriptor/planes");  // Redirige a la página de suscripción
          }, 3000);
        } else {
          setStatus("error");
          setMessage("Hubo un error con el pago, intenta nuevamente.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error al verificar el pago, por favor intenta nuevamente.");
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <DashboardSuscriptorLayout activeSection="planes">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <h1 className="text-2xl font-bold mb-2">Verificación de Pago</h1>
          <p className={`text-sm ${status === "error" ? "text-red-600" : "text-gray-600"}`}>
            {message || "Estamos procesando tu pago, por favor espera..."}
          </p>

          {status === "loading" && (
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          )}

          {status === "error" && (
            <div className="mt-6">
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardSuscriptorLayout>
  );
}
