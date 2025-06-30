

import { useState, useEffect } from "react"
import {
  getCampanas,
  getEntregasByCampana,
  createEntrega,
  deleteEntrega,
  markEntregaAsSent,
  markEntregaAsResponded,
  getDestinatarios,
  createBulkEntregas,
  downloadFormularioPdf,
  createBulkAudioEntregas,
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
    destinatario_ids: [],
    canal_id: "",
  })

  // Estados para entregas por papel
  const [showPaperModal, setShowPaperModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [paperFormData, setPaperFormData] = useState({
    campana_id: "",
    cantidad: 1,
  })
  const [printFormData, setPrintFormData] = useState({
    campana_id: "",
  })

  // Estados para entregas por audio
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [audioFormData, setAudioFormData] = useState({
    campana_id: "",
    cantidad: 1,
  })

  // Catálogos (sin papel para entregas normales)
  const canales = [
    { id: 1, nombre: "Email", color: "blue", icon: "mail" },
    { id: 2, nombre: "WhatsApp", color: "green", icon: "message-circle" },
    { id: 5, nombre: "Audio", color: "purple", icon: "phone" },
  ]

  // Catálogo completo para mostrar entregas existentes
  const canalesCompleto = [
    { id: 1, nombre: "Email", color: "blue", icon: "mail" },
    { id: 2, nombre: "WhatsApp", color: "green", icon: "message-circle" },
    { id: 5, nombre: "Audio", color: "purple", icon: "phone" },
    { id: 4, nombre: "Papel", color: "orange", icon: "file-text" },
  ]

  const estados = [
    { id: 1, nombre: "Pendiente", color: "gray", icon: "clock" },
    { id: 2, nombre: "Enviado", color: "blue", icon: "send" },
    { id: 3, nombre: "Respondido", color: "green", icon: "check-circle" },
    { id: 4, nombre: "Fallido", color: "red", icon: "x-circle" },
  ]

  

  const canalGradient = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  }

  

  const [expandedCards, setExpandedCards] = useState(new Set())
  const [showCampanaSelector, setShowCampanaSelector] = useState(false)
  const [searchCampana, setSearchCampana] = useState("")
  const [searchDestinatario, setSearchDestinatario] = useState("")

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
      // Create deliveries for each selected recipient
      const promises = formData.destinatario_ids.map((destinatarioId) => {
        const dataToSend = {
          destinatario_id: destinatarioId,
          canal_id: Number.parseInt(formData.canal_id),
        }
        return createEntrega(formData.campana_id, dataToSend)
      })

      await Promise.all(promises)
      setShowModal(false)
      resetForm()
      setError("")
      loadData()
    } catch (err) {
      setError("Error al crear entregas: " + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      campana_id: "",
      destinatario_ids: [],
      canal_id: "",
    })
    setShowCampanaSelector(false)
    setSearchCampana("")
    setSearchDestinatario("")
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
    const canal = canalesCompleto.find((c) => c.id === id)
    if (!canal) return "bg-gray-100 text-gray-700 border-gray-200"

    const colorMap = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
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

  // Funciones para entregas por papel
  const handlePaperSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createBulkEntregas(paperFormData.campana_id, paperFormData.cantidad)
      setShowPaperModal(false)
      setPaperFormData({ campana_id: "", cantidad: 1 })
      setError("")
      loadData()
      alert(`Se crearon ${result.length} entregas por papel (Canal 4) exitosamente`)
    } catch (err) {
      setError("Error al crear entregas por papel: " + err.message)
    }
  }

  // Función para entregas por audio
  const handleAudioSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createBulkAudioEntregas(audioFormData.campana_id, audioFormData.cantidad)
      setShowAudioModal(false)
      setAudioFormData({ campana_id: "", cantidad: 1 })
      setError("")
      loadData()
      alert(`Se crearon ${result.length} entregas por audio (Canal 5) exitosamente`)
    } catch (err) {
      setError("Error al crear entregas por audio: " + err.message)
    }
  }

  // Nueva función para descargar PDF individual
  const handleDownloadPdf = async (campanaId) => {
    try {
      const blob = await downloadFormularioPdf(campanaId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `formulario-${campanaId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Error al descargar formulario: " + err.message)
    }
  }



  // Obtener campañas que tienen entregas de papel
  const paperCampanas = campanas.filter((campana) => {
    const campanEntregas = entregas[campana.id] || []
    return campanEntregas.some((entrega) => entrega.canal_id === 4)
  })

  // Filtrar campañas para entregas por audio (solo las que tienen canal 5)
  const availableCampanasForAudio = campanas.filter((campana) => campana.canal_id === 5)

  // Filtrar campañas para nueva entrega (excluir las que solo tienen canal 4)
  const availableCampanasForNewEntrega = campanas.filter((campana) => {
    // Si la campaña tiene canal_id definido y es 4, no mostrarla
    if (campana.canal_id === 4 || campana.canal_id === 5) return false

    // Si no tiene canal_id definido, verificar si todas sus entregas son de canal 4
    const campanEntregas = entregas[campana.id] || []
    if (campanEntregas.length > 0) {
      const allPaperDeliveries = campanEntregas.every((entrega) => entrega.canal_id === 4)
      return !allPaperDeliveries
    }

    // Si no tiene entregas, permitir mostrarla
    return true
  })

  // Función para auto-seleccionar canal basado en la campaña
  const handleCampanaSelection = (campanaId) => {
    const campana = campanas.find((c) => c.id === campanaId)
    if (campana) {
      // Si la campaña tiene un canal definido, usarlo
      if (campana.canal_id && campana.canal_id !== 4) {
        setFormData({
          ...formData,
          campana_id: campanaId,
          canal_id: campana.canal_id.toString(),
        })
      } else {
        // Si no tiene canal definido, verificar las entregas existentes
        const campanEntregas = entregas[campanaId] || []
        if (campanEntregas.length > 0) {
          // Usar el canal más común (que no sea papel)
          const canalCounts = {}
          campanEntregas.forEach((entrega) => {
            if (entrega.canal_id !== 4) {
              canalCounts[entrega.canal_id] = (canalCounts[entrega.canal_id] || 0) + 1
            }
          })

          const mostCommonCanal = Object.keys(canalCounts).reduce(
            (a, b) => (canalCounts[a] > canalCounts[b] ? a : b),
            "1",
          )

          setFormData({
            ...formData,
            campana_id: campanaId,
            canal_id: mostCommonCanal,
          })
        } else {
          // Si no hay entregas, dejar sin canal seleccionado
          setFormData({
            ...formData,
            campana_id: campanaId,
            canal_id: "",
          })
        }
      }
    }
    setShowCampanaSelector(false)
    setSearchCampana("")
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

  // Filtrar campañas para entregas por papel (solo las que no tienen canal 4)
  const availableCampanasForPaper = campanas.filter((campana) => campana.canal_id === 4)

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

            {/* Botones de acción */}
            <div className="flex justify-end gap-2">
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

              {/* Botón entregas por papel */}
              <button
                onClick={() => setShowPaperModal(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium transform hover:scale-105 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Entregas por Papel</span>
                <span className="sm:hidden">Papel</span>
              </button>

              {/* Botón entregas por audio */}
              <button
                onClick={() => setShowAudioModal(true)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.464 15.536a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-14.142"
                  />
                </svg>
                <span className="hidden sm:inline">Entregas por Audio</span>
                <span className="sm:hidden">Audio</span>
              </button>

              {/* Botón gestión de impresión */}
              <button
                onClick={() => setShowPrintModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium transform hover:scale-105 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                <span className="hidden sm:inline">Gestión de Impresión</span>
                <span className="sm:hidden">Imprimir</span>
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
                                    {getNombrePorId(canalesCompleto, entrega.canal_id)}
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

        {/* Modal Nueva Entrega (con auto-selección de canal) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  Nueva Entrega Masiva
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Selecciona una campaña y múltiples destinatarios. El canal se selecciona automáticamente.
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-8">
                    {/* Selección de Campaña */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Campaña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCampanaSelector(!showCampanaSelector)}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all bg-white text-left"
                        >
                          {formData.campana_id ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {campanas.find((c) => c.id === formData.campana_id)?.nombre}
                                </p>
                                <p className="text-sm text-gray-500">ID: {formData.campana_id.slice(0, 8)}...</p>
                                {formData.canal_id && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div
                                      className={`w-5 h-5 bg-gradient-to-br ${canalGradient[canales.find((c) => c.id === Number.parseInt(formData.canal_id))?.color]} rounded flex items-center justify-center`}
                                    >
                                      {canales.find((c) => c.id === Number.parseInt(formData.canal_id))?.icon ===
                                        "mail" && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                          />
                                        </svg>
                                      )}
                                      {canales.find((c) => c.id === Number.parseInt(formData.canal_id))?.icon ===
                                        "message-circle" && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                          />
                                        </svg>
                                      )}
                                      {canales.find((c) => c.id === Number.parseInt(formData.canal_id))?.icon ===
                                        "phone" && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <p className="text-xs text-blue-600">
                                      Canal: {getNombrePorId(canales, Number.parseInt(formData.canal_id))}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-gray-500">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              </div>
                              <span>Seleccionar campaña</span>
                            </div>
                          )}
                          <svg
                            className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${showCampanaSelector ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {showCampanaSelector && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                            <div className="p-3 border-b border-gray-100">
                              <input
                                type="text"
                                placeholder="Buscar campaña..."
                                value={searchCampana}
                                onChange={(e) => setSearchCampana(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {availableCampanasForNewEntrega
                                .filter((campana) => campana.nombre.toLowerCase().includes(searchCampana.toLowerCase()))
                                .map((campana) => (
                                  <button
                                    key={campana.id}
                                    type="button"
                                    onClick={() => handleCampanaSelection(campana.id)}
                                    className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">{campana.nombre}</p>
                                      <p className="text-xs text-gray-500 font-mono">ID: {campana.id.slice(0, 8)}...</p>
                                      {campana.canal_id && (
                                        <p className="text-xs text-blue-600">
                                          Canal: {getNombrePorId(canales, campana.canal_id)}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selección de Destinatarios */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Destinatarios <span className="text-red-500">*</span>
                        {formData.destinatario_ids.length > 0 && (
                          <span className="ml-2 text-blue-600 font-normal">
                            ({formData.destinatario_ids.length} de {destinatarios.length} seleccionados)
                          </span>
                        )}
                      </label>

                      {/* Barra de herramientas para destinatarios */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                          <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            {/* Búsqueda */}
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                  className="h-4 w-4 text-gray-400"
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
                                placeholder="Buscar por nombre, email o teléfono..."
                                value={searchDestinatario}
                                onChange={(e) => setSearchDestinatario(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Acciones rápidas */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const filteredDestinatarios = destinatarios.filter(
                                    (destinatario) =>
                                      destinatario.nombre?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                      destinatario.email?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                      destinatario.telefono?.toLowerCase().includes(searchDestinatario.toLowerCase()),
                                  )
                                  const allIds = filteredDestinatarios.map((d) => d.id)
                                  setFormData({
                                    ...formData,
                                    destinatario_ids: [...new Set([...formData.destinatario_ids, ...allIds])],
                                  })
                                }}
                                className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Seleccionar todos
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, destinatario_ids: [] })}
                                className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                              >
                                Limpiar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Destinatarios seleccionados */}
                      {formData.destinatario_ids.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              Destinatarios Seleccionados ({formData.destinatario_ids.length})
                            </h4>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, destinatario_ids: [] })}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Remover todos
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                            {formData.destinatario_ids.map((id) => {
                              const destinatario = destinatarios.find((d) => d.id === id)
                              if (!destinatario) return null

                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm group hover:shadow-md transition-all"
                                >
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-white">
                                      {destinatario.nombre?.charAt(0)?.toUpperCase() || "U"}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{destinatario.nombre}</p>
                                    <p className="text-xs text-gray-500 truncate">{destinatario.email}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        destinatario_ids: formData.destinatario_ids.filter((did) => did !== id),
                                      })
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    title="Remover destinatario"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Lista de destinatarios disponibles */}
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">Destinatarios Disponibles</h4>
                            <span className="text-xs text-gray-500">
                              {
                                destinatarios.filter(
                                  (destinatario) =>
                                    destinatario.nombre?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                    destinatario.email?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                    destinatario.telefono?.toLowerCase().includes(searchDestinatario.toLowerCase()),
                                ).length
                              }{" "}
                              encontrados
                            </span>
                          </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {destinatarios
                            .filter(
                              (destinatario) =>
                                destinatario.nombre?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                destinatario.email?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                                destinatario.telefono?.toLowerCase().includes(searchDestinatario.toLowerCase()),
                            )
                            .map((destinatario, index) => {
                              const isSelected = formData.destinatario_ids.includes(destinatario.id)
                              return (
                                <div
                                  key={destinatario.id}
                                  className={`group transition-all duration-200 ${
                                    isSelected
                                      ? "bg-blue-50 border-l-4 border-blue-500"
                                      : "hover:bg-gray-50 border-l-4 border-transparent"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setFormData({
                                          ...formData,
                                          destinatario_ids: formData.destinatario_ids.filter(
                                            (id) => id !== destinatario.id,
                                          ),
                                        })
                                      } else {
                                        setFormData({
                                          ...formData,
                                          destinatario_ids: [...formData.destinatario_ids, destinatario.id],
                                        })
                                      }
                                    }}
                                    className="w-full p-4 text-left transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-4">
                                      {/* Avatar */}
                                      <div className="relative">
                                        <div
                                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                                            isSelected
                                              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transform scale-110"
                                              : "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500"
                                          }`}
                                        >
                                          <span className="text-sm font-bold text-white">
                                            {destinatario.nombre?.charAt(0)?.toUpperCase() || "U"}
                                          </span>
                                        </div>
                                        {isSelected && (
                                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                            <svg
                                              className="w-3 h-3 text-white"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                          </div>
                                        )}
                                      </div>

                                      {/* Información del destinatario */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 min-w-0">
                                            <p
                                              className={`font-semibold truncate transition-colors ${
                                                isSelected ? "text-blue-900" : "text-gray-900 group-hover:text-blue-900"
                                              }`}
                                            >
                                              {destinatario.nombre || "Sin nombre"}
                                            </p>
                                            <p
                                              className={`text-sm truncate transition-colors ${
                                                isSelected ? "text-blue-700" : "text-gray-600 group-hover:text-blue-700"
                                              }`}
                                            >
                                              {destinatario.email || "Sin email"}
                                            </p>
                                            {destinatario.telefono && (
                                              <p
                                                className={`text-xs truncate transition-colors ${
                                                  isSelected
                                                    ? "text-blue-600"
                                                    : "text-gray-500 group-hover:text-blue-600"
                                                }`}
                                              >
                                                <svg
                                                  className="w-3 h-3 inline mr-1"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                  />
                                                </svg>
                                                {destinatario.telefono}
                                              </p>
                                            )}
                                          </div>

                                          {/* Estado de selección */}
                                          <div className="flex-shrink-0 ml-4">
                                            <div
                                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected
                                                  ? "bg-blue-500 border-blue-500 shadow-lg"
                                                  : "border-gray-300 group-hover:border-blue-400"
                                              }`}
                                            >
                                              {isSelected && (
                                                <svg
                                                  className="w-4 h-4 text-white"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                  />
                                                </svg>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Indicadores adicionales */}
                                        <div className="flex items-center gap-2 mt-2">
                                          {destinatario.email && (
                                            <span
                                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                isSelected
                                                  ? "bg-blue-100 text-blue-800"
                                                  : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-800"
                                              }`}
                                            >
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                              </svg>
                                              Email
                                            </span>
                                          )}
                                          {destinatario.telefono && (
                                            <span
                                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                isSelected
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-800"
                                              }`}
                                            >
                                              <svg
                                                className="w-3 h-3 mr-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                              </svg>
                                              Teléfono
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              )
                            })}

                          {/* Estado vacío */}
                          {destinatarios.filter(
                            (destinatario) =>
                              destinatario.nombre?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                              destinatario.email?.toLowerCase().includes(searchDestinatario.toLowerCase()) ||
                              destinatario.telefono?.toLowerCase().includes(searchDestinatario.toLowerCase()),
                          ).length === 0 && (
                            <div className="p-8 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 mb-1">
                                No se encontraron destinatarios
                              </h3>
                              <p className="text-xs text-gray-500">Intenta ajustar tu búsqueda</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resumen de selección */}
                      {formData.destinatario_ids.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-medium text-green-800">
                              {formData.destinatario_ids.length} destinatario
                              {formData.destinatario_ids.length > 1 ? "s" : ""} seleccionado
                              {formData.destinatario_ids.length > 1 ? "s" : ""} para recibir la encuesta
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Canal seleccionado automáticamente */}
                    {formData.canal_id && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Canal de Envío (Seleccionado automáticamente)
                        </label>
                        {(() => {
                          const selectedCanal = canales.find((c) => c.id === Number.parseInt(formData.canal_id))
                          if (!selectedCanal) return null

                          const colorClasses = {
                            blue: "from-blue-50 to-blue-100 border-blue-200",
                            green: "from-green-50 to-green-100 border-green-200",
                            purple: "from-purple-50 to-purple-100 border-purple-200",
                          }

                          const iconClasses = {
                            blue: "bg-blue-500",
                            green: "bg-green-500",
                            purple: "bg-purple-500",
                          }

                          return (
                            <div
                              className={`p-4 bg-gradient-to-r ${colorClasses[selectedCanal.color]} border rounded-xl`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 ${iconClasses[selectedCanal.color]} rounded-xl flex items-center justify-center`}
                                >
                                  {selectedCanal.icon === "mail" && (
                                    <svg
                                      className="w-5 h-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                  )}
                                  {selectedCanal.icon === "message-circle" && (
                                    <svg
                                      className="w-5 h-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                      />
                                    </svg>
                                  )}
                                  {selectedCanal.icon === "phone" && (
                                    <svg
                                      className="w-5 h-5 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                  )}
                                  <svg
                                    className="w-3 h-3 text-white absolute top-1 right-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-lg">{selectedCanal.nombre}</p>
                                  <p className="text-sm text-gray-600">
                                    Canal seleccionado automáticamente basado en la campaña
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.campana_id || formData.destinatario_ids.length === 0 || !formData.canal_id}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Crear {formData.destinatario_ids.length > 0 ? `${formData.destinatario_ids.length} ` : ""}Entrega
                      {formData.destinatario_ids.length > 1 ? "s" : ""}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Entregas por Papel */}
        {showPaperModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Crear Entregas por Papel
                </h3>
                <p className="text-sm text-gray-600 mt-2">Genera entregas en papel para distribución física</p>
              </div>

              <div className="p-6">
                <form onSubmit={handlePaperSubmit}>
                  <div className="space-y-6">
                    {/* Selección de Campaña */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Campaña <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={paperFormData.campana_id}
                        onChange={(e) => setPaperFormData({ ...paperFormData, campana_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="">Seleccionar campaña</option>
                        {availableCampanasForPaper.map((campana) => (
                          <option key={campana.id} value={campana.id}>
                            {campana.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cantidad de Entregas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={paperFormData.cantidad}
                        onChange={(e) =>
                          setPaperFormData({ ...paperFormData, cantidad: Number.parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Máximo 1000 entregas por lote</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaperModal(false)
                        setPaperFormData({ campana_id: "", cantidad: 1 })
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!paperFormData.campana_id || paperFormData.cantidad < 1}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Crear {paperFormData.cantidad} Entrega{paperFormData.cantidad > 1 ? "s" : ""}
                    </button>
                  </div>
                </form>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-orange-800 mb-1">
                        Información sobre Entregas por Papel
                      </h5>
                      <p className="text-xs text-orange-700">
                        Las entregas por papel se crean automáticamente con <strong>Canal 4 (Papel)</strong>. No
                        requieren destinatarios específicos ya que son para distribución física.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Entregas por Audio */}
        {showAudioModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8.464 15.536a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-14.142"
                      />
                    </svg>
                  </div>
                  Crear Entregas por Audio
                </h3>
                <p className="text-sm text-gray-600 mt-2">Genera entregas por audio para llamadas automáticas</p>
              </div>

              <div className="p-6">
                <form onSubmit={handleAudioSubmit}>
                  <div className="space-y-6">
                    {/* Selección de Campaña */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Campaña de Audio <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={audioFormData.campana_id}
                        onChange={(e) => setAudioFormData({ ...audioFormData, campana_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                        required
                      >
                        <option value="">Seleccionar campaña de audio</option>
                        {availableCampanasForAudio.map((campana) => (
                          <option key={campana.id} value={campana.id}>
                            {campana.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cantidad de Entregas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={audioFormData.cantidad}
                        onChange={(e) =>
                          setAudioFormData({ ...audioFormData, cantidad: Number.parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Máximo 1000 entregas por lote</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAudioModal(false)
                        setAudioFormData({ campana_id: "", cantidad: 1 })
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!audioFormData.campana_id || audioFormData.cantidad < 1}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Crear {audioFormData.cantidad} Entrega{audioFormData.cantidad > 1 ? "s" : ""} por Audio
                    </button>
                  </div>
                </form>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-emerald-800 mb-1">
                        Información sobre Entregas por Audio
                      </h5>
                      <p className="text-xs text-emerald-700">
                        Las entregas por audio se crean automáticamente con <strong>Canal 5 (Audio)</strong>. No
                        requieren destinatarios específicos ya que son para llamadas automáticas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Gestión de Impresión (Simplificado) */}
        {showPrintModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  Descargar Formularios
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  Descarga formularios PDF de campañas con entregas por papel
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Selección de Campaña */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Seleccionar Campaña con Entregas por Papel
                    </label>
                    <select
                      value={printFormData.campana_id}
                      onChange={(e) => setPrintFormData({ ...printFormData, campana_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Seleccionar campaña</option>
                      {paperCampanas.map((campana) => (
                        <option key={campana.id} value={campana.id}>
                          {campana.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Acción de descarga */}
                  {printFormData.campana_id && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Descargar Formulario PDF
                      </h4>
                      <button
                        onClick={() => handleDownloadPdf(printFormData.campana_id)}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Descargar PDF
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowPrintModal(false)
                      setPrintFormData({ campana_id: "" })
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
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
                              {getNombrePorId(canalesCompleto, selectedEntrega.canal_id)}
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
