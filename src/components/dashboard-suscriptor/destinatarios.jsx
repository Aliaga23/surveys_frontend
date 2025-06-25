

import { useState, useEffect } from "react"
import DashboardSuscriptorLayout from "./layout"
import { getDestinatarios, createDestinatario, updateDestinatario, deleteDestinatario } from "../../services/api"

const Destinatarios = () => {
  const [destinatarios, setDestinatarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingDestinatario, setEditingDestinatario] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadStats, setUploadStats] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "", 
    telefono: "",
  })

  useEffect(() => {
    fetchDestinatarios()
  }, [])

  const fetchDestinatarios = async () => {
    try {
      setLoading(true)
      const data = await getDestinatarios()
      setDestinatarios(data)
    } catch (error) {
      console.error("Error fetching destinatarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingDestinatario) {
        await updateDestinatario(editingDestinatario.id, formData)
      } else {
        await createDestinatario(formData)
      }
      await fetchDestinatarios()
      resetForm()
    } catch (error) {
      console.error("Error saving destinatario:", error)
    }
  }

  const handleEdit = (destinatario) => {
    setEditingDestinatario(destinatario)
    setFormData({
      nombre: destinatario.nombre,
      email: destinatario.email || "",
      telefono: destinatario.telefono || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este destinatario?")) {
      try {
        await deleteDestinatario(id)
        await fetchDestinatarios()
      } catch (error) {
        console.error("Error deleting destinatario:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", email: "", telefono: "" })
    setEditingDestinatario(null)
    setShowModal(false)
  }

  const handleFileUpload = async (file) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("https://surveysbackend-production.up.railway.app/destinatarios/upload-excel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const stats = await response.json()
        setUploadStats(stats)
        await fetchDestinatarios()
      } else {
        throw new Error("Error uploading file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error al subir el archivo")
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const excelFile = files.find((file) => file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))
    if (excelFile) {
      handleFileUpload(excelFile)
    }
  }

  const filteredDestinatarios = destinatarios.filter(
    (destinatario) =>
      destinatario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (destinatario.email && destinatario.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (destinatario.telefono && destinatario.telefono.includes(searchTerm)),
  )

  const stats = {
    total: destinatarios.length,
    conEmail: destinatarios.filter((d) => d.email).length,
    conTelefono: destinatarios.filter((d) => d.telefono).length,
    completos: destinatarios.filter((d) => d.email && d.telefono).length,
  }

  return (
    <DashboardSuscriptorLayout activeSection="destinatarios">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Destinatarios
              </h1>
              <p className="text-slate-600 text-lg">Gestiona tu base de contactos para las campañas</p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Total Destinatarios</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Contactos registrados</p>
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
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Con Email</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.conEmail}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Para campañas email</p>
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
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Con Teléfono</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.conTelefono}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Para WhatsApp/SMS</p>
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
                  <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Completos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.completos}</p>
                  <p className="text-slate-500 text-xs mt-1 truncate">Email + teléfono</p>
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

          {/* Barra de herramientas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 shadow-xl shadow-slate-200/20">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex-1 max-w-full sm:max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    placeholder="Buscar destinatarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg shadow-green-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Subir Excel
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Destinatario
                </button>
              </div>
            </div>
          </div>

          {/* Grid de destinatarios */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinatarios.map((destinatario) => (
                <div
                  key={destinatario.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1 h-48 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-h-0">
                      <h3 className="font-semibold text-slate-900 text-lg mb-3 truncate">{destinatario.nombre}</h3>

                      <div className="space-y-2">
                        {destinatario.email && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm truncate">{destinatario.email}</span>
                          </div>
                        )}

                        {destinatario.telefono && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="text-sm">{destinatario.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(destinatario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(destinatario.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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

                  <div className="mt-auto flex gap-2">
                    {destinatario.email && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Email
                      </span>
                    )}
                    {destinatario.telefono && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Teléfono
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredDestinatarios.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No hay destinatarios</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Comienza agregando tu primer destinatario o sube un archivo Excel con tu lista de contactos
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Primer Destinatario
              </button>
            </div>
          )}

          {/* Modal para crear/editar destinatario */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                <div className="px-6 py-4 border-b border-slate-200/60">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {editingDestinatario ? "Editar Destinatario" : "Nuevo Destinatario"}
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    {editingDestinatario
                      ? "Modifica la información del destinatario"
                      : "Agrega un nuevo contacto a tu lista"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                      placeholder="correo@ejemplo.com"
                    />
                    <p className="text-xs text-slate-500 mt-1">Para campañas por email</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Número de teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                      placeholder="+1234567890"
                    />
                    <p className="text-xs text-slate-500 mt-1">Para campañas por WhatsApp o SMS</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                    >
                      {editingDestinatario ? "Actualizar" : "Crear Destinatario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal para subir Excel */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg border border-white/20">
                <div className="px-6 py-4 border-b border-slate-200/60">
                  <h2 className="text-xl font-semibold text-slate-900">Importar desde Excel</h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Sube un archivo Excel con las columnas: <span className="font-medium">nombre</span>,{" "}
                    <span className="font-medium">email</span>, <span className="font-medium">telefono</span>
                  </p>
                </div>

                <div className="p-6">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${isDragging
                        ? "border-blue-400 bg-blue-50/50 backdrop-blur-sm"
                        : "border-slate-300 hover:border-slate-400 bg-slate-50/50 backdrop-blur-sm"
                      }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Arrastra tu archivo Excel aquí</h3>
                    <p className="text-slate-600 mb-4">o haz clic para seleccionar</p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) handleFileUpload(file)
                      }}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 cursor-pointer shadow-lg shadow-green-500/25"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Seleccionar Archivo Excel
                    </label>
                  </div>

                  {uploadStats && (
                    <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Resultados de la importación
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold text-slate-900">{uploadStats.total_procesados}</div>
                          <div className="text-sm text-slate-600">Total procesados</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold text-green-600">{uploadStats.creados}</div>
                          <div className="text-sm text-slate-600">Nuevos creados</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold text-yellow-600">{uploadStats.duplicados}</div>
                          <div className="text-sm text-slate-600">Duplicados omitidos</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="text-2xl font-bold text-red-600">{uploadStats.errores}</div>
                          <div className="text-sm text-slate-600">Errores encontrados</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setUploadStats(null)
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
                    >
                      {uploadStats ? "Cerrar" : "Cancelar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardSuscriptorLayout>
  )
}

export default Destinatarios
