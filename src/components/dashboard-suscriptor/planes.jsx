import { useEffect, useState } from "react";
import { listPlanes, iniciarStripeCheckout, getMe } from "../../services/api";
import { CheckCircle } from "lucide-react";
import DashboardSuscriptorLayout from "./layout";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suscriptorId, setSuscriptorId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const dataPlanes = await listPlanes();
        setPlanes(dataPlanes);
      } catch (err) {
        console.error(err);
        setError("Error cargando planes.");
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const user = await getMe();
        setSuscriptorId(user.id);
      } catch (err) {
        console.error(err);
        setError("Error obteniendo datos del suscriptor.");
      }
    })();
  }, []);

  const handleSuscripcion = async (planId) => {
    if (!suscriptorId) {
      alert("No se ha identificado al suscriptor. Inicia sesión nuevamente.");
      return;
    }
    try {
      const { checkout_url } = await iniciarStripeCheckout(suscriptorId, planId);
      if (checkout_url) window.location.href = checkout_url;
      else alert("No se pudo iniciar el checkout.");
    } catch (err) {
      console.error(err);
      alert("Error iniciando el checkout.");
    }
  };

  if (loading) return <div className="p-4">Cargando planes…</div>;
  if (error)   return <div className="p-4 text-red-600">{error}</div>;

  return (
    <DashboardSuscriptorLayout activeSection="planes">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Planes de Suscripción
            </h1>
            <p className="text-slate-600 text-lg">Elige el plan que mejor se adapte a tu crecimiento</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 flex flex-col"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-1 truncate">{plan.nombre}</h2>
              <div className="text-3xl font-bold text-slate-900 mb-4">
                {plan.precio_mensual === 0 ? "Gratis" : `€${plan.precio_mensual}/mes`}
              </div>

              <p className="text-slate-600 mb-4 line-clamp-3">{plan.descripcion}</p>

              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                {plan.caracteristicas?.split(";").map((c, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleSuscripcion(plan.id)}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  Suscribirse
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardSuscriptorLayout>
  );
};

export default Planes;
