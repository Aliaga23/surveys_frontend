// src/components/dashboard/perfil-admin.jsx



import { useEffect, useState } from "react"
import {
  User,
  AtSign,
  ShieldCheck,
  CalendarCheck,
  Loader2,
  Edit,
  Save,
  Mail,
  KeyRound,
  X,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import { getCurrentUser, requestPasswordReset } from "../../services/auth"
import { updateAdmin } from "../../services/api-admin"

const PerfilAdmin = () => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ email: "" })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState({ type: "", message: "" })

  const cargarUsuario = async () => {
    try {
      setLoading(true)
      const data = await getCurrentUser()
      setUsuario(data)
      setFormData({ email: data.email })
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      setNotification({ type: "error", message: "Error al cargar el perfil." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuario()
  }, [])

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit, reset form data
      setFormData({ email: usuario.email })
      setErrors({})
    }
    setIsEditing(!isEditing)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null })
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = "El email es requerido."
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido."
    }
    return newErrors
  }

  const handleSave = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)
    setNotification({ type: "", message: "" })
    try {
      await updateAdmin({ email: formData.email })
      setNotification({ type: "success", message: "Perfil actualizado con éxito." })
      await cargarUsuario() // Recargar datos
      setIsEditing(false)
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      setNotification({ type: "error", message: error.message || "Error al actualizar." })
    } finally {
      setIsSaving(false)
      setTimeout(() => setNotification({ type: "", message: "" }), 3000)
    }
  }

  const handleRequestPasswordReset = async () => {
    setNotification({ type: "", message: "" })
    try {
      await requestPasswordReset(usuario.email)
      setNotification({
        type: "success",
        message: `Se ha enviado un enlace para restablecer la contraseña a ${usuario.email}. Revisa tu correo.`,
      })
    } catch (error) {
      console.error("Error al solicitar cambio de contraseña:", error)
      setNotification({
        type: "error",
        message: error.message || "No se pudo enviar el enlace. Inténtalo de nuevo.",
      })
    } finally {
      setTimeout(() => setNotification({ type: "", message: "" }), 5000)
    }
  }

  const badgeColor =
    usuario?.tipo === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"

  return (
    <DashboardLayout activeSection="perfil">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Perfil del Usuario</h1>
          {usuario && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </button>
              )}
            </div>
          )}
        </div>

        {notification.message && (
          <div
            className={`p-4 mb-4 text-sm rounded-lg ${
              notification.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : usuario ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 rounded-full bg-blue-50">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute h-5 w-5 text-gray-400 left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                              errors.email ? "border-red-500" : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 truncate">{usuario.email}</p>
                    )}
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}
                    >
                      {usuario.rol}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-center">
                    <AtSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      <strong>ID:</strong> {usuario.id}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      <strong>Rol:</strong> {usuario.rol}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      <strong>Registrado el:</strong> {new Date(usuario.creado_en).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full">
                <h3 className="font-bold text-lg mb-4">Seguridad</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Para cambiar tu contraseña, te enviaremos un enlace seguro a tu correo electrónico.
                </p>
                <button
                  onClick={handleRequestPasswordReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-black"
                >
                  <KeyRound className="h-4 w-4" />
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No se pudo cargar la información del usuario.</p>
        )}
      </div>
    </DashboardLayout>
  )
}

export default PerfilAdmin
