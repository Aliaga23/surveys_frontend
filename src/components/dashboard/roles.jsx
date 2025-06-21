// Roles.jsx - Versión final funcional y estéticamente cuidada

"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, MoreHorizontal,   Star,
  MessageSquare,
  FileText,
  CheckSquare, } from "lucide-react"
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
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Roles</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Administra los roles y permisos del sistema
              </p>
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
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
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.reduce((sum, tipo) => sum + (tipo.usosActivos ?? 0), 0)}

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
                  {Math.max(...roles.map((t) => t.usosActivos ?? 0))}

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
                  {new Set(roles.map((t) => t.categoria || 'Sin categoría')).size}

                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Roles</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((rol) => (
                    <tr key={rol.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rol.nombre}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {rol.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rol.fechaCreacion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => abrirModalEditar(rol)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rol.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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