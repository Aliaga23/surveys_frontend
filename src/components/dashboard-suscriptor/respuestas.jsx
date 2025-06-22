

import { useState, useEffect, useCallback } from "react"
import { getCampanas, getCampanaFullDetail } from "../../services/api"
import DashboardSuscriptorLayout from "./layout"

export default function Respuestas() {
  const [respuestas, setRespuestas] = useState([])
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCampana, setSelectedCampana] = useState("")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedRespuesta, setSelectedRespuesta] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")


const loadAllRespuestas = useCallback(async () => {
  try {
    const campanasData = await getCampanas()
    const allRespuestas = []

    for (const campana of campanasData) {
      try {
        const fullDetail = await getCampanaFullDetail(campana.id)
        if (fullDetail.entregas) {
          fullDetail.entregas.forEach((entrega) => {
            if (entrega.respuestas && entrega.respuestas.length > 0) {
              entrega.respuestas.forEach((respuesta) => {
                allRespuestas.push({
                  id: respuesta.id,
                  campana_id: campana.id,
                  campana_nombre: campana.nombre,
                  entrega_id: entrega.id,
                  destinatario_email: entrega.destinatario?.email || "N/A",
                  destinatario_nombre: entrega.destinatario?.nombre || "N/A",
                  destinatario_telefono: entrega.destinatario?.telefono || "N/A",
                  completada: entrega.estado_id === 3,
                  fecha_respuesta: respuesta.recibido_en,
                  enviado_en: entrega.enviado_en,
                  respondido_en: entrega.respondido_en,
                  respuestas_detalle:
                    respuesta.respuestas_preguntas?.map((rp) => ({
                      pregunta_id: rp.pregunta_id,
                      pregunta_texto:
                        fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.texto ||
                        "Pregunta no encontrada",
                      tipo_pregunta: getTipoPreguntaName(
                        fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.tipo_pregunta_id,
                      ),
                      obligatoria:
                        fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.obligatorio || false,
                      respuesta_valor:
                        rp.texto ||
                        rp.numero ||
                        getOpcionTexto(
                          fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.opciones,
                          rp.opcion_id,
                        ) ||
                        "Sin respuesta",
                      metadatos: rp.metadatos,
                    })) || [],
                })
              })
            }
          })
        }
      } catch (err) {
        console.warn(`Error al cargar campaña ${campana.id}:`, err.message)
      }
    }

    setRespuestas(allRespuestas)
  } catch (err) {
    setError("Error al cargar las respuestas: " + err.message)
    setRespuestas([])
  }
}, [])

const loadData = useCallback(async () => {
  try {
    setLoading(true)
    const campanasData = await getCampanas()
    setCampanas(campanasData)
    await loadAllRespuestas()
  } catch (err) {
    setError("Error al cargar la información: " + err.message)
  } finally {
    setLoading(false)
  }
}, [loadAllRespuestas])

