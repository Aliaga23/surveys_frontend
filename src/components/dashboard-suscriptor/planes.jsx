"use client";

import { useEffect, useState } from "react";
import { listPlanes, iniciarStripeCheckout, getMe } from "../../services/api";
import { CheckCircle } from "lucide-react";
import DashboardSuscriptorLayout from "./layout"; // Importamos el Layout para mantener la estructura

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suscriptorId, setSuscriptorId] = useState(""); // Guardar el ID del suscriptor

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const data = await listPlanes();
        setPlanes(data);
      } catch (err) {
        console.error(err);
        setError("Error cargando planes.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch the current user data (including suscriptorId)
    const fetchUser = async () => {
      try {
        const userData = await getMe(); // Obtener datos del usuario actual
        setSuscriptorId(userData.id); // Guardar el ID del suscriptor
      } catch (err) {
        console.error(err);
        setError("Error obteniendo datos del suscriptor.");
      }
    };

    fetchPlanes();
    fetchUser(); // Llamada para obtener el ID del suscriptor
  }, []);

  const handleSuscripcion = async (planId) => {
    if (!suscriptorId) {
      alert("No se ha identificado al suscriptor. Por favor inicia sesión nuevamente.");
      return;
    }

    try {
      const result = await iniciarStripeCheckout(suscriptorId, planId);
      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        alert("No se pudo iniciar el checkout.");
      }
    } catch (err) {
      console.error(err);
      alert("Error iniciando el checkout.");
    }
  };

  if (loading) {
    return <div className="p-4">Cargando planes...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <DashboardSuscriptorLayout activeSection="planes">
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes de Suscripción</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="border rounded-lg shadow-sm p-6 bg-white hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <h2 className="text-xl font-semibold mb-2">{plan.nombre}</h2>
              <div className="text-3xl font-bold mb-4">
                {plan.precio_mensual === 0 ? "Gratis" : `€${plan.precio_mensual}/mes`}
              </div>
              <p className="text-gray-600 mb-4">{plan.descripcion}</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                {plan.caracteristicas?.split(";").map((caracteristica, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {caracteristica}
                  </li>
                ))}
              </ul>
              <div className="flex-grow"></div> {/* Esto asegura que el botón esté siempre al fondo */}
              <button
                onClick={() => handleSuscripcion(plan.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
              >
                Suscribirse
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardSuscriptorLayout>
  );
};

export default Planes;
