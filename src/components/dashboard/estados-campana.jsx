"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Play, Pause, CheckCircle, XCircle, Clock, Target
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarEstadosCampana,
  crearEstadoCampana,
  actualizarEstadoCampana,
  eliminarEstadoCampana
} from "../../services/api-admin"

const estadoIconos = {
  borrador: { icono: Target, color: "#6b7280" },
  programada: { icono: Clock, color: "#f59e0b" },
  enviada: { icono: Play, color: "#10b981" },
  pausada: { icono: Pause, color: "#f97316" },
  completada: { icono: CheckCircle, color: "#059669" },
  cerrada: { icono: XCircle, color: "#dc2626" },
}

const getIconData = (nombre) => {
  const key = nombre?.toLowerCase()
  return estadoIconos[key] || { icono: Target, color: "#3b82f6" }
}

const EstadosCampanaPage = () => {
  const [estados, setEstados] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState("")
  const [editingId, setEditingId] = useState(null)

  const fetchEstados = async () => {
    try {
      const data = await listarEstadosCampana()
      setEstados(data)
    } catch (error) {
      console.error("Error al obtener estados:", error)
    }
  }

  useEffect(() => {
    fetchEstados()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await actualizarEstadoCampana(editingId, nombre)
      } else {
        await crearEstadoCampana(nombre)
      }
      setNombre("")
      setEditingId(null)
      setShowModal(false)
      fetchEstados()
    } catch (error) {
      console.error("Error al guardar estado:", error)
      alert("Hubo un error al guardar. Revisa la consola.")
    }
  }

  const handleEdit = (estado) => {
    setNombre(estado.nombre)
    setEditingId(estado.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este estado?")) {
      try {
        await eliminarEstadoCampana(id)
        fetchEstados()
      } catch (error) {
        console.error("Error al eliminar estado:", error)
      }
    }
  }

  return (
    <DashboardLayout activeSection="estados-campana">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Estados de Campaña</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="inline w-4 h-4 mr-2" /> Nuevo Estado
          </button>
        </div>

        {/* Visualización flujo */}
        <div className="flex gap-6 mb-8">
          {estados.map((estado) => {
            const { icono: Icon, color } = getIconData(estado.nombre)
            return (
              <div key={estado.id} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-1 text-sm font-medium">{estado.nombre}</span>
              </div>
            )
          })}
        </div>

        {/* Tabla */}
        <table className="w-full bg-white shadow-sm rounded-xl overflow-hidden">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estados.map((estado) => {
              const { icono: Icon, color } = getIconData(estado.nombre)
              return (
                <tr key={estado.id} className="border-t">
                  <td className="p-4 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-gray-900 font-medium">{estado.nombre}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(estado)} className="text-blue-600 hover:underline mr-3">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(estado.id)} className="text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? "Editar Estado" : "Nuevo Estado"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingId(null)
                      setNombre("")
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingId ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default EstadosCampanaPage
