

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  CheckSquare,
  Star,
  Calendar,
  Hash,
  FileText,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarTiposPregunta,
  crearTipoPregunta,
  actualizarTipoPregunta,
  eliminarTipoPregunta,
} from "../../services/api-admin"
const TiposPreguntaPage = () => {
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("")
  const [icono, setIcono] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [tiposPreguntas, setTiposPreguntas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingTipo, setEditingTipo] = useState(null)


  useEffect(() => {
    if (editingTipo) {
      setNombre(editingTipo.nombre)
      setCategoria(editingTipo.categoria)
      setIcono(editingTipo.icono)
      setDescripcion(editingTipo.descripcion)
    } else {
      setNombre("")
      setCategoria("")
      setIcono("")
      setDescripcion("")
    }
  }, [editingTipo])
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await listarTiposPregunta()
        setTiposPreguntas(res)
      } catch (error) {
        console.error("Error al cargar los tipos de pregunta:", error)
      }
    }

    fetchTipos()
  }, [])
  const getIconByType = (icono) => {
    switch (icono) {
      case "text":
        return FileText
      case "radio":
        return MessageSquare
      case "checkbox":
        return CheckSquare
      case "star":
        return Star
      case "calendar":
        return Calendar
      case "number":
        return Hash
      default:
        return MessageSquare
    }
  }
  const getCategoriaColor = (categoria) => {
    switch (categoria) {
      case "Abierta":
        return "bg-blue-100 text-blue-800"
      case "Cerrada":
        return "bg-green-100 text-green-800"
      case "Escala":
        return "bg-purple-100 text-purple-800"
      case "Específica":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTipo) {
        await actualizarTipoPregunta(editingTipo.id, { nombre, categoria, icono, descripcion })
      } else {
        await crearTipoPregunta({ nombre, categoria, icono, descripcion })
      }
      // Refrescar lista
      const res = await listarTiposPregunta()
      setTiposPreguntas(res)
      setShowModal(false)
      setEditingTipo(null)
    } catch (err) {
      console.error("Error al guardar:", err)
    }
  }
  const handleEdit = (tipo) => {
    setEditingTipo(tipo)
    setShowModal(true)
  }
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este tipo de pregunta?")) {
      try {
        await eliminarTipoPregunta(id)
        const res = await listarTiposPregunta()
        setTiposPreguntas(res)

      } catch (err) {
        console.error("Error al eliminar:", err)
      }
    }
  }
  return (
    <DashboardLayout activeSection="tipos-pregunta">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tipos de Pregunta</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Gestiona los tipos de preguntas disponibles para las encuestas
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Tipo</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{tiposPreguntas.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tiposPreguntas.reduce((sum, tipo) => sum + (tipo.usosActivos ?? 0), 0)}

                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Más Usado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...tiposPreguntas.map((t) => t.usosActivos ?? 0))}

                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(tiposPreguntas.map((t) => t.categoria || 'Sin categoría')).size}

                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {tiposPreguntas.map((tipo) => {
            const IconComponent = getIconByType(tipo.icono || '')

            return (
              <div key={tipo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{tipo.nombre}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{tipo.descripcion || "Sin descripción"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button onClick={() => handleEdit(tipo)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(tipo.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categoría</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(tipo.categoria || '')}`}>
                      {tipo.categoria || "Sin categoría"}
                    </span>

                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usos Activos</span>
                    <span className="text-sm font-medium text-gray-900">{tipo.usosActivos ?? 0}</span>

                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fecha Creación</span>
                    <span className="text-sm text-gray-500">
                      {tipo.fechaCreacion ? new Date(tipo.fechaCreacion).toLocaleDateString() : "Sin fecha"}
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
                {editingTipo ? "Editar Tipo de Pregunta" : "Nuevo Tipo de Pregunta"}
              </h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Texto Libre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Abierta">Abierta</option>
                    <option value="Cerrada">Cerrada</option>
                    <option value="Escala">Escala</option>
                    <option value="Específica">Específica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={icono}
                    onChange={(e) => setIcono(e.target.value)}
                  >
                    <option value="">Seleccionar icono</option>
                    <option value="text">Texto</option>
                    <option value="radio">Opción única</option>
                    <option value="checkbox">Múltiple selección</option>
                    <option value="star">Valoración</option>
                    <option value="calendar">Fecha</option>
                    <option value="number">Numérico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el tipo de pregunta"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTipo(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingTipo ? "Actualizar" : "Crear"}
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

export default TiposPreguntaPage
