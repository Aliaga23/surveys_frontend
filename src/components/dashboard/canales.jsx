"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Radio, Mail, MessageSquare, Smartphone, Globe, MoreHorizontal } from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import { actualizarCanal, crearCanal, eliminarCanal, listarCanales } from "../../services/api-admin"

const CanalesPage = () => {
  const [canales, setCanales] = useState([
    {
      id: 1,
      nombre: "Email",
      tipo: "email",
      descripcion: "Envío de encuestas por correo electrónico",
      configuracion: {
        servidor: "smtp.surveysaas.com",
        puerto: 587,
        ssl: true,
      },
      estado: "activo",
      encuestasEnviadas: 1250,
      tasaRespuesta: 23.5,
      fechaCreacion: "2024-01-15",
    },
    {
      id: 2,
      nombre: "WhatsApp Business",
      tipo: "whatsapp",
      descripcion: "Distribución vía WhatsApp Business API",
      configuracion: {
        apiKey: "wa_***************",
        webhook: "https://api.surveysaas.com/webhook/wa",
      },
      estado: "activo",
      encuestasEnviadas: 890,
      tasaRespuesta: 45.2,
      fechaCreacion: "2024-01-20",
    },
    {
      id: 3,
      nombre: "SMS",
      tipo: "sms",
      descripcion: "Mensajes de texto con enlaces a encuestas",
      configuracion: {
        proveedor: "Twilio",
        numeroOrigen: "+34900123456",
      },
      estado: "activo",
      encuestasEnviadas: 567,
      tasaRespuesta: 18.7,
      fechaCreacion: "2024-02-01",
    },
    {
      id: 4,
      nombre: "Web Embed",
      tipo: "web",
      descripcion: "Widget embebido en sitios web",
      configuracion: {
        dominio: "surveysaas.com",
        ssl: true,
        responsive: true,
      },
      estado: "activo",
      encuestasEnviadas: 2340,
      tasaRespuesta: 12.3,
      fechaCreacion: "2024-02-10",
    },
  ])

  useEffect(() => {
    async function fetchCanales() {
      try {
        const data = await listarCanales()

        const dataConValoresPorDefecto = data.map((canal) => ({
          ...canal,
          tipo: canal.tipo || "email",
          descripcion: canal.descripcion || "Canal de distribución",
          configuracion: canal.configuracion || {},
          estado: canal.estado || "activo",
          encuestasEnviadas: canal.encuestasEnviadas ?? 0,
          tasaRespuesta: canal.tasaRespuesta ?? 0,
          fechaCreacion: canal.fechaCreacion || new Date().toISOString(),
        }))

        setCanales(dataConValoresPorDefecto)
      } catch (error) {
        console.error("Error al cargar canales:", error)
      }
    }

    fetchCanales()
  }, [])
  console.log('Canales', canales)
  const [showModal, setShowModal] = useState(false)
  const [editingCanal, setEditingCanal] = useState(null)

  const getIconByType = (tipo) => {
    switch (tipo) {
      case "email":
        return Mail
      case "whatsapp":
        return MessageSquare
      case "sms":
        return Smartphone
      case "web":
        return Globe
      default:
        return Radio
    }
  }

  const getColorByType = (tipo) => {
    switch (tipo) {
      case "email":
        return "bg-blue-100 text-blue-600"
      case "whatsapp":
        return "bg-green-100 text-green-600"
      case "sms":
        return "bg-purple-100 text-purple-600"
      case "web":
        return "bg-orange-100 text-orange-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const handleEdit = (canal) => {
    setEditingCanal(canal)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este canal?")) {
      try {
        await eliminarCanal(id)

        const actualizados = await listarCanales()
        const normalizados = actualizados.map((c) => ({
          ...c,
          tipo: c.tipo || "email",
          descripcion: c.descripcion || "Canal de distribución",
          configuracion: c.configuracion || {},
          estado: c.estado || "activo",
          encuestasEnviadas: c.encuestasEnviadas ?? 0,
          tasaRespuesta: c.tasaRespuesta ?? 0,
          fechaCreacion: c.fechaCreacion || new Date().toISOString(),
        }))

        setCanales(normalizados)
      } catch (error) {
        console.error("Error al eliminar canal:", error)
        alert("No se pudo eliminar el canal.")
      }
    }
  }

  return (
    <DashboardLayout activeSection="canales">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Canales</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Configura y administra los canales de distribución
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Canal</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Radio className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Canales</p>
                <p className="text-2xl font-bold text-gray-900">{canales.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Encuestas Enviadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {canales.reduce((sum, canal) => sum + canal.encuestasEnviadas, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa Respuesta Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(canales.reduce((sum, canal) => sum + canal.tasaRespuesta, 0) / canales.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Canales Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {canales.filter((c) => c.estado === "activo").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {canales.map((canal) => {
            const IconComponent = getIconByType(canal.tipo)
            return (
              <div key={canal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${getColorByType(canal.tipo)} flex-shrink-0`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{canal.nombre}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{canal.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button onClick={() => handleEdit(canal)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(canal.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {canal.estado}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Encuestas Enviadas</span>
                    <span className="text-sm font-medium text-gray-900">
                      {canal.encuestasEnviadas.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de Respuesta</span>
                    <span className="text-sm font-medium text-gray-900">{canal.tasaRespuesta}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fecha Creación</span>
                    <span className="text-sm text-gray-500">{new Date(canal.fechaCreacion).toLocaleDateString()}</span>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCanal ? "Editar Canal" : "Nuevo Canal"}
              </h3>
              <form 
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target
                  const nombre = form[0].value
                  const tipo = form[1].value
                  const descripcion = form[2].value

                  const nuevoCanal = {
                    nombre,
                    tipo,
                    descripcion,
                    activo: true,
                  }

                  try {
                    if (editingCanal) {
                      await actualizarCanal(editingCanal.id, nuevoCanal)
                    } else {
                      await crearCanal(nuevoCanal)
                    }

                    const actualizados = await listarCanales()
                    const normalizados = actualizados.map((c) => ({
                      ...c,
                      tipo: c.tipo || "email",
                      descripcion: c.descripcion || "Canal de distribución",
                      configuracion: c.configuracion || {},
                      estado: c.estado || "activo",
                      encuestasEnviadas: c.encuestasEnviadas ?? 0,
                      tasaRespuesta: c.tasaRespuesta ?? 0,
                      fechaCreacion: c.fechaCreacion || new Date().toISOString(),
                    }))

                    setCanales(normalizados)
                    setShowModal(false)
                    setEditingCanal(null)
                  } catch (error) {
                    console.error("Error al guardar canal:", error)
                    alert("No se pudo guardar el canal.")
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Canal</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Email Marketing"
                    defaultValue={editingCanal?.nombre || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={editingCanal?.tipo || ""}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="web">Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el canal y su propósito"
                    defaultValue={editingCanal?.descripcion || ""}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCanal(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingCanal ? "Actualizar" : "Crear"}
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

export default CanalesPage
