
import { useCallback } from "react"
import { useState, useEffect } from "react"
import {
  getPlantillas,
  createPlantilla,
  updatePlantilla,
  deletePlantilla,
  getPreguntas,
  createPregunta,
  updatePregunta,
  deletePregunta,
  getOpciones,
  createOpcion,
  deleteOpcion,
} from "../../services/api"
import DashboardSuscriptorLayout from "./layout"

export default function Plantillas() {
  const [plantillas, setPlantillas] = useState([])
  const [filteredPlantillas, setFilteredPlantillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [showPreguntasModal, setShowPreguntasModal] = useState(false)
  const [editingPlantilla, setEditingPlantilla] = useState(null)
  const [selectedPlantilla, setSelectedPlantilla] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [editingPregunta, setEditingPregunta] = useState(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  })
  const [preguntaForm, setPreguntaForm] = useState({
    texto: "",
    tipo_pregunta_id: "",
    obligatoria: true,
    orden: 1,
    opciones: [],
  })

  // Tipos de pregunta según tu backend
  const tiposPregunta = [
    { id: 1, nombre: "Texto", codigo: "texto", color: "blue", icon: "text" },
    { id: 2, nombre: "Número", codigo: "number", color: "emerald", icon: "hash" },
    { id: 3, nombre: "Selección Única", codigo: "select", color: "purple", icon: "radio" },
    { id: 4, nombre: "Selección Múltiple", codigo: "multiselect", color: "orange", icon: "checkbox" },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const filterPlantillas = useCallback(() => {
    let filtered = plantillas

    if (searchTerm) {
      filtered = filtered.filter(
        (plantilla) =>
          plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plantilla.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((plantilla) => (filterStatus === "active" ? plantilla.activo : !plantilla.activo))
    }

    setFilteredPlantillas(filtered)
  }, [plantillas, searchTerm, filterStatus])

  const loadPreguntas = async (plantillaId) => {
    try {
      const preguntasData = await getPreguntas(plantillaId)
      // Cargar opciones para cada pregunta que las necesite
      const preguntasConOpciones = await Promise.all(
        preguntasData.map(async (pregunta) => {
          if (needsOptions(pregunta.tipo_pregunta_id)) {
            try {
              const opciones = await getOpciones(plantillaId, pregunta.id)
              return { ...pregunta, opciones }
            } catch (err) {
              console.error("Error cargando opcioness:", err)
              return { ...pregunta, opciones: [] }
            }
          }
          return pregunta
        }),
      )
      setPreguntas(preguntasConOpciones)
    } catch (err) {
      setError("Error al cargar preguntas: " + err.message)
    }
  }

  useEffect(() => {
    filterPlantillas()
  }, [filterPlantillas])


  const loadData = async () => {
    try {
      setLoading(true)
      const plantillasData = await getPlantillas()
      setPlantillas(plantillasData)
    } catch (err) {
      setError("Error al cargar datos: " + err.message)
    } finally {
      setLoading(false)
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPlantilla) {
        await updatePlantilla(editingPlantilla.id, formData)
      } else {
        await createPlantilla(formData)
      }
      setShowModal(false)
      setFormData({ nombre: "", descripcion: "", activo: true })
      setEditingPlantilla(null)
      loadData()
    } catch (err) {
      setError("Error al guardar: " + err.message)
    }
  }

  const handleEdit = (plantilla) => {
    setEditingPlantilla(plantilla)
    setFormData({
      nombre: plantilla.nombre,
      descripcion: plantilla.descripcion,
      activo: plantilla.activo,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta plantilla?")) {
      try {
        await deletePlantilla(id)
        loadData()
      } catch (err) {
        setError("Error al eliminar: " + err.message)
      }
    }
  }

  const openPreguntas = (plantilla) => {
    setSelectedPlantilla(plantilla)
    setShowPreguntasModal(true)
    loadPreguntas(plantilla.id)
  }

  const handlePreguntaSubmit = async (e) => {
    e.preventDefault()
    try {
      const preguntaData = {
        texto: preguntaForm.texto,
        tipo_pregunta_id: Number.parseInt(preguntaForm.tipo_pregunta_id),
        obligatorio: preguntaForm.obligatoria,
        orden: preguntaForm.orden,
      }

      let preguntaId
      if (editingPregunta) {
        await updatePregunta(selectedPlantilla.id, editingPregunta.id, preguntaData)
        preguntaId = editingPregunta.id
      } else {
        const nuevaPregunta = await createPregunta(selectedPlantilla.id, preguntaData)
        preguntaId = nuevaPregunta.id
      }

      // Guardar opciones si es necesario
      if (needsOptions(preguntaForm.tipo_pregunta_id) && preguntaForm.opciones.length > 0) {
        // Si estamos editando, primero eliminar opciones existentes
        if (editingPregunta && editingPregunta.opciones) {
          for (const opcion of editingPregunta.opciones) {
            await deleteOpcion(selectedPlantilla.id, editingPregunta.id, opcion.id)
          }
        }

        // Crear nuevas opciones
        for (const opcion of preguntaForm.opciones) {
          if (opcion.texto.trim()) {
            await createOpcion(selectedPlantilla.id, preguntaId, {
              texto: opcion.texto,
              valor: opcion.valor || opcion.texto,
            })
          }
        }
      }

      setPreguntaForm({ texto: "", tipo_pregunta_id: "", obligatoria: true, orden: 1, opciones: [] })
      setEditingPregunta(null)
      loadPreguntas(selectedPlantilla.id)
    } catch (err) {
      setError("Error al guardar pregunta: " + err.message)
    }
  }

  const handleDeletePregunta = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de eliminar esta pregunta?")) {
      try {
        await deletePregunta(selectedPlantilla.id, preguntaId)
        loadPreguntas(selectedPlantilla.id)
      } catch (err) {
        setError("Error al eliminar pregunta: " + err.message)
      }
    }
  }

  const addOpcion = () => {
    setPreguntaForm({
      ...preguntaForm,
      opciones: [...preguntaForm.opciones, { texto: "", valor: "" }],
    })
  }

  const updateOpcion = (index, field, value) => {
    const newOpciones = [...preguntaForm.opciones]
    if (!newOpciones[index]) {
      newOpciones[index] = { texto: "", valor: "" }
    }
    newOpciones[index] = {
      ...newOpciones[index],
      [field]: value || "",
    }
    setPreguntaForm({ ...preguntaForm, opciones: newOpciones })
  }

  const removeOpcion = (index) => {
    const newOpciones = preguntaForm.opciones.filter((_, i) => i !== index)
    setPreguntaForm({ ...preguntaForm, opciones: newOpciones })
  }

  const getTipoPreguntaNombre = (id) => {
    const tipo = tiposPregunta.find((t) => t.id === id)
    return tipo ? tipo.nombre : "N/A"
  }

  const getTipoPreguntaColor = (id) => {
    const tipo = tiposPregunta.find((t) => t.id === id)
    if (!tipo) return "bg-gray-100 text-gray-700 border-gray-200"

    const colorMap = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
    }

    return colorMap[tipo.color] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const needsOptions = (tipoId) => {
    return tipoId === 3 || tipoId === 4 || tipoId === "3" || tipoId === "4"
  }

  const renderPreguntaPreview = (pregunta) => {

    switch (pregunta.tipo_pregunta_id) {
      case 1: // Texto
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tu respuesta"
              disabled
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-600 placeholder-gray-400"
            />
          </div>
        )

      case 2: // Número
        return (
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Tu respuesta"
              disabled
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-600 placeholder-gray-400"
            />
          </div>
        )

      case 3: // Selección única
        return (
          <div className="space-y-3">
            {pregunta.opciones && pregunta.opciones.length > 0 ? (
              pregunta.opciones.map((opcion, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name={`pregunta-${pregunta.id}`}
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opcion.texto}</span>
                </label>
              ))
            ) : (
              <div className="text-gray-400 italic">No hay opciones configuradas</div>
            )}
          </div>
        )

      case 4: // Selección múltiple
        return (
          <div className="space-y-3">
            {pregunta.opciones && pregunta.opciones.length > 0 ? (
              pregunta.opciones.map((opcion, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opcion.texto}</span>
                </label>
              ))
            ) : (
              <div className="text-gray-400 italic">No hay opciones configuradas</div>
            )}
          </div>
        )

      default:
        return <div className="text-gray-400">Tipo de pregunta no reconocido</div>
    }
  }

  const renderPreguntaPreviewLive = (preguntaForm) => {
    const tipoId = Number(preguntaForm.tipo_pregunta_id)

    switch (tipoId) {
      case 1: // Texto
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Tu respuesta"
              disabled
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-600 placeholder-gray-400"
            />
          </div>
        )

      case 2: // Número
        return (
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Tu respuesta"
              disabled
              className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent text-gray-600 placeholder-gray-400"
            />
          </div>
        )

      case 3: // Selección única
        return (
          <div className="space-y-3">
            {preguntaForm.opciones && preguntaForm.opciones.length > 0 ? (
              preguntaForm.opciones.map((opcion, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="preview-radio"
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    {opcion.texto || `Opción ${index + 1}`}
                    {opcion.valor && opcion.valor !== opcion.texto && (
                      <span className="text-gray-400 text-sm ml-2">(valor: {opcion.valor})</span>
                    )}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-gray-400 italic">Agrega opciones para esta pregunta</div>
            )}
          </div>
        )

      case 4: // Selección múltiple
        return (
          <div className="space-y-3">
            {preguntaForm.opciones && preguntaForm.opciones.length > 0 ? (
              preguntaForm.opciones.map((opcion, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    {opcion.texto || `Opción ${index + 1}`}
                    {opcion.valor && opcion.valor !== opcion.texto && (
                      <span className="text-gray-400 text-sm ml-2">(valor: {opcion.valor})</span>
                    )}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-gray-400 italic">Agrega opciones para esta pregunta</div>
            )}
          </div>
        )

      default:
        return preguntaForm.tipo_pregunta_id ? (
          <div className="text-gray-400">Selecciona un tipo de pregunta válido</div>
        ) : (
          <div className="text-gray-400 italic">Selecciona el tipo de pregunta para ver la vista previa</div>
        )
    }
  }

  const getStats = () => {
    const total = plantillas.length
    const active = plantillas.filter((p) => p.activo).length
    const inactive = total - active
    return { total, active, inactive }
  }

  const stats = getStats()

  if (loading) {
    return (
      <DashboardSuscriptorLayout activeSection="plantillas">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 animate-pulse">Cargando plantillas...</p>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  return (
    <DashboardSuscriptorLayout activeSection="plantillas">
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Plantillas de Encuestas
              </h1>
              <p className="text-slate-600 text-lg">Crea y gestiona plantillas para tus encuestas de manera eficiente</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-slate-500 text-xs mt-1 truncate">Total Plantillas</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />

                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Activas</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-slate-500 text-xs mt-1 truncate">Plantillas Activas</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>

              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Inactivas</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.inactive}</p>
                <p className="text-slate-500 text-xs mt-1 truncate">Plantillas Inactivas </p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>

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
                  placeholder="Buscar plantillas..."
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
                <option value="active">Solo activas</option>
                <option value="inactive">Solo inactivas</option>
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
              Nueva Plantilla
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

        {/* Plantillas Grid */}
        {filteredPlantillas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "all" ? "No se encontraron plantillas" : "No hay plantillas creadas"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera plantilla de encuesta"}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                Crear Primera Plantilla
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlantillas.map((plantilla, index) => (
              <div
                key={plantilla.id}
                className="bg-white/80 rounded-2xl shadow-sm border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1 flex flex-col h-full min-h-[280px]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {plantilla.nombre}
                      </h3>
                      <div className="flex-1 mb-3">
                        <p className="text-gray-600 text-sm line-clamp-3 min-h-[4rem] flex items-start">
                          {plantilla.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all ${plantilla.activo
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-2 mt-0.5 ${plantilla.activo ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          {plantilla.activo ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreguntas(plantilla)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium flex items-center gap-2 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Preguntas
                      </button>
                      <button
                        onClick={() => handleEdit(plantilla)}
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
                    </div>
                    <button
                      onClick={() => handleDelete(plantilla.id)}
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

        {/* Modal Plantilla */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  {editingPlantilla ? "Editar Plantilla" : "Nueva Plantilla"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Plantilla</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: Encuesta de Satisfacción"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows="3"
                      placeholder="Describe el propósito de esta plantilla..."
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Estado de la plantilla</label>
                      <p className="text-xs text-gray-500">Las plantillas activas pueden ser utilizadas en campañas</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="sr-only"
                      />
                      <div
                        className={`relative w-11 h-6 rounded-full transition-colors ${formData.activo ? "bg-blue-600" : "bg-gray-300"}`}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${formData.activo ? "translate-x-5" : "translate-x-0"}`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPlantilla(null)
                      setFormData({ nombre: "", descripcion: "", activo: true })
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium transform hover:scale-105"
                  >
                    {editingPlantilla ? "Actualizar" : "Crear"} Plantilla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Preguntas */}
        {/* Modal Preguntas - Mejorado para responsividad */}
        {showPreguntasModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-2 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] overflow-hidden animate-scale-in mt-2 sm:mt-4">
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
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="hidden sm:inline">Gestión de Preguntas</span>
                      <span className="sm:hidden">Preguntas</span>
                    </h3>
                    <p className="text-blue-600 font-medium mt-1 text-sm sm:text-base truncate max-w-xs sm:max-w-none">
                      {selectedPlantilla?.nombre}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreguntasModal(false)
                      setSelectedPlantilla(null)
                      setPreguntas([])
                      setEditingPregunta(null)
                      setPreguntaForm({ texto: "", tipo_pregunta_id: "", obligatoria: true, orden: 1, opciones: [] })
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido responsive */}
              <div className="flex flex-col lg:flex-row h-[calc(98vh-120px)]">
                {/* Panel de formulario - Ahora colapsible en móvil */}
                <div className="w-full lg:w-1/2 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      {editingPregunta ? "Editar Pregunta" : "Nueva Pregunta"}
                    </h4>

                    <form onSubmit={handlePreguntaSubmit}>
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Texto de la Pregunta</label>
                          <textarea
                            value={preguntaForm.texto}
                            onChange={(e) => setPreguntaForm({ ...preguntaForm, texto: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            placeholder="¿Cuál es tu pregunta?"
                            rows="2"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Pregunta</label>
                          <select
                            value={preguntaForm.tipo_pregunta_id}
                            onChange={(e) =>
                              setPreguntaForm({ ...preguntaForm, tipo_pregunta_id: e.target.value, opciones: [] })
                            }
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                            required
                          >
                            <option value="">Seleccionar tipo</option>
                            {tiposPregunta.map((tipo) => (
                              <option key={tipo.id} value={tipo.id}>
                                {tipo.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Orden</label>
                            <input
                              type="number"
                              value={preguntaForm.orden}
                              onChange={(e) =>
                                setPreguntaForm({ ...preguntaForm, orden: Number.parseInt(e.target.value) })
                              }
                              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              min="1"
                            />
                          </div>

                          <div className="flex items-end">
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-gray-200 w-full">
                              <div>
                                <label className="text-sm font-medium text-gray-700">Obligatoria</label>
                              </div>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={preguntaForm.obligatoria}
                                  onChange={(e) => setPreguntaForm({ ...preguntaForm, obligatoria: e.target.checked })}
                                  className="sr-only"
                                />
                                <div
                                  className={`relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${preguntaForm.obligatoria ? "bg-blue-600" : "bg-gray-300"}`}
                                >
                                  <div
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform shadow-sm ${preguntaForm.obligatoria ? "translate-x-5" : "translate-x-0"}`}
                                  ></div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Opciones para preguntas de selección - Mejorado para móvil */}
                        {needsOptions(preguntaForm.tipo_pregunta_id) && (
                          <div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4">
                              <label className="block text-sm font-semibold text-gray-700">Opciones de Respuesta</label>
                              <button
                                type="button"
                                onClick={addOpcion}
                                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                Agregar Opción
                              </button>
                            </div>

                            <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                              {preguntaForm.opciones.map((opcion, index) => (
                                <div
                                  key={index}
                                  className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-gray-200"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm font-medium min-w-[20px]">{index + 1}</span>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Texto</label>
                                        <input
                                          type="text"
                                          placeholder="Texto de la opción"
                                          value={opcion.texto || ""}
                                          onChange={(e) => updateOpcion(index, "texto", e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
                                        <input
                                          type="text"
                                          placeholder="Valor (ej: 1, 2, 3)"
                                          value={opcion.valor || ""}
                                          onChange={(e) => updateOpcion(index, "valor", e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeOpcion(index)}
                                      className="text-red-500 hover:text-red-700 p-2 rounded transition-all"
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
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPregunta(null)
                              setPreguntaForm({
                                texto: "",
                                tipo_pregunta_id: "",
                                obligatoria: true,
                                orden: 1,
                                opciones: [],
                              })
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium order-1 sm:order-2"
                          >
                            {editingPregunta ? "Actualizar" : "Agregar"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Panel de vista previa - Mejorado para móvil */}
                <div className="w-full lg:w-1/2 p-4 sm:p-6 overflow-y-auto bg-gray-50">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedPlantilla?.nombre}</h2>
                      <p className="text-gray-600 text-sm sm:text-base">{selectedPlantilla?.descripcion}</p>
                      <div className="mt-4 h-1 bg-blue-600 rounded-full w-12 sm:w-16"></div>
                    </div>

                    {preguntas.length === 0 ? (
                      <div className="text-center py-12 sm:py-16">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">
                          No hay preguntas en esta plantilla
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                          Agrega preguntas para ver la vista previa
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 sm:space-y-8">
                        {/* Vista previa en tiempo real de la pregunta actual */}
                        {(preguntaForm.texto || preguntaForm.tipo_pregunta_id) && (
                          <div className="mb-6 sm:mb-8">
                            <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-xl p-4 sm:p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <svg
                                  className="w-5 h-5 text-blue-600"
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
                                <h3 className="text-lg font-semibold text-blue-900">
                                  {editingPregunta ? "Vista Previa - Editando" : "Vista Previa - Nueva Pregunta"}
                                </h3>
                              </div>

                              <div className="bg-white rounded-xl p-4 sm:p-6 border border-blue-200">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {preguntaForm.orden || 1}
                                  </span>
                                  {preguntaForm.tipo_pregunta_id && (
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoPreguntaColor(Number(preguntaForm.tipo_pregunta_id))}`}
                                    >
                                      {getTipoPreguntaNombre(Number(preguntaForm.tipo_pregunta_id))}
                                    </span>
                                  )}
                                  {preguntaForm.obligatoria && <span className="text-red-500 text-sm">*</span>}
                                </div>

                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                                  {preguntaForm.texto || "Escribe tu pregunta aquí..."}
                                  {preguntaForm.obligatoria && <span className="text-red-500 ml-1">*</span>}
                                </h3>

                                {renderPreguntaPreviewLive(preguntaForm)}
                              </div>
                            </div>
                          </div>
                        )}
                        {preguntas
                          .sort((a, b) => a.orden - b.orden)
                          .map((pregunta, index) => (
                            <div
                              key={pregunta.id}
                              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                      {pregunta.orden}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTipoPreguntaColor(pregunta.tipo_pregunta_id)}`}
                                    >
                                      {getTipoPreguntaNombre(pregunta.tipo_pregunta_id)}
                                    </span>
                                    {pregunta.obligatorio && <span className="text-red-500 text-sm">*</span>}
                                  </div>
                                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                                    {pregunta.texto}
                                    {pregunta.obligatorio && <span className="text-red-500 ml-1">*</span>}
                                  </h3>
                                  {renderPreguntaPreview(pregunta)}
                                </div>
                                <div className="flex gap-2 sm:ml-4">
                                  <button
                                    onClick={() => {
                                      setEditingPregunta(pregunta)
                                      setPreguntaForm({
                                        texto: pregunta.texto || "",
                                        tipo_pregunta_id: pregunta.tipo_pregunta_id || "",
                                        obligatoria: !!pregunta.obligatoria,
                                        orden: pregunta.orden || 1,
                                        opciones: (pregunta.opciones || []).map((opcion) => ({
                                          texto: opcion.texto || "",
                                          valor: opcion.valor || "",
                                        })),
                                      })
                                    }}
                                    className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    <span className="hidden sm:inline">Editar</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePregunta(pregunta.id)}
                                    className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all text-sm font-medium flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    <span className="hidden sm:inline">Eliminar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        disabled
                        className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium opacity-50 cursor-not-allowed w-full sm:w-auto"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
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

        .min-h-[280px] {
          min-height: 280px;
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
