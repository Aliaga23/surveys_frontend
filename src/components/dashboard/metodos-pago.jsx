"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  Wallet,
  Globe,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"

const MetodosPagoPage = () => {
  const [metodosPago, setMetodosPago] = useState([
    {
      id: 1,
      nombre: "Tarjeta de Crédito",
      descripcion: "Pagos con tarjetas Visa, Mastercard, American Express",
      tipo: "tarjeta",
      icono: "credit-card",
      proveedor: "Stripe",
      comision: 2.9,
      monedas: ["EUR", "USD", "GBP"],
      activo: true,
      transacciones: 1234,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 2,
      nombre: "PayPal",
      descripcion: "Pagos a través de la plataforma PayPal",
      tipo: "wallet",
      icono: "wallet",
      proveedor: "PayPal",
      comision: 3.4,
      monedas: ["EUR", "USD"],
      activo: true,
      transacciones: 567,
      fechaCreacion: "2024-01-20",
    },
    {
      id: 3,
      nombre: "Transferencia Bancaria",
      descripcion: "Transferencias bancarias directas SEPA",
      tipo: "banco",
      icono: "building",
      proveedor: "Banco Santander",
      comision: 1.5,
      monedas: ["EUR"],
      activo: true,
      transacciones: 89,
      fechaCreacion: "2024-02-01",
    },
    {
      id: 4,
      nombre: "Bizum",
      descripcion: "Pagos instantáneos con Bizum",
      tipo: "movil",
      icono: "smartphone",
      proveedor: "Redsys",
      comision: 0.5,
      monedas: ["EUR"],
      activo: true,
      transacciones: 234,
      fechaCreacion: "2024-02-10",
    },
    {
      id: 5,
      nombre: "Efectivo",
      descripcion: "Pagos en efectivo en puntos físicos",
      tipo: "efectivo",
      icono: "banknote",
      proveedor: "Interno",
      comision: 0,
      monedas: ["EUR"],
      activo: false,
      transacciones: 12,
      fechaCreacion: "2024-02-15",
    },
    {
      id: 6,
      nombre: "Criptomonedas",
      descripcion: "Pagos con Bitcoin, Ethereum y otras crypto",
      tipo: "crypto",
      icono: "globe",
      proveedor: "Coinbase",
      comision: 1.0,
      monedas: ["BTC", "ETH", "USDT"],
      activo: false,
      transacciones: 5,
      fechaCreacion: "2024-02-20",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingMetodo, setEditingMetodo] = useState(null)

  const getIconByType = (icono) => {
    switch (icono) {
      case "credit-card":
        return CreditCard
      case "wallet":
        return Wallet
      case "building":
        return Building
      case "smartphone":
        return Smartphone
      case "banknote":
        return Banknote
      case "globe":
        return Globe
      default:
        return CreditCard
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "tarjeta":
        return "bg-blue-100 text-blue-800"
      case "wallet":
        return "bg-purple-100 text-purple-800"
      case "banco":
        return "bg-green-100 text-green-800"
      case "movil":
        return "bg-orange-100 text-orange-800"
      case "efectivo":
        return "bg-gray-100 text-gray-800"
      case "crypto":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEdit = (metodo) => {
    setEditingMetodo(metodo)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este método de pago?")) {
      setMetodosPago(metodosPago.filter((metodo) => metodo.id !== id))
    }
  }

  const toggleActivo = (id) => {
    setMetodosPago(metodosPago.map((metodo) => (metodo.id === id ? { ...metodo, activo: !metodo.activo } : metodo)))
  }

  return (
    <DashboardLayout activeSection="metodos-pago">
      <div className="p-6">
        {/* Header */}
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
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Métodos</p>
                <p className="text-2xl font-bold text-gray-900">{metodosPago.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Métodos Activos</p>
                <p className="text-2xl font-bold text-gray-900">{metodosPago.filter((m) => m.activo).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metodosPago.reduce((sum, metodo) => sum + metodo.transacciones, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comisión Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metodosPago.reduce((sum, metodo) => sum + metodo.comision, 0) / metodosPago.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {metodosPago.map((metodo) => {
            const IconComponent = getIconByType(metodo.icono)
            return (
              <div key={metodo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{metodo.nombre}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{metodo.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => toggleActivo(metodo.id)}
                      className={`p-1 rounded ${metodo.activo ? "text-green-600 hover:text-green-800" : "text-gray-400 hover:text-gray-600"}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${metodo.activo ? "bg-green-500" : "bg-gray-300"}`}></div>
                    </button>
                    <button onClick={() => handleEdit(metodo)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(metodo.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(metodo.tipo)}`}
                    >
                      {metodo.tipo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Proveedor</span>
                    <span className="text-sm font-medium text-gray-900">{metodo.proveedor}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comisión</span>
                    <span className="text-sm font-medium text-gray-900">{metodo.comision}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transacciones</span>
                    <span className="text-sm font-medium text-gray-900">{metodo.transacciones}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monedas</span>
                    <div className="flex flex-wrap gap-1">
                      {metodo.monedas.slice(0, 3).map((moneda) => (
                        <span
                          key={moneda}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {moneda}
                        </span>
                      ))}
                      {metodo.monedas.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{metodo.monedas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metodo.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {metodo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver Configuración
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingMetodo ? "Editar Método de Pago" : "Nuevo Método de Pago"}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Tarjeta de Crédito"
                    defaultValue={editingMetodo?.nombre || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingMetodo?.tipo || ""}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="wallet">Wallet Digital</option>
                    <option value="banco">Transferencia Bancaria</option>
                    <option value="movil">Pago Móvil</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="crypto">Criptomonedas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Stripe"
                    defaultValue={editingMetodo?.proveedor || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comisión (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2.9"
                    defaultValue={editingMetodo?.comision || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el método de pago"
                    defaultValue={editingMetodo?.descripcion || ""}
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked={editingMetodo?.activo || false}
                    />
                    <span className="ml-2 text-sm text-gray-700">Método activo</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingMetodo(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingMetodo ? "Actualizar" : "Crear"}
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
