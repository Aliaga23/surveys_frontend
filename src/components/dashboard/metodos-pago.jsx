"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  Wallet,
  Globe,  
  Star,
  MessageSquare,
  FileText,
  CheckSquare,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarMetodosPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago
} from "../../services/api-admin"

const getIconByNombre = (nombre) => {
  const iconos = {
    tarjeta: CreditCard,
    wallet: Wallet,
    transferencia: Building,
    movil: Smartphone,
    efectivo: Banknote,
    stripe: Globe,
  }
  return iconos[nombre?.toLowerCase()] || CreditCard
}

const MetodosPagoPage = () => {
  const [metodosPago, setMetodosPago] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [nombre, setNombre] = useState("")
  const [editingId, setEditingId] = useState(null)

  const fetchMetodos = async () => {
    try {
      const data = await listarMetodosPago()
      setMetodosPago(data)
    } catch (error) {
      console.error("Error al obtener métodos de pago:", error)
    }
  }

  useEffect(() => {
    fetchMetodos()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await actualizarMetodoPago(editingId, nombre)
      } else {
        await crearMetodoPago(nombre)
      }
      setNombre("")
      setEditingId(null)
      setShowModal(false)
      fetchMetodos()
    } catch (error) {
      console.error("Error al guardar método de pago:", error)
    }
  }

  const handleEdit = (metodo) => {
    setNombre(metodo.nombre)
    setEditingId(metodo.id)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este método de pago?")) {
      try {
        await eliminarMetodoPago(id)
        fetchMetodos()
      } catch (error) {
        console.error("Error al eliminar método de pago:", error)
      }
    }
  }

  return (
    <DashboardLayout activeSection="metodos-pago">
      <div className="p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Métodos de Pago</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona los métodos de pago disponibles para los clientes
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Método</span>
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
                <p className="text-2xl font-bold text-gray-900">{metodosPago.length}</p>
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
                  {metodosPago.reduce((sum, tipo) => sum + (tipo.usosActivos ?? 0), 0)}

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
                  {Math.max(...metodosPago.map((t) => t.usosActivos ?? 0))}

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
                  {new Set(metodosPago.map((t) => t.categoria || 'Sin categoría')).size}

                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {metodosPago.map((metodo) => {
            const IconComponent = getIconByNombre(metodo.nombre)
            return (
              <div key={metodo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {metodo.nombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Método de pago para operaciones financieras.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleEdit(metodo)} className="text-blue-600 hover:text-blue-900 p-1">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(metodo.id)} className="text-red-600 hover:text-red-900 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? "Editar Método de Pago" : "Nuevo Método de Pago"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Stripe"
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

export default MetodosPagoPage
