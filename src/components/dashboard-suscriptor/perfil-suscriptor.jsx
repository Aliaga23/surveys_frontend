// src/components/dashboard-suscriptor/perfil-admin.jsx

"use client"

import { useEffect, useState } from "react"
import {
  User,
  AtSign,
  ShieldCheck,
  CalendarCheck,
  Loader2,
} from "lucide-react"
import DashboardSuscriptorLayout from "./layout"
import { getCurrentUser } from "../../services/auth"

const PerfilSuscriptor = () => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const data = await getCurrentUser()
        setUsuario(data)
      } catch (error) {
        console.error("Error al obtener usuario:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarUsuario()
  }, [])

  const badgeColor =
    usuario?.tipo === "admin" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"

  return (
    <DashboardSuscriptorLayout activeSection="perfil">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : usuario ? (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-xl w-full">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-full bg-green-50">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-900 truncate">{usuario.email}</p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                  {usuario.tipo === "admin" ? "Administrador" : "Suscriptor"}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-center">
                <AtSign className="h-4 w-4 mr-2 text-gray-500" />
                <span><strong>ID:</strong> {usuario.id}</span>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 text-gray-500" />
                <span><strong>Rol:</strong> {usuario.rol}</span>
              </div>
              <div className="flex items-center">
                <CalendarCheck className="h-4 w-4 mr-2 text-gray-500" />
                <span><strong>Registrado el:</strong> {new Date(usuario.creado_en).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No se pudo cargar la información del usuario.</p>
        )}
      </div>
    </DashboardSuscriptorLayout>
  )
}

export default PerfilSuscriptor
