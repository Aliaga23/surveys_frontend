import { useState, useEffect } from "react";
import DashboardSuscriptorLayout from "./layout";
import { getMe } from "../../services/api";

const Configuracion = () => {
  const [suscriptor, setSuscriptor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <DashboardSuscriptorLayout activeSection="configuracion">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Configuración
            </h1>
            <p className="text-slate-600 text-lg">Gestiona tu suscripción</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Nombre</p>
                <p className="text-lg font-semibold text-slate-900 truncate">{suscriptor.nombre}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Correo electrónico</p>
                <p className="text-lg font-semibold text-slate-900 truncate">{suscriptor.email}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Estado</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
                    ${
                      suscriptor.estado === "activo"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : suscriptor.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      suscriptor.estado === "activo"
                        ? "bg-green-500"
                        : suscriptor.estado === "pendiente"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {suscriptor.estado}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => (window.location.href = "/dashboard-suscriptor/planes")}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
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
