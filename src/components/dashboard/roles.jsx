"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Users, Shield, Settings } from "lucide-react"
import DashboardLayout from "../dashboard-layout"

const RolesPage = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      nombre: "Super Administrador",
      descripcion: "Acceso completo al sistema",
      permisos: ["crear", "leer", "actualizar", "eliminar", "administrar"],
      usuarios: 2,
      estado: "activo",
      fechaCreacion: "2024-01-15",
    },
    {
      id: 2,
      nombre: "Administrador",
      descripcion: "Gestión de usuarios y configuración",
      permisos: ["crear", "leer", "actualizar", "eliminar"],
      usuarios: 5,
      estado: "activo",
      fechaCreacion: "2024-01-20",
    },
    {
      id: 3,
      nombre: "Editor",
      descripcion: "Creación y edición de contenido",
      permisos: ["crear", "leer", "actualizar"],
      usuarios: 12,
      estado: "activo",
      fechaCreacion: "2024-02-01",
    },
    {
      id: 4,
      nombre: "Visualizador",
      descripcion: "Solo lectura de información",
      permisos: ["leer"],
      usuarios: 25,
      estado: "activo",
      fechaCreacion: "2024-02-10",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  const getPermisosColor = (permisos) => {
    if (permisos.includes("administrar")) return "bg-red-100 text-red-800"
    if (permisos.includes("eliminar")) return "bg-orange-100 text-orange-800"
    if (permisos.includes("actualizar")) return "bg-blue-100 text-blue-800"
    return "bg-green-100 text-green-800"
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este rol?")) {
      setRoles(roles.filter((role) => role.id !== id))
    }
  }

  return (
    <DashboardLayout activeSection="roles">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Roles</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra los roles y permisos del sistema</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Roles Activos</p>
                <p className="text-2xl font-bold text-gray-900">{roles.filter((r) => r.estado === "activo").length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Asignados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.reduce((sum, role) => sum + role.usuarios, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Permisos Únicos</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Roles</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Rol
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Permisos
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Usuarios
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Estado
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fecha Creación
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{role.nombre}</div>
                          <div className="text-sm text-gray-500 hidden sm:block">{role.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permisos.slice(0, 2).map((permiso) => (
                            <span
                              key={permiso}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPermisosColor(
                                role.permisos,
                              )}`}
                            >
                              {permiso}
                            </span>
                          ))}
                          {role.permisos.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{role.permisos.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{role.usuarios}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {role.estado}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="hidden sm:inline">{new Date(role.fechaCreacion).toLocaleDateString()}</span>
                        <span className="sm:hidden">
                          {new Date(role.fechaCreacion).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-900 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900 p-1">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingRole ? "Editar Rol" : "Nuevo Rol"}</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Administrador"
                    defaultValue={editingRole?.nombre || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe las responsabilidades del rol"
                    defaultValue={editingRole?.descripcion || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                  <div className="space-y-2">
                    {["crear", "leer", "actualizar", "eliminar", "administrar"].map((permiso) => (
                      <label key={permiso} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          defaultChecked={editingRole?.permisos.includes(permiso) || false}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{permiso}</span>
                      </label>
                    ))}
                  </div>
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
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
