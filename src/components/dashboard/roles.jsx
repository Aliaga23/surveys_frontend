// Roles.jsx - Versión final funcional y estéticamente cuidada



import { useEffect, useState } from "react"
import {
  Plus, Edit, Trash2,
  MessageSquare,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import { listarRoles, crearRol, actualizarRol, eliminarRol } from "../../services/api-admin"


const RolesPage = () => {
  const [roles, setRoles] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    async function cargar() {
      try {
        const data = await listarRoles()
        setRoles(
          data.map((r) => ({
            ...r,
            estado: "activo",
            fechaCreacion: new Date().toISOString(),
          }))
        )
      } catch (err) {
        alert("Error al cargar roles")
      }
    }
    cargar()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let nuevoRol
      if (editingRole) {
        nuevoRol = await actualizarRol(editingRole.id, nombre)
        setRoles(roles.map((r) => (r.id === nuevoRol.id ? { ...r, nombre: nuevoRol.nombre } : r)))
      } else {
        nuevoRol = await crearRol(nombre)
        setRoles([
          ...roles,
          {
            id: nuevoRol.id,
            nombre: nuevoRol.nombre,
            estado: "activo",
            fechaCreacion: new Date().toISOString(),
          },
        ])
      }
      setShowModal(false)
      setNombre("")
      setEditingRole(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar rol?")) return
    try {
      await eliminarRol(id)
      setRoles(roles.filter((r) => r.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const abrirModalNuevo = () => {
    setEditingRole(null)
    setNombre("")
    setShowModal(true)
  }

  const abrirModalEditar = (rol) => {
    setEditingRole(rol)
    setNombre(rol.nombre)
    setShowModal(true)
  }

  return (
    <DashboardLayout activeSection="roles">
      <div className="min-h-full p-4 sm:p-6 bg-gradient-to-br
                from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Roles
              </h1>
              <p className="text-slate-600 text-lg">Gestiona los roles del sistema</p>
            </div>

            <button
              onClick={abrirModalNuevo}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm bborder border-white/20">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tipos</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- LISTA DE ROLES (Tabla) ---------- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Roles</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Única columna de datos */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  {/* Columna para los botones */}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((rol) => (
                  <tr key={rol.id} className="hover:bg-gray-50">
                    {/* Nombre del rol */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {rol.nombre}
                      </span>
                    </td>

                    {/* Botones de acción */}
                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(rol)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(rol.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingRole ? "Editar Rol" : "Nuevo Rol"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                  <input
                    name="nombre"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Administrador"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingRole(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingRole ? "Actualizar" : "Crear"}
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

export default RolesPage