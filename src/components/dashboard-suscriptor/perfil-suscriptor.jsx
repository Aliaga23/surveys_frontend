// src/components/dashboard-suscriptor/perfil-admin.jsx
import { useEffect, useState } from "react";
import {
  User, ShieldCheck, CalendarCheck, Loader2, Edit, Save, Mail,
  KeyRound, X, Phone
} from "lucide-react";
import DashboardSuscriptorLayout from "./layout";
import { getCurrentUser, requestPasswordReset } from "../../services/auth";
import { updateSuscriptor } from "../../services/api";

const PerfilSuscriptor = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", telefono: "" });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  /** ─────────────────  Helpers  ───────────────── **/
  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUsuario(data);
      setFormData({
        nombre: data.nombre || "",
        email: data.email || "",
        telefono: data.telefono || ""
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Error al cargar el perfil." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarUsuario(); }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({ nombre: usuario.nombre, email: usuario.email, telefono: usuario.telefono });
      setErrors({});
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = "El nombre es requerido.";
    if (!formData.email) newErrors.email = "El email es requerido.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Formato de email inválido.";
    if (!formData.telefono) newErrors.telefono = "El teléfono es requerido.";
    return newErrors;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      await updateSuscriptor(formData);
      setNotification({ type: "success", message: "Perfil actualizado con éxito." });
      await cargarUsuario();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: err.message || "Error al actualizar." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    }
  };

  const handleRequestPasswordReset = async () => {
    try {
      await requestPasswordReset(usuario.email);
      setNotification({
        type: "success",
        message: `Enviamos un enlace para restablecer la contraseña a ${usuario.email}.`
      });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: err.message || "No se pudo enviar el enlace." });
    } finally {
      setTimeout(() => setNotification({ type: "", message: "" }), 5000);
    }
  };

  /** ─────────────────  UI  ───────────────── **/
  const badgeColor = usuario?.tipo === "admin"
    ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";

  return (
    <DashboardSuscriptorLayout activeSection="perfil">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        {/* Cabecera */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Perfil del Suscriptor
            </h1>
            <p className="text-slate-600 text-lg">Gestiona tu información y seguridad</p>
          </div>

          {usuario && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all"
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-slate-700 bg-slate-200 hover:bg-slate-300 transition-all"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </button>
              )}
            </div>
          )}
        </div>

        {/* Notificación */}
        {notification.message && (
          <div
            className={`p-4 mb-8 text-sm rounded-xl ${
              notification.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
          </div>
        ) : usuario ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tarjeta de perfil */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-green-50">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-slate-900 truncate">
                      {isEditing ? "Editando Perfil" : usuario.nombre}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                      {usuario.rol}
                    </span>
                  </div>
                </div>

                {/* Datos */}
                {isEditing ? (
                  /* ----- Formulario ----- */
                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre
                      </label>
                      <div className="relative">
                        <input
                          type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange}
                          className={`w-full pl-4 pr-4 py-3 bg-white/80 backdrop-blur-sm border ${errors.nombre ? "border-red-500" : "border-slate-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <input
                          type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                          className={`w-full pl-4 pr-4 py-3 bg-white/80 backdrop-blur-sm border ${errors.email ? "border-red-500" : "border-slate-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <input
                          type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange}
                          className={`w-full pl-4 pr-4 py-3 bg-white/80 backdrop-blur-sm border ${errors.telefono ? "border-red-500" : "border-slate-200"} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      {errors.telefono && <p className="text-xs text-red-600 mt-1">{errors.telefono}</p>}
                    </div>
                  </div>
                ) : (
                  /* ----- Vista de sólo lectura ----- */
                  <div className="space-y-4 text-sm text-slate-700">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <strong>Email:</strong> {usuario.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <strong>Teléfono:</strong> {usuario.telefono}
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      <strong>Rol:</strong> {usuario.rol}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-slate-500" />
                      <strong>Registrado el:</strong>{" "}
                      {new Date(usuario.creado_en).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de seguridad */}
            <div className="md:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Seguridad</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Para cambiar tu contraseña envíamos un enlace seguro a tu correo.
                </p>
                <button
                  onClick={handleRequestPasswordReset}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  <KeyRound className="h-4 w-4" />
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500">No se pudo cargar la información del usuario.</p>
        )}
      </div>
    </DashboardSuscriptorLayout>
  );
};

export default PerfilSuscriptor;
