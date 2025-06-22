
import { useState, useEffect } from "react";
import DashboardSuscriptorLayout from "./layout";
import { getMe } from "../../services/api"; // Asume que ya tienes este método implementado

const Configuracion = () => {
  const [suscriptor, setSuscriptor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setSuscriptor(data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la información de la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardSuscriptorLayout activeSection="configuracion">
      <div className="p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Configuración</h1>
        <p className="text-gray-600 mb-6">Gestiona tu cuenta y suscripción</p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Nombre</p>
                <p className="text-lg font-semibold text-gray-900">{suscriptor.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Correo electrónico</p>
                <p className="text-lg font-semibold text-gray-900">{suscriptor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Estado</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    suscriptor.estado === "activo"
                      ? "bg-green-100 text-green-800"
                      : suscriptor.estado === "pendiente"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {suscriptor.estado}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  window.location.href = "/dashboard-suscriptor/planes";
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                Mejorar Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardSuscriptorLayout>
  );
};

export default Configuracion;
