"use client"

import { useState, useEffect } from "react"
import {
  getCampanas,
  getEntregasByCampana,
  createEntrega,
  deleteEntrega,
  markEntregaAsSent,
  markEntregaAsResponded,
  getDestinatarios,
} from "../../services/api"
import DashboardSuscriptorLayout from "./layout"

export default function Entregas() {
  const [campanas, setCampanas] = useState([])
  const [entregas, setEntregas] = useState({}) // Agrupadas por campaña
  const [destinatarios, setDestinatarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCampana, setFilterCampana] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedEntrega, setSelectedEntrega] = useState(null)
  const [formData, setFormData] = useState({
    campana_id: "",
    destinatario_id: "",
    canal_id: "",
  })

  // Catálogos
  const canales = [
    { id: 1, nombre: "Email", color: "blue", icon: "mail" },
    { id: 2, nombre: "WhatsApp", color: "green", icon: "message-circle" },
    { id: 3, nombre: "Vapi", color: "purple", icon: "phone" },
  ]

  const estados = [
    { id: 1, nombre: "Pendiente", color: "gray", icon: "clock" },
    { id: 2, nombre: "Enviado", color: "blue", icon: "send" },
    { id: 3, nombre: "Respondido", color: "green", icon: "check-circle" },
    { id: 4, nombre: "Fallido", color: "red", icon: "x-circle" },
  ]

  const [expandedCards, setExpandedCards] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [campanasData, destinatariosData] = await Promise.all([getCampanas(), getDestinatarios()])

      setCampanas(campanasData)
      setDestinatarios(destinatariosData)

      // Cargar entregas para cada campaña
      const entregasData = {}
      for (const campana of campanasData) {
        try {
          const campanEntregas = await getEntregasByCampana(campana.id)
          entregasData[campana.id] = campanEntregas
        } catch (err) {
          console.warn(`Error cargando entregas para campaña ${campana.id}:`, err)
          entregasData[campana.id] = []
        }
      }
      setEntregas(entregasData)
    } catch (err) {
      setError("Error al cargar datos: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        destinatario_id: formData.destinatario_id,
        canal_id: Number.parseInt(formData.canal_id),
      }

      await createEntrega(formData.campana_id, dataToSend)
      setShowModal(false)
      resetForm()
      setError("")
      loadData()
    } catch (err) {
      setError("Error al crear entrega: " + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      campana_id: "",
      destinatario_id: "",
      canal_id: "",
    })
  }

  const handleDelete = async (campanaId, entregaId) => {
    if (window.confirm("¿Estás seguro de eliminar esta entrega?")) {
      try {
        await deleteEntrega(campanaId, entregaId)
        loadData()
      } catch (err) {
        setError("Error al eliminar: " + err.message)
      }
    }
  }

  const handleMarkAsSent = async (campanaId, entregaId) => {
    try {
      await markEntregaAsSent(campanaId, entregaId)
      loadData()
    } catch (err) {
      setError("Error al marcar como enviado: " + err.message)
    }
  }

  const handleMarkAsResponded = async (campanaId, entregaId) => {
    try {
      await markEntregaAsResponded(campanaId, entregaId)
      loadData()
    } catch (err) {
      setError("Error al marcar como respondido: " + err.message)
    }
  }

  const openDetail = (entrega, campana) => {
    setSelectedEntrega({ ...entrega, campana })
    setShowDetailModal(true)
  }

  const getNombrePorId = (lista, id) => {
    const item = lista.find((item) => item.id === id)
    return item ? item.nombre : "N/A"
  }

  const getEstadoColor = (id) => {
    const estado = estados.find((e) => e.id === id)
    if (!estado) return "bg-gray-100 text-gray-700 border-gray-200"

    const colorMap = {
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      red: "bg-red-100 text-red-700 border-red-200",
    }

    return colorMap[estado.color] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getCanalColor = (id) => {
    const canal = canales.find((c) => c.id === id)
    if (!canal) return "bg-gray-100 text-gray-700 border-gray-200"

    const colorMap = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
    }

    return colorMap[canal.color] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const getStats = () => {
    let total = 0
    let pendientes = 0
    let enviados = 0
    let respondidos = 0
    let fallidos = 0

    Object.values(entregas).forEach((campanEntregas) => {
      campanEntregas.forEach((entrega) => {
        total++
        if (entrega.estado_id === 1) pendientes++
        else if (entrega.estado_id === 2) enviados++
        else if (entrega.estado_id === 3) respondidos++
        else if (entrega.estado_id === 4) fallidos++
      })
    })

    return { total, pendientes, enviados, respondidos, fallidos }
  }

  const getFilteredEntregas = () => {
    const filtered = []

    Object.entries(entregas).forEach(([campanaId, campanEntregas]) => {
      const campana = campanas.find((c) => c.id === campanaId)
      if (!campana) return

      campanEntregas.forEach((entrega) => {
        const destinatario = destinatarios.find((d) => d.id === entrega.destinatario_id)

        // Filtro por campaña
        if (filterCampana !== "all" && campanaId !== filterCampana) return

        // Filtro por estado
        if (filterStatus !== "all" && entrega.estado_id.toString() !== filterStatus) return

        // Filtro por búsqueda
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          const matchesCampana = campana.nombre.toLowerCase().includes(searchLower)
          const matchesDestinatario =
            destinatario &&
            (destinatario.nombre?.toLowerCase().includes(searchLower) ||
              destinatario.email?.toLowerCase().includes(searchLower))
          if (!matchesCampana && !matchesDestinatario) return
        }

        filtered.push({ ...entrega, campana, destinatario })
      })
    })

    return filtered
  }

  const stats = getStats()
  const filteredEntregas = getFilteredEntregas()

  // Agrupar entregas filtradas por campaña
  const entregasGrouped = filteredEntregas.reduce((acc, entrega) => {
    const campanaId = entrega.campana.id
    if (!acc[campanaId]) {
      acc[campanaId] = {
        campana: entrega.campana,
        entregas: [],
      }
    }
    acc[campanaId].entregas.push(entrega)
    return acc
  }, {})

  if (loading) {
    return (
      <DashboardSuscriptorLayout activeSection="entregas">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 animate-pulse">Cargando entregas...</p>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  const toggleCardExpansion = (campanaId) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(campanaId)) {
      newExpanded.delete(campanaId)
    } else {
      newExpanded.add(campanaId)
    }
    setExpandedCards(newExpanded)
  }

  return (
    <DashboardSuscriptorLayout activeSection="entregas">
      <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
                Gestión de Entregas
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Administra las entregas de encuestas por campaña y canal
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Total</div>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.pendientes}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Pendientes</div>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.enviados}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Enviados</div>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.respondidos}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Respondidos</div>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-white/20 hover:shadow-lg transition-all duration-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats.fallidos}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Fallidos</div>
              </div>
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por campaña o destinatario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:w-auto">
                <select
                  value={filterCampana}
                  onChange={(e) => setFilterCampana(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white min-w-0 sm:min-w-[180px]"
                >
                  <option value="all">Todas las campañas</option>
                  {campanas.map((campana) => (
                    <option key={campana.id} value={campana.id}>
                      {campana.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white min-w-0 sm:min-w-[160px]"
                >
                  <option value="all">Todos los estados</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botón nueva entrega */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium transform hover:scale-105 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nueva Entrega</span>
                <span className="sm:hidden">Nueva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entregas agrupadas por campaña */}
        {Object.keys(entregasGrouped).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" || filterCampana !== "all"
                ? "No se encontraron entregas"
                : "No hay entregas creadas"}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {searchTerm || filterStatus !== "all" || filterCampana !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera entrega de encuesta"}
            </p>
            {!searchTerm && filterStatus === "all" && filterCampana === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 text-sm sm:text-base"
              >
                Crear Primera Entrega
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.values(entregasGrouped).map((group, groupIndex) => {
              const campanaStats = {
                total: group.entregas.length,
                pendientes: group.entregas.filter((e) => e.estado_id === 1).length,
                enviados: group.entregas.filter((e) => e.estado_id === 2).length,
                respondidos: group.entregas.filter((e) => e.estado_id === 3).length,
                fallidos: group.entregas.filter((e) => e.estado_id === 4).length,
              }

              const isExpanded = expandedCards.has(group.campana.id)
              const entregasToShow = isExpanded ? group.entregas : group.entregas.slice(0, 3)

              return (
                <div
                  key={group.campana.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                  style={{ animationDelay: `${groupIndex * 100}ms` }}
                >
                  {/* Header de la campaña */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {group.campana.nombre}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          {campanaStats.total} entrega{campanaStats.total !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">ID: {group.campana.id.slice(0, 8)}...</p>
                      </div>
                      <button
                        onClick={() => toggleCardExpansion(group.campana.id)}
                        className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 flex-shrink-0"
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Lista de entregas */}
                  <div className="p-3 sm:p-4">
                    <div className={`transition-all duration-300 ${isExpanded ? "space-y-3" : "space-y-2"}`}>
                      {entregasToShow.map((entrega, index) => {
                        const destinatario = destinatarios.find((d) => d.id === entrega.destinatario_id)

                        return (
                          <div
                            key={entrega.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3 sm:gap-4 ${
                              isExpanded ? "animate-fade-in" : ""
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {destinatario?.nombre || "Sin nombre"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getCanalColor(entrega.canal_id)}`}
                                  >
                                    {getNombrePorId(canales, entrega.canal_id)}
                                  </span>
                                  <span
                                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getEstadoColor(entrega.estado_id)}`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full mr-1.5 mt-0.5 ${
                                        entrega.estado_id === 1
                                          ? "bg-gray-500"
                                          : entrega.estado_id === 2
                                            ? "bg-blue-500"
                                            : entrega.estado_id === 3
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                      }`}
                                    ></div>
                                    {getNombrePorId(estados, entrega.estado_id)}
                                  </span>
                                </div>
                              </div>
                              {entrega.enviado_en && (
                                <p className="text-xs text-gray-500">
                                  Enviado: {new Date(entrega.enviado_en).toLocaleDateString()}
                                </p>
                              )}
                              {isExpanded && destinatario?.email && (
                                <p className="text-xs text-gray-500 mt-1">{destinatario.email}</p>
                              )}
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={() => openDetail(entrega, group.campana)}
                                className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-all text-xs transform hover:scale-105"
                                title="Ver detalle"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>

                              {entrega.estado_id === 1 && (
                                <button
                                  onClick={() => handleMarkAsSent(group.campana.id, entrega.id)}
                                  className="bg-yellow-50 text-yellow-600 p-2 rounded-lg hover:bg-yellow-100 transition-all text-xs transform hover:scale-105"
                                  title="Marcar como enviado"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                  </svg>
                                </button>
                              )}

                              {entrega.estado_id === 2 && (
                                <button
                                  onClick={() => handleMarkAsResponded(group.campana.id, entrega.id)}
                                  className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-all text-xs transform hover:scale-105"
                                  title="Marcar como respondido"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(group.campana.id, entrega.id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-105"
                                title="Eliminar entrega"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )
                      })}

                      {group.entregas.length > 3 && !isExpanded && (
                        <div className="text-center py-2">
                          <button
                            onClick={() => toggleCardExpansion(group.campana.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all"
                          >
                            +{group.entregas.length - 3} entregas más
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal Nueva Entrega */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                      />
                    </svg>
                  </div>
                  Nueva Entrega
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Crea una nueva entrega para una campaña específica
                </p>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Campaña</label>
                      <select
                        value={formData.campana_id}
                        onChange={(e) => setFormData({ ...formData, campana_id: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Seleccionar campaña</option>
                        {campanas.map((campana) => (
                          <option key={campana.id} value={campana.id}>
                            {campana.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Destinatario</label>
                      <select
                        value={formData.destinatario_id}
                        onChange={(e) => setFormData({ ...formData, destinatario_id: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Seleccionar destinatario</option>
                        {destinatarios.map((destinatario) => (
                          <option key={destinatario.id} value={destinatario.id}>
                            {destinatario.nombre} ({destinatario.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Canal</label>
                      <select
                        value={formData.canal_id}
                        onChange={(e) => setFormData({ ...formData, canal_id: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Seleccionar canal</option>
                        {canales.map((canal) => (
                          <option key={canal.id} value={canal.id}>
                            {canal.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base order-2 sm:order-1"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium transform hover:scale-105 text-sm sm:text-base order-1 sm:order-2"
                    >
                      Crear Entrega
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle */}
        {showDetailModal && selectedEntrega && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl sm:max-w-4xl max-h-[95vh] overflow-hidden animate-scale-in">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                      Detalle de Entrega
                    </h3>
                    <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base">
                      {selectedEntrega.campana.nombre}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedEntrega(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      Información General
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">ID de Entrega</span>
                          <p className="text-gray-900 font-mono text-xs sm:text-sm break-all">{selectedEntrega.id}</p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">Campaña</span>
                          <p className="text-gray-900 font-medium text-sm sm:text-base">
                            {selectedEntrega.campana.nombre}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">Destinatario</span>
                          <p className="text-gray-900 font-medium text-sm sm:text-base">
                            {selectedEntrega.destinatario?.nombre || "Sin nombre"}
                          </p>
                          <p className="text-xs text-gray-500">{selectedEntrega.destinatario?.email || "Sin email"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">Estado</span>
                          <div className="mt-1">
                            <span
                              className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border ${getEstadoColor(selectedEntrega.estado_id)}`}
                            >
                              {getNombrePorId(estados, selectedEntrega.estado_id)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">Canal</span>
                          <div className="mt-1">
                            <span
                              className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border ${getCanalColor(selectedEntrega.canal_id)}`}
                            >
                              {getNombrePorId(canales, selectedEntrega.canal_id)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">Fechas</span>
                          <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                            {selectedEntrega.enviado_en && (
                              <p>
                                <strong>Enviado:</strong> {formatDateTime(selectedEntrega.enviado_en)}
                              </p>
                            )}
                            {selectedEntrega.respondido_en && (
                              <p>
                                <strong>Respondido:</strong> {formatDateTime(selectedEntrega.respondido_en)}
                              </p>
                            )}
                            {!selectedEntrega.enviado_en && !selectedEntrega.respondido_en && (
                              <p className="text-gray-400">Sin fechas registradas</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardSuscriptorLayout>
  )
}
