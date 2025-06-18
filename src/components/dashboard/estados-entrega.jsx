"use client"

import { useState } from "react"
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
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"

const EstadosEntregaPage = () => {
  const [estadosEntrega, setEstadosEntrega] = useState([
    {
      id: 1,
      nombre: "Pendiente",
      descripcion: "Encuesta preparada para envío",
      color: "#6b7280",
      icono: "pending",
      orden: 1,
      esInicial: true,
      esFinal: false,
      entregas: 234,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 2,
      nombre: "En Cola",
      descripcion: "Encuesta en cola de envío",
      color: "#f59e0b",
      icono: "clock",
      orden: 2,
      esInicial: false,
      esFinal: false,
      entregas: 89,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 3,
      nombre: "Enviando",
      descripcion: "Encuesta siendo enviada",
      color: "#3b82f6",
      icono: "sending",
      orden: 3,
      esInicial: false,
      esFinal: false,
      entregas: 45,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 4,
      nombre: "Entregada",
      descripcion: "Encuesta entregada exitosamente",
      color: "#10b981",
      icono: "delivered",
      orden: 4,
      esInicial: false,
      esFinal: true,
      entregas: 1567,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 5,
      nombre: "Fallida",
      descripcion: "Error en la entrega de la encuesta",
      color: "#ef4444",
      icono: "failed",
      orden: 5,
      esInicial: false,
      esFinal: true,
      entregas: 23,
      fechaCreacion: "2024-01-20",
    },
    {
      id: 6,
      nombre: "Rebotada",
      descripcion: "Encuesta rebotada por el destinatario",
      color: "#f97316",
      icono: "bounced",
      orden: 6,
      esInicial: false,
      esFinal: true,
      entregas: 12,
      fechaCreacion: "2024-01-25",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingEstado, setEditingEstado] = useState(null)

  const getIconByType = (icono) => {
    switch (icono) {
      case "pending":
        return Clock
      case "clock":
        return Clock
      case "sending":
        return Send
      case "delivered":
        return CheckCircle
      case "failed":
        return XCircle
      case "bounced":
        return AlertTriangle
      default:
        return Truck
    }
  }

  const handleEdit = (estado) => {
    setEditingEstado(estado)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este estado?")) {
      setEstadosEntrega(estadosEntrega.filter((estado) => estado.id !== id))
    }
  }

  return (
    <DashboardLayout activeSection="estados-entrega">
      <div className="p-6">
        {/* Header */}
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
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Estados</p>
                <p className="text-2xl font-bold text-gray-900">{estadosEntrega.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadosEntrega.find((e) => e.nombre === "Entregada")?.entregas || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Send className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadosEntrega.filter((e) => !e.esFinal).reduce((sum, estado) => sum + estado.entregas, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fallidas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadosEntrega
                    .filter(
                      (e) => e.nombre.toLowerCase().includes("fallida") || e.nombre.toLowerCase().includes("rebotada"),
                    )
                    .reduce((sum, estado) => sum + estado.entregas, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Flujo de Entrega</h3>
          <div className="overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-4 min-w-max pb-2">
              {estadosEntrega
                .filter(
                  (e) => !e.nombre.toLowerCase().includes("fallida") && !e.nombre.toLowerCase().includes("rebotada"),
                )
                .sort((a, b) => a.orden - b.orden)
                .map((estado, index, array) => {
                  const IconComponent = getIconByType(estado.icono)
                  return (
                    <div key={estado.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: estado.color }}
                        >
                          <IconComponent className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 mt-2 text-center max-w-[80px] truncate">
                          {estado.nombre}
                        </span>
                        <span className="text-xs text-gray-500">{estado.entregas}</span>
                      </div>
                      {index < array.length - 1 && (
                        <div className="w-6 sm:w-8 h-0.5 bg-gray-300 mx-2 sm:mx-4 mt-[-20px]"></div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Estados</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[250px]">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Tipo
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Entregas
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Orden
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fecha Creación
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadosEntrega.map((estado) => {
                    const IconComponent = getIconByType(estado.icono)
                    return (
                      <tr key={estado.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0"
                              style={{ backgroundColor: estado.color }}
                            >
                              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900">{estado.nombre}</div>
                              <div className="text-sm text-gray-500 hidden sm:block truncate">{estado.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {estado.esInicial && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Inicial
                              </span>
                            )}
                            {estado.esFinal && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Final
                              </span>
                            )}
                            {!estado.esInicial && !estado.esFinal && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Intermedio
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{estado.entregas}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{estado.orden}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="hidden sm:inline">
                            {new Date(estado.fechaCreacion).toLocaleDateString()}
                          </span>
                          <span className="sm:hidden">
                            {new Date(estado.fechaCreacion).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingEstado ? "Editar Estado" : "Nuevo Estado"}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Estado</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: En Tránsito"
                    defaultValue={editingEstado?.nombre || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe qué significa este estado"
                    defaultValue={editingEstado?.descripcion || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    defaultValue={editingEstado?.color || "#3b82f6"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingEstado?.icono || ""}
                  >
                    <option value="">Seleccionar icono</option>
                    <option value="pending">Pendiente</option>
                    <option value="clock">En Cola</option>
                    <option value="sending">Enviando</option>
                    <option value="delivered">Entregada</option>
                    <option value="failed">Fallida</option>
                    <option value="bounced">Rebotada</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1"
                      defaultValue={editingEstado?.orden || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked={editingEstado?.esInicial || false}
                      />
                      <span className="ml-2 text-sm text-gray-700">Estado inicial</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked={editingEstado?.esFinal || false}
                      />
                      <span className="ml-2 text-sm text-gray-700">Estado final</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEstado(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingEstado ? "Actualizar" : "Crear"}
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
