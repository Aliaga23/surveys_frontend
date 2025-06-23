import { useEffect, useState } from "react";
import { registerOperator, listOperadores } from "../../services/api";
import DashboardSuscriptorLayout from "./layout";
import { useAuth } from "../../context/AuthContext";

const Operadores = () => {
    const { user } = useAuth(); // se debe proveer user.id (suscriptor_id) siuuuu
    const [operadores, setOperadores] = useState([]);
    const [formData, setFormData] = useState({ nombre_completo: "", email: "" });
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchOperadores = async (userId) => {
        setLoading(true);
        try {
            const data = await listOperadores(userId);
            setOperadores(data);
        } catch (err) {
            console.error("Error al obtener operadores", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOperadores(user.id);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerOperator({
                ...formData,
                suscriptor_id: user.id,
                password: "Temporal123!",
            });
            setFormData({ nombre_completo: "", email: "" });
            setShowModal(false);
            await fetchOperadores(user.id);
        } catch (err) {
            console.error("Error al registrar operador", err);
            alert("No se pudo registrar el operador");
        }
    };

    const filteredOperadores = operadores.filter(
        (op) =>
            op.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: operadores.length,
    };

    return (
        <DashboardSuscriptorLayout activeSection="operadores">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                                Operadores
                            </h1>
                            <p className="text-slate-600 text-lg">Gestiona tus operadores</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1 truncate">Total Operadores</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</p>
                                    <p className="text-slate-500 text-xs mt-1 truncate">Usuarios registrados</p>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de herramientas */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 shadow-xl shadow-slate-200/20">
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                            <div className="flex-1 max-w-full sm:max-w-md">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        placeholder="Buscar operadores..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Operador
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 animate-pulse"
                            >
                                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredOperadores.length === 0 ? (
                    <p>No hay operadores registrados.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOperadores.map((op) => (
                            <div
                                key={op.id}
                                className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-slate-300/25 transition-all duration-300 hover:-translate-y-1 h-48 flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-h-0">
                                        <h3 className="font-semibold text-slate-900 text-lg mb-3 truncate">{op.nombre_completo}</h3>
                                        <div className="space-y-2">
                                            {op.email && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm truncate">{op.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-2">
                                    {op.email && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Email
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                            <div className="px-6 py-4 border-b border-slate-200/60">
                                <h2 className="text-xl font-semibold text-slate-900">Nuevo Operador</h2>
                                <p className="text-slate-600 text-sm mt-1">
                                    Agrega un nuevo operador al sistema
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nombre_completo}
                                        onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200"
                                        placeholder="correo@ejemplo.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Será el correo del operador</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                                    >
                                        Crear Operador
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </DashboardSuscriptorLayout>
    );
};

export default Operadores;
