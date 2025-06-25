// src/components/dashboard/estados-pago.jsx
import { useEffect, useState } from "react"
import {
  Plus, Edit, Trash2,
  Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, CreditCard, MessageSquare
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarEstadosPago,
  crearEstadoPago,
  actualizarEstadoPago,
  eliminarEstadoPago,
} from "../../services/api-admin"

/* ---------- helpers ---------- */
const ICONOS = {
  pendiente: Clock,
  exitoso: CheckCircle,
  fallido: XCircle,
  reembolsado: AlertTriangle,
  cancelado: XCircle,
  pago: DollarSign,
}
const getIcon = (nombre) => ICONOS[nombre?.toLowerCase()] || CreditCard
const getColor = (nombre) => ({
  pendiente: "#6b7280",
  exitoso: "#10b981",
  fallido: "#ef4444",
  reembolsado: "#f97316",
  cancelado: "#dc2626",
  pago: "#22c55e",
}[nombre?.toLowerCase()] || "#3b82f6")
/* -------------------------------- */

export default function EstadosPagoPage() {
  const [estados, setEstados] = useState([])
  const [modal, setModal] = useState(false)
  const [nombre, setNombre] = useState("")
  const [edit, setEdit] = useState(null)

  /* cargar ------------------------------------------------------ */
  const refresh = async () => setEstados(await listarEstadosPago())
  useEffect(() => { refresh() }, [])

  /* CRUD -------------------------------------------------------- */
  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (edit) {
        const upd = await actualizarEstadoPago(edit.id, nombre)
        setEstados((prev) => prev.map((e) => (e.id === upd.id ? upd : e)))
      } else {
        const nuevo = await crearEstadoPago(nombre)
        setEstados((prev) => [...prev, nuevo])
      }
      cerrar()
    } catch (err) { console.error(err) }
  }

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este estado?")) return
    await eliminarEstadoPago(id)
    setEstados((prev) => prev.filter((e) => e.id !== id))
  }

  /* helpers UI -------------------------------------------------- */
  const abrirNuevo = () => { setEdit(null); setNombre(""); setModal(true) }
  const abrirEdit = (e) => { setEdit(e); setNombre(e.nombre); setModal(true) }
  const cerrar = () => { setModal(false); setEdit(null); setNombre("") }

  /* render ------------------------------------------------------ */
  return (
    <DashboardLayout activeSection="estados-pago">
      <div className="min-h-full p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        {/* header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Estados de Pago
            </h1>
            <p className="text-slate-600 text-lg">
              Administra los estados del proceso de pago
            </p>
          </div>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <Plus className="h-4 w-4" />
            Nuevo Estado
          </button>
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
                <p className="text-2xl font-bold text-gray-900">{estados.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Lista de Estados</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estados.map((e) => {
                  const Icon = getIcon(e.nombre)
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: getColor(e.nombre) }}>
                          <Icon className="h-4 w-4" />
                        </span>
                        {e.nombre}
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex gap-2">
                          <button onClick={() => abrirEdit(e)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => eliminar(e.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {edit ? "Editar Estado" : "Nuevo Estado"}
              </h3>

              <form onSubmit={guardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: exitoso"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={cerrar}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {edit ? "Actualizar" : "Crear"}
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
