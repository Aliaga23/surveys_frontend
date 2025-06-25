// src/components/dashboard/metodos-pago.jsx
import { useEffect, useState } from "react"
import {
  Plus, Edit, Trash2,
  CreditCard, Smartphone, Building, Banknote, Wallet, Globe, MessageSquare,
} from "lucide-react"
import DashboardLayout from "../dashboard-layout"
import {
  listarMetodosPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
} from "../../services/api-admin"

/* -------------------------------- util: icono dinámico ------------------------------- */
const getIconByNombre = (nombre = "") => ({
  tarjeta       : CreditCard,
  wallet        : Wallet,
  transferencia : Building,
  movil         : Smartphone,
  efectivo      : Banknote,
  stripe        : Globe,
}[nombre.toLowerCase()] || CreditCard)

/* -------------------------------- componente ---------------------------------------- */
export default function MetodosPagoPage() {
  /* ──────────────── state ──────────────── */
  const [rows,   setRows  ] = useState([])
  const [modal,  setModal ] = useState(false)
  const [editId, setEditId] = useState(null)
  const [nombre, setNombre] = useState("")

  /* ──────────────── inicial ──────────────── */
  useEffect(() => {
    listarMetodosPago().then(setRows).catch(console.error)
  }, [])

  /* ──────────────── helpers UI ──────────────── */
  const abrirNuevo = () => { setEditId(null); setNombre(""); setModal(true) }
  const abrirEdit  = (r)  => { setEditId(r.id); setNombre(r.nombre); setModal(true) }
  const cerrar     = () => { setModal(false); setEditId(null); setNombre("") }

  /* ──────────────── guardar ──────────────── */
  const submit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        const actualizado = await actualizarMetodoPago(editId, nombre)
        setRows(prev => prev.map(r => (r.id === actualizado.id ? actualizado : r)))
      } else {
        const nuevo = await crearMetodoPago(nombre)
        setRows(prev => [...prev, nuevo])
      }
      cerrar()
    } catch (err) {
      console.error(err)
    }
  }

  /* ──────────────── eliminar ──────────────── */
  const borrar = async (id) => {
    if (!window.confirm("¿Eliminar método de pago?")) return
    try {
      await eliminarMetodoPago(id)
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  /* ──────────────── render ──────────────── */
  return (
    <DashboardLayout activeSection="metodos-pago">
      <div className="min-h-full p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Métodos de Pago
            </h1>
            <p className="text-slate-600 text-lg">
              Gestiona los métodos de pago disponibles para los clientes
            </p>
          </div>
          <button onClick={abrirNuevo}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/25">
            <Plus className="h-4 w-4" /> Nuevo Método
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total Tipos</p>
                <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Métodos</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map(r => {
                  const Icon = getIconByNombre(r.nombre)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-gray-900 font-medium">{r.nombre}</span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button onClick={() => abrirEdit(r)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => borrar(r.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar">
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

        {/* Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-slate-200/60">
                <h3 className="text-xl font-semibold">
                  {editId ? "Editar Método de Pago" : "Nuevo Método de Pago"}
                </h3>
              </div>

              <form onSubmit={submit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={cerrar}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editId ? "Actualizar" : "Crear"}
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
