
import { useState, useEffect, useCallback } from "react"

import {
  getCampanas,
  createCampana,
  updateCampana,
  deleteCampana,
  getCampanaFullDetail,
  getPlantillas,
  getDestinatarios,
} from "../../services/api"
import DashboardSuscriptorLayout from "./layout"

export default function Campanas() {
  const [campanas, setCampanas] = useState([])
  const [filteredCampanas, setFilteredCampanas] = useState([])
  const [plantillas, setPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingCampana, setEditingCampana] = useState(null)
  const [selectedCampana, setSelectedCampana] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    plantilla_id: "",
    canal_id: "",
    programada_en: "",
  })

  // Catálogos hardcodeados según la API
  const canales = [
    { id: 1, nombre: "Email", color: "blue", icon: "mail" },
    { id: 2, nombre: "WhatsApp", color: "green", icon: "message" },
    { id: 5, nombre: "Audio", color: "emerald", icon: "phone" },
    { id: 4, nombre: "Papel", color: "purple", icon: "globe" },

  ]

  const estados = [
    { id: 1, nombre: "Borrador", color: "gray", icon: "draft" },
    { id: 2, nombre: "Programada", color: "yellow", icon: "clock" },
    { id: 3, nombre: "Enviada", color: "blue", icon: "send" },
    { id: 4, nombre: "Cerrada", color: "green", icon: "check" },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const filterCampanas = useCallback(() => {
    let filtered = campanas

    if (searchTerm) {
      filtered = filtered.filter((campana) =>
        campana.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((campana) =>
        campana.estado_id.toString() === filterStatus
      )
    }

    setFilteredCampanas(filtered)
  }, [campanas, searchTerm, filterStatus])


  useEffect(() => {
    filterCampanas()
  }, [campanas, searchTerm, filterStatus, filterCampanas])

  const loadData = async () => {
    try {
      setLoading(true)
      const [campanasData, plantillasData] = await Promise.all([
        getCampanas(),
        getPlantillas(),
        getDestinatarios(),
      ])
      setCampanas(campanasData)
      setPlantillas(plantillasData.filter((p) => p.activo))
    } catch (err) {
      setError("Error al cargar datos: " + err.message)
    } finally {
      setLoading(false)
    }
  }



  const loadCampanaDetail = async (id) => {
    try {
      const detail = await getCampanaFullDetail(id)
      setSelectedCampana(detail)  // Actualiza directamente el seleccionado con el detalle completo
    } catch (err) {
      setError("Error al cargar detalle: " + err.message)
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        nombre: formData.nombre,
        plantilla_id: formData.plantilla_id,
        canal_id: Number.parseInt(formData.canal_id),
      }

      // Solo agregar programada_en si se especifica
      if (formData.programada_en) {
        dataToSend.programada_en = formData.programada_en
      }

      if (editingCampana) {
        await updateCampana(editingCampana.id, dataToSend)
      } else {
        await createCampana(dataToSend)
      }
      setShowModal(false)
      resetForm()
      setError("")
      loadData()
    } catch (err) {
      setError("Error al guardar: " + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      plantilla_id: "",
      canal_id: "",
      programada_en: "",
    })
    setEditingCampana(null)
  }

  const handleEdit = (campana) => {
    setEditingCampana(campana)
    setFormData({
      nombre: campana.nombre,
      plantilla_id: campana.plantilla_id || "",
      canal_id: campana.canal_id.toString(),
      programada_en: campana.programada_en ? campana.programada_en.slice(0, 16) : "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta campaña?")) {
      try {
        await deleteCampana(id)
        loadData()
      } catch (err) {
        setError("Error al eliminar: " + err.message)
      }
    }
  }

  const handleProgramar = async (campana) => {
    if (!campana.programada_en) {
      setError("Esta campaña no tiene fecha de programación")
      return
    }

    try {
      await updateCampana(campana.id, { estado_id: 2 })
      loadData()
    } catch (err) {
      setError("Error al programar campaña: " + err.message)
    }
  }

  const openDetail = (campana) => {
    setSelectedCampana(campana)
    setShowDetailModal(true)
    loadCampanaDetail(campana.id)
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
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
    }

    return colorMap[estado.color] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getCanalColor = (id) => {
    const canal = canales.find((c) => c.id === id)
    if (!canal) return "bg-gray-100 text-gray-700 border-gray-200"

    const colorMap = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
    }

    return colorMap[canal.color] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const getStats = () => {
    const total = campanas.length
    const borrador = campanas.filter((c) => c.estado_id === 1).length
    const programadas = campanas.filter((c) => c.estado_id === 2).length
    const enviadas = campanas.filter((c) => c.estado_id === 3).length
    const cerradas = campanas.filter((c) => c.estado_id === 4).length
    return { total, borrador, programadas, enviadas, cerradas }
  }

  const stats = getStats()

  if (loading) {
    return (
      <DashboardSuscriptorLayout activeSection="campanas">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 animate-pulse">Cargando campañas...</p>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  return (
    <DashboardSuscriptorLayout activeSection="campanas">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Gestión de Campañas
              </h1>
              <p className="text-slate-600 text-lg">Crea y administra tus campañas de encuestas de manera eficiente</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Total</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Total Campañas</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Borradores</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.borrador}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Campañas en Borrador</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Programadas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.programadas}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Campañas Programadas</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Activas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.enviadas + stats.cerradas}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Campañas Activas</p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de herramientas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 shadow-xl shadow-slate-200/20">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Búsqueda */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  placeholder="Buscar campañas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                />
              </div>

              {/* Filtro por estado */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>


            {/* Botón nueva plantilla */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Campaña
            </button>
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
                <p className="text-red-700 font-medium">{error}</p>
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

        {/* Campañas Grid */}
        {filteredCampanas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2zM4 7h8V5H4v2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" ? "No se encontraron campañas" : "No hay campañas creadas"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera campaña de encuesta"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                Crear Primera Campaña
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampanas.map((campana, index) => (
              <div
                key={campana.id}
                className="bg-white/80 rounded-2xl shadow-sm border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1 flex flex-col h-full min-h-[280px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {campana.nombre}
                      </h3>
                      <div className="flex-1 mb-3">
                        <p className="text-gray-600 text-sm line-clamp-3 min-h-[4rem] flex items-start">
                          Creada el {formatDate(campana.creado_en)}
                        </p>
                      </div>
                      <div className="space-y-3 mt-auto">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all border ${getEstadoColor(campana.estado_id)}`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 mt-0.5 ${campana.estado_id === 1
                                  ? "bg-gray-500"
                                  : campana.estado_id === 2
                                    ? "bg-yellow-500"
                                    : campana.estado_id === 3
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                }`}
                            ></div>
                            {getNombrePorId(estados, campana.estado_id)}
                          </span>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all border ${getCanalColor(campana.canal_id)}`}
                          >
                            {getNombrePorId(canales, campana.canal_id)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            <strong>Plantilla:</strong> {getNombrePorId(plantillas, campana.plantilla_id)}
                          </p>
                          {campana.programada_en && (
                            <p>
                              <strong>Programada:</strong> {formatDateTime(campana.programada_en)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(campana)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium flex items-center gap-2 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        Detalle
                      </button>
                      <button
                        onClick={() => handleEdit(campana)}
                        className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium flex items-center gap-2 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Editar
                      </button>
                      {campana.estado_id === 1 && campana.programada_en && (
                        <button
                          onClick={() => handleProgramar(campana)}
                          className="bg-yellow-50 text-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-100 transition-all text-sm font-medium flex items-center gap-2 transform hover:scale-105"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Programar
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(campana.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              </div>
            ))}
          </div>
        )}

        {/* Modal Campaña */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2zM4 7h8V5H4v2z"
                      />
                    </svg>
                  </div>
                  {editingCampana ? "Editar Campaña" : "Nueva Campaña"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingCampana ? "Modifica los datos de la campaña" : "Las campañas inician en estado Borrador"}
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Campaña</label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ej: Encuesta de Satisfacción Q1 2024"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Plantilla</label>
                      <select
                        value={formData.plantilla_id}
                        onChange={(e) => setFormData({ ...formData, plantilla_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Seleccionar plantilla</option>
                        {plantillas.map((plantilla) => (
                          <option key={plantilla.id} value={plantilla.id}>
                            {plantilla.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Canal</label>
                      <select
                        value={formData.canal_id}
                        onChange={(e) => setFormData({ ...formData, canal_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de Programación (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.programada_en}
                        onChange={(e) => setFormData({ ...formData, programada_en: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Si especificas una fecha, podrás programar la campaña después de crearla
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium transform hover:scale-105"
                    >
                      {editingCampana ? "Actualizar" : "Crear"} Campaña
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      Detalle de Campaña
                    </h3>
                    <p className="text-blue-600 font-medium mt-1">{selectedCampana?.nombre}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedCampana(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                {selectedCampana ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Nombre</span>
                            <p className="text-gray-900 font-medium">{selectedCampana.nombre}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">ID</span>
                            <p className="text-gray-900 font-mono text-sm">{selectedCampana.id}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Creada</span>
                            <p className="text-gray-900">{formatDateTime(selectedCampana.creado_en)}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Estado</span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(selectedCampana.estado_id)}`}
                              >
                                {getNombrePorId(estados, selectedCampana.estado_id)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Canal</span>
                            <div className="mt-1">
                              <span
                                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getCanalColor(selectedCampana.canal_id)}`}
                              >
                                {getNombrePorId(canales, selectedCampana.canal_id)}
                              </span>
                            </div>
                          </div>
                          {selectedCampana.programada_en && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">Programada para</span>
                              <p className="text-gray-900">{formatDateTime(selectedCampana.programada_en)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        Plantilla Asociada
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-900 font-medium">
                          {selectedCampana.plantilla_id
                            ? getNombrePorId(plantillas, selectedCampana.plantilla_id)
                            : "Sin plantilla asignada"}
                        </p>
                        {selectedCampana.plantilla_id && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">{selectedCampana.plantilla_id}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-40">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Cargando detalle...</p>
                    </div>
                  </div>
                )}
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
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .min-h-[320px] {
          min-height: 320px;
        }

        .min-h-[3.5rem] {
          min-height: 3.5rem;
        }

        .min-h-[4rem] {
          min-height: 4rem;
        }
      `}</style>
    </DashboardSuscriptorLayout>
  )
}