useEffect(() => {
  loadData()
}, [loadData])


  const getTipoPreguntaName = (tipoId) => {
    const tipos = {
      1: "Texto Libre",
      2: "Numérico",
      3: "Selección Unica",
      4: "Selección Múltiple",
    }
    return tipos[tipoId] || "No Especificado"
  }

  const getOpcionTexto = (opciones, opcionId) => {
    if (!opciones || !opcionId) return null
    const opcion = opciones.find((o) => o.id === opcionId)
    return opcion ? opcion.texto : null
  }

  const loadRespuestasByCampana = async (campanId) => {
    if (!campanId) {
      await loadAllRespuestas()
      return
    }

    try {
      const fullDetail = await getCampanaFullDetail(campanId)
      const campanRespuestas = []

      if (fullDetail.entregas) {
        fullDetail.entregas.forEach((entrega) => {
          if (entrega.respuestas && entrega.respuestas.length > 0) {
            entrega.respuestas.forEach((respuesta) => {
              campanRespuestas.push({
                id: respuesta.id,
                campana_id: campanId,
                campana_nombre: fullDetail.nombre,
                entrega_id: entrega.id,
                destinatario_email: entrega.destinatario?.email || "N/A",
                destinatario_nombre: entrega.destinatario?.nombre || "N/A",
                destinatario_telefono: entrega.destinatario?.telefono || "N/A",
                completada: entrega.estado_id === 3,
                fecha_respuesta: respuesta.recibido_en,
                enviado_en: entrega.enviado_en,
                respondido_en: entrega.respondido_en,
                respuestas_detalle:
                  respuesta.respuestas_preguntas?.map((rp) => ({
                    pregunta_id: rp.pregunta_id,
                    pregunta_texto:
                      fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.texto ||
                      "Pregunta no encontrada",
                    tipo_pregunta: getTipoPreguntaName(
                      fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.tipo_pregunta_id,
                    ),
                    obligatoria:
                      fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.obligatorio || false,
                    respuesta_valor:
                      rp.texto ||
                      rp.numero ||
                      getOpcionTexto(
                        fullDetail.plantilla?.preguntas?.find((p) => p.id === rp.pregunta_id)?.opciones,
                        rp.opcion_id,
                      ) ||
                      "Sin respuesta",
                    metadatos: rp.metadatos,
                  })) || [],
              })
            })
          }
        })
      }

      setRespuestas(campanRespuestas)
    } catch (err) {
      setError("Error al cargar las respuestas de la campaña: " + err.message)
      setRespuestas([])
    }
  }

  const handleCampanaChange = (campanId) => {
    setSelectedCampana(campanId)
    loadRespuestasByCampana(campanId)
  }

  const openDetail = (respuesta) => {
    setSelectedRespuesta(respuesta)
    setShowDetailModal(true)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredRespuestas = respuestas.filter(
    (respuesta) =>
      respuesta.destinatario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      respuesta.destinatario_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      respuesta.campana_nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <DashboardSuscriptorLayout activeSection="respuestas">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando respuestas...</p>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  return (
    <DashboardSuscriptorLayout activeSection="respuestas">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Respuestas</h1>
                <p className="text-gray-600">Administre y analice las respuestas de sus encuestas</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Exportar Datos
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros y Búsqueda</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Campaña</label>
                <select
                  value={selectedCampana}
                  onChange={(e) => handleCampanaChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Todas las campañas</option>
                  {campanas.map((campana) => (
                    <option key={campana.id} value={campana.id}>
                      {campana.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Respuestas</label>
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o campaña..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Respuestas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredRespuestas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredRespuestas.filter((r) => r.completada).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredRespuestas.filter((r) => !r.completada).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Completitud</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredRespuestas.length > 0
                      ? Math.round(
                          (filteredRespuestas.filter((r) => r.completada).length / filteredRespuestas.length) * 100,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Registro de Respuestas</h3>
              <p className="text-sm text-gray-600 mt-1">Lista detallada de todas las respuestas recibidas</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Identificador
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Campaña
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha de Respuesta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRespuestas.length > 0 ? (
                    filteredRespuestas.map((respuesta) => (
                      <tr
                        key={`${respuesta.entrega_id}-${respuesta.id}`}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">#{respuesta.id.slice(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{respuesta.campana_nombre}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{respuesta.destinatario_nombre}</div>
                            <div className="text-sm text-gray-500">{respuesta.destinatario_email}</div>
                            {respuesta.destinatario_telefono !== "N/A" && (
                              <div className="text-xs text-gray-400">{respuesta.destinatario_telefono}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              respuesta.completada
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                respuesta.completada ? "bg-green-400" : "bg-yellow-400"
                              }`}
                            ></div>
                            {respuesta.completada ? "Completada" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDateTime(respuesta.fecha_respuesta)}</div>
                          {respuesta.enviado_en && (
                            <div className="text-xs text-gray-500">Enviado: {formatDateTime(respuesta.enviado_en)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openDetail(respuesta)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay respuestas disponibles</h3>
                          <p className="text-gray-500">
                            No se encontraron respuestas que coincidan con los filtros aplicados.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Response Detail Modal */}
          {showDetailModal && selectedRespuesta && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Detalle de Respuesta</h3>
                    <p className="text-sm text-gray-600 mt-1">ID: #{selectedRespuesta.id.slice(0, 8)}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedRespuesta(null)
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-6">
                    {/* General Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Información General
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Campaña</label>
                            <p className="text-gray-900 font-medium">{selectedRespuesta.campana_nombre}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Participante</label>
                            <p className="text-gray-900 font-medium">{selectedRespuesta.destinatario_nombre}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                            <p className="text-gray-900">{selectedRespuesta.destinatario_email}</p>
                          </div>
                          {selectedRespuesta.destinatario_telefono !== "N/A" && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Teléfono</label>
                              <p className="text-gray-900">{selectedRespuesta.destinatario_telefono}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Estado</label>
                            <div className="mt-1">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  selectedRespuesta.completada
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                              >
                                {selectedRespuesta.completada ? "Completada" : "Pendiente"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Fecha de Respuesta</label>
                            <p className="text-gray-900">{formatDateTime(selectedRespuesta.fecha_respuesta)}</p>
                          </div>
                          {selectedRespuesta.enviado_en && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Fecha de Envío</label>
                              <p className="text-gray-900">{formatDateTime(selectedRespuesta.enviado_en)}</p>
                            </div>
                          )}
                          {selectedRespuesta.respondido_en && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Fecha de Finalización</label>
                              <p className="text-gray-900">{formatDateTime(selectedRespuesta.respondido_en)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Responses */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Respuestas Detalladas
                      </h4>
                      <div className="space-y-4">
                        {selectedRespuesta.respuestas_detalle && selectedRespuesta.respuestas_detalle.length > 0 ? (
                          selectedRespuesta.respuestas_detalle.map((detalle, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="mb-3">
                                <div className="flex items-start justify-between">
                                  <h5 className="font-medium text-gray-900 text-base">{detalle.pregunta_texto}</h5>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {detalle.tipo_pregunta}
                                    </span>
                                    {detalle.obligatoria && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Obligatoria
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <label className="text-sm font-medium text-blue-900 block mb-2">Respuesta:</label>
                                <p className="text-gray-900 font-medium">
                                  {detalle.respuesta_valor || (
                                    <span className="text-gray-500 italic">Sin respuesta proporcionada</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <svg
                              className="w-12 h-12 text-gray-400 mx-auto mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <p className="text-gray-500 font-medium">No hay respuestas detalladas disponibles</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailModal(false)
                      setSelectedRespuesta(null)
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardSuscriptorLayout>
  )
}
