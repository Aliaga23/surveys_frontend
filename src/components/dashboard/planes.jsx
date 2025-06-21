"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Crown,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../dashboard-layout";
import {
  listarPlanes,
  crearPlan,
  actualizarPlan,
  eliminarPlan,
} from "../../services/api-admin";

const PlanesPage = () => {
  const [planes, setPlanes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", precio_mensual: "" });

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const data = await listarPlanes();
        setPlanes(data);
      } catch (error) {
        console.error("Error al cargar planes:", error);
      }
    };
    fetchPlanes();
  }, []);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      nombre: plan.nombre,
      descripcion: plan.descripcion,
      precio_mensual: parseFloat(plan.precio_mensual),
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este plan?")) {
      try {
        await eliminarPlan(id);
        setPlanes(planes.filter((p) => p.id !== id));
      } catch (error) {
        alert("Error al eliminar el plan");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const updated = await await actualizarPlan(
          editingPlan.id,
          formData.nombre,
          parseFloat(formData.precio_mensual),
          formData.descripcion
        )
          ;
        setPlanes(planes.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const nuevo = await crearPlan(
          formData.nombre,
          parseFloat(formData.precio_mensual),
          formData.descripcion
        );
        setPlanes([...planes, nuevo]);
      }
      setShowModal(false);
      setEditingPlan(null);
      setFormData({ nombre: "", descripcion: "", precio_mensual: "" });
    } catch (error) {
      alert("Error al guardar el plan");
    }
  };

  return (
    <DashboardLayout activeSection="planes">
      <div className="p-6">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Planes de Suscripción</h1>
            <p className="text-gray-600 text-sm">Gestiona los planes y sus precios</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Planes</p>
                <p className="text-2xl font-bold text-gray-900">{planes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Planes Visibles</p>
                <p className="text-2xl font-bold text-gray-900">{planes.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {planes.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border p-4 relative">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{plan.nombre}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{plan.descripcion}</p>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {parseFloat(plan.precio_mensual) === 0 ? "Gratis" : `€${plan.precio_mensual}`}
              </div>
              <p className="text-xs text-gray-400 mt-1">Creado el {new Date(plan.creado_en).toLocaleDateString()}</p>
              <div className="flex mt-4 space-x-2">
                <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPlan ? "Editar Plan" : "Nuevo Plan"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio mensual (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.precio_mensual}
                    onChange={(e) => setFormData({ ...formData, precio_mensual: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPlan(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPlan ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PlanesPage;
