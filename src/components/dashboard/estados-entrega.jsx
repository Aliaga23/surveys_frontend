

import { useEffect, useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  Star,
  MessageSquare,
  FileText,
  CheckSquare,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarEstadosEntrega,
  crearEstadoEntrega,
  actualizarEstadoEntrega,
  eliminarEstadoEntrega,
} from "../../services/api-admin"

const EstadosEntregaPage = () => {
  const [estadosEntrega, setEstadosEntrega] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState("")
  const [editingId, setEditingId] = useState(null)

  const fetchEstados = async () => {
    try {
      const data = await listarEstadosEntrega()
      setEstadosEntrega(data)
    } catch (error) {
      console.error("Error al obtener estados de entrega:", error)
    }
  }

  useEffect(() => {
    fetchEstados()
  }, [])

  const getIconByName = (nombre) => {
    const iconos = {
      pendiente: Clock,
      enviada: Send,
      respondida: CheckCircle,
      failed: XCircle,
      rebotada: AlertTriangle,
    }
    return iconos[nombre.toLowerCase()] || Truck
  }

  const getColorByName = (nombre) => {
    const colores = {
      pendiente: "#6b7280",
      enviada: "#3b82f6",
      respondida: "#10b981",
      failed: "#ef4444",
      rebotada: "#f97316",
    }
    return colores[nombre.toLowerCase()] || "#3b82f6"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await actualizarEstadoEntrega(editingId, nombre)
      } else {
        await crearEstadoEntrega(nombre)
      }
      setNombre("")
      setEditingId(null)
      setShowModal(false)
      fetchEstados()
    } catch (error) {
      console.error("Error al guardar estado:", error)
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
        await eliminarEstadoEntrega(id)
        fetchEstados()
      } catch (error) {
        console.error("Error al eliminar estado:", error)
      }
    }
  }

  return (
    <DashboardLayout activeSection="estados-entrega">
      <div className="p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Estados de Entrega</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona los estados del proceso de entrega de encuestas
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Estado</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{estadosEntrega.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadosEntrega.reduce((sum, tipo) => sum + (tipo.usosActivos ?? 0), 0)}

                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Más Usado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...estadosEntrega.map((t) => t.usosActivos ?? 0))}

                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(estadosEntrega.map((t) => t.categoria || 'Sin categoría')).size}

                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Estados</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadosEntrega.map((estado) => {
                    const IconComponent = getIconByName(estado.nombre)
                    const color = getColorByName(estado.nombre)
                    return (
                      <tr key={estado.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: color }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-gray-900 font-medium">{estado.nombre}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(estado)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(estado.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? "Editar Estado" : "Nuevo Estado"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: enviada"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingId(null)
                      setNombre("")
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
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

export default EstadosEntregaPage
