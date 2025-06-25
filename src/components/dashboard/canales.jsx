import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, MoreHorizontal, Radio } from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarCanales,
  crearCanal,
  actualizarCanal,
  eliminarCanal,
} from "../../services/api-admin"

const CanalesPage = () => {
  /* ---------------- state ---------------- */
  const [canales, setCanales] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCanal, setEditing] = useState(null)
  const [nombre, setNombre] = useState("")

  /* ---------------- helpers -------------- */
  const resetForm = () => {
    setNombre("")
    setEditing(null)
  }

  const refresh = async () => {
    const data = await listarCanales()
    setCanales(data)             
  }

  /* --------------- init ------------------ */
  useEffect(() => { refresh() }, [])

  /* --------------- CRUD ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingCanal) {
        const actualizado = await actualizarCanal(editingCanal.id, { nombre })
        setCanales(prev =>
          prev.map(c => (c.id === actualizado.id ? actualizado : c))
        )
      } else {
        const creado = await crearCanal({ nombre })
        setCanales(prev => [...prev, creado])
      }

      // await refresh()   // ← descomenta si quieres validar con el servidor
      setShowModal(false)
      resetForm()
    } catch (err) {
      console.error("Error guardando canal:", err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este canal?")) return

    try {
      await eliminarCanal(id)
      setCanales(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error("Error eliminando canal:", err)
    }
  }

  /* ---------------- UI ------------------- */
  return (
    <DashboardLayout activeSection="canales">
      <div className="min-h-full p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        {/* -------- encabezado -------- */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Canales
            </h1>
            <p className="text-slate-600 text-lg">Configura y administra tus canales de distribución</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <Plus className="h-4 w-4" />
            Nuevo Canal
          </button>
        </div>
        {        /* Stats Cardssss */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Radio className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Canales</p>
                <p className="text-2xl font-bold text-gray-900">{canales.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* -------- tabla simple -------- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Canales</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {canales.map(canal => (
                  <tr key={canal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">{canal.nombre}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => { setEditing(canal); setNombre(canal.nombre); setShowModal(true) }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(canal.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
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

        {/* -------- modal -------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingCanal ? "Editar Canal" : "Nuevo Canal"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Email marketing"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm() }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingCanal ? "Actualizar" : "Crear"}
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

export default CanalesPage
