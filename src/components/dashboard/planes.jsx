"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  Star,
  Zap,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"

const PlanesPage = () => {
  const [planes, setPlanes] = useState([
    {
      id: 1,
      nombre: "Starter",
      descripcion: "Plan básico para equipos pequeños",
      precio: 0,
      moneda: "EUR",
      periodo: "mes",
      icono: "star",
      color: "#6b7280",
      caracteristicas: [
        "Hasta 100 respuestas/mes",
        "3 canales de distribución",
        "Reportes básicos",
        "Soporte por email",
      ],
      limitaciones: ["Sin IA avanzada", "Sin OCR", "Sin integraciones premium"],
      activo: true,
      popular: false,
      suscriptores: 245,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 2,
      nombre: "Professional",
      descripcion: "Para empresas en crecimiento",
      precio: 99,
      moneda: "EUR",
      periodo: "mes",
      icono: "zap",
      color: "#3b82f6",
      caracteristicas: [
        "Respuestas ilimitadas",
        "Todos los canales",
        "IA y OCR avanzado",
        "Reportes personalizados",
        "Soporte prioritario",
        "Integraciones premium",
        "API completa",
      ],
      limitaciones: ["Hasta 10 usuarios", "Almacenamiento 100GB"],
      activo: true,
      popular: true,
      suscriptores: 156,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 3,
      nombre: "Enterprise",
      descripcion: "Para grandes organizaciones",
      precio: 299,
      moneda: "EUR",
      periodo: "mes",
      icono: "crown",
      color: "#7c3aed",
      caracteristicas: [
        "Todo de Professional",
        "Usuarios ilimitados",
        "Almacenamiento ilimitado",
        "Soporte dedicado 24/7",
        "SLA garantizado",
        "Integraciones personalizadas",
        "Onboarding personalizado",
        "Consultoría estratégica",
      ],
      limitaciones: [],
      activo: true,
      popular: false,
      suscriptores: 34,
      fechaCreacion: "2024-01-20",
    },
    {
      id: 4,
      nombre: "Basic",
      descripcion: "Plan intermedio descontinuado",
      precio: 49,
      moneda: "EUR",
      periodo: "mes",
      icono: "users",
      color: "#f59e0b",
      caracteristicas: [
        "Hasta 1000 respuestas/mes",
        "5 canales de distribución",
        "Reportes avanzados",
        "Soporte por chat",
      ],
      limitaciones: ["IA limitada", "OCR básico", "Hasta 5 usuarios"],
      activo: false,
      popular: false,
      suscriptores: 12,
      fechaCreacion: "2024-01-10",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  const getIconByType = (icono) => {
    switch (icono) {
      case "star":
        return Star
      case "zap":
        return Zap
      case "crown":
        return Crown
      case "users":
        return Users
      default:
        return Star
    }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este plan?")) {
      setPlanes(planes.filter((plan) => plan.id !== id))
    }
  }

  const toggleActivo = (id) => {
    setPlanes(planes.map((plan) => (plan.id === id ? { ...plan, activo: !plan.activo } : plan)))
  }

  const togglePopular = (id) => {
    setPlanes(planes.map((plan) => (plan.id === id ? { ...plan, popular: !plan.popular } : plan)))
  }

  return (
    <DashboardLayout activeSection="planes">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona los planes y precios de las suscripciones
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Plan</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Planes</p>
                <p className="text-2xl font-bold text-gray-900">{planes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{planes.filter((p) => p.activo).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Suscriptores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {planes.reduce((sum, plan) => sum + plan.suscriptores, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{planes.reduce((sum, plan) => sum + plan.precio * plan.suscriptores, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {planes.map((plan) => {
            const IconComponent = getIconByType(plan.icono)
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-4 sm:p-6 relative ${
                  plan.popular ? "border-blue-500" : "border-gray-200"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Más Popular
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg text-white flex-shrink-0" style={{ backgroundColor: plan.color }}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{plan.nombre}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{plan.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => togglePopular(plan.id)}
                      className={`p-1 rounded ${plan.popular ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}`}
                      title="Marcar como popular"
                    >
                      <Star className={`h-4 w-4 ${plan.popular ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => toggleActivo(plan.id)}
                      className={`p-1 rounded ${plan.activo ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}`}
                      title="Activar/Desactivar"
                    >
                      <div className={`w-3 h-3 rounded-full ${plan.activo ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </button>
                    <button onClick={() => handleEdit(plan)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(plan.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.precio === 0 ? "Gratis" : `€${plan.precio}`}
                    </span>
                    {plan.precio > 0 && <span className="text-gray-500 ml-1">/{plan.periodo}</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Características incluidas:</h4>
                  <ul className="space-y-2">
                    {plan.caracteristicas.slice(0, 4).map((caracteristica, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{caracteristica}</span>
                      </li>
                    ))}
                    {plan.caracteristicas.length > 4 && (
                      <li className="text-sm text-blue-600 font-medium">
                        +{plan.caracteristicas.length - 4} características más
                      </li>
                    )}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitaciones.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Limitaciones:</h4>
                    <ul className="space-y-2">
                      {plan.limitaciones.slice(0, 2).map((limitacion, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-500">
                          <XCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{limitacion}</span>
                        </li>
                      ))}
                      {plan.limitaciones.length > 2 && (
                        <li className="text-sm text-gray-500">+{plan.limitaciones.length - 2} limitaciones más</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Suscriptores</span>
                    <span className="text-sm font-medium text-gray-900">{plan.suscriptores}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingresos/mes</span>
                    <span className="text-sm font-medium text-gray-900">
                      €{(plan.precio * plan.suscriptores).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver Detalles Completos
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Planes</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Plan
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Precio
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Suscriptores
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Ingresos/mes
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Estado
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
                  {planes.map((plan) => {
                    const IconComponent = getIconByType(plan.icono)
                    return (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white mr-3 flex-shrink-0"
                              style={{ backgroundColor: plan.color }}
                            >
                              <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{plan.nombre}</div>
                                {plan.popular && <Star className="h-4 w-4 text-yellow-500 fill-current ml-2" />}
                              </div>
                              <div className="text-sm text-gray-500 hidden sm:block truncate">{plan.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {plan.precio === 0 ? "Gratis" : `€${plan.precio}/${plan.periodo}`}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{plan.suscriptores}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              €{(plan.precio * plan.suscriptores).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                plan.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {plan.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="hidden sm:inline">{new Date(plan.fechaCreacion).toLocaleDateString()}</span>
                          <span className="sm:hidden">
                            {new Date(plan.fechaCreacion).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-900 p-1">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
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
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingPlan ? "Editar Plan" : "Nuevo Plan"}</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Professional"
                      defaultValue={editingPlan?.nombre || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={editingPlan?.icono || ""}
                    >
                      <option value="">Seleccionar icono</option>
                      <option value="star">Estrella</option>
                      <option value="zap">Rayo</option>
                      <option value="crown">Corona</option>
                      <option value="users">Usuarios</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el plan"
                    defaultValue={editingPlan?.descripcion || ""}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="99.00"
                      defaultValue={editingPlan?.precio || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={editingPlan?.moneda || "EUR"}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={editingPlan?.periodo || "mes"}
                    >
                      <option value="mes">Mes</option>
                      <option value="año">Año</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    defaultValue={editingPlan?.color || "#3b82f6"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Características (una por línea)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Respuestas ilimitadas&#10;Todos los canales&#10;IA y OCR avanzado"
                    defaultValue={editingPlan?.caracteristicas?.join("\n") || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limitaciones (una por línea)</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hasta 10 usuarios&#10;Almacenamiento 100GB"
                    defaultValue={editingPlan?.limitaciones?.join("\n") || ""}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked={editingPlan?.activo || false}
                    />
                    <span className="ml-2 text-sm text-gray-700">Plan activo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked={editingPlan?.popular || false}
                    />
                    <span className="ml-2 text-sm text-gray-700">Plan popular</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPlan(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingPlan ? "Actualizar" : "Crear"}
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

export default PlanesPage
