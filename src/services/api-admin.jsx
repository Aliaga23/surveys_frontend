// src/services/api-admin.js
const API_BASE_URL = "https://surveysbackend-production.up.railway.app"
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("No hay token de autenticación")

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
      throw new Error("Sesión expirada")
    }
    const errorData = await response.text()
    throw new Error(`Error ${response.status}: ${errorData}`)
  }

  if (response.status === 204) return true
  return response.json()
}

// Roles
export const listarRoles = () => authFetch("/catalogos/roles")
export const obtenerRol = (id) => authFetch(`/catalogos/roles/${id}`)
export const crearRol = (nombre) =>
  authFetch("/catalogos/roles", { method: "POST", body: JSON.stringify({ nombre }) })
export const actualizarRol = (id, nombre) =>
  authFetch(`/catalogos/roles/${id}`, { method: "PUT", body: JSON.stringify({ nombre }) })
export const eliminarRol = (id) => authFetch(`/catalogos/roles/${id}`, { method: "DELETE" })

// Estados Capaña
export const listarEstadosCampana = () => authFetch("/catalogos/estados-campana")
export const crearEstadoCampana = (nombre) =>
  authFetch("/catalogos/estados-campana", { method: "POST", body: JSON.stringify({ nombre }) })
export const actualizarEstadoCampana = (id, nombre) =>
  authFetch(`/catalogos/estados-campana/${id}`, { method: "PUT", body: JSON.stringify({ nombre }) })
export const eliminarEstadoCampana = (id) => authFetch(`/catalogos/estados-campana/${id}`, { method: "DELETE" })

// ESTADOS ENTREGA 
export const listarEstadosEntrega = () => authFetch("/catalogos/estados-entrega")
export const crearEstadoEntrega = (nombre) =>
  authFetch("/catalogos/estados-entrega", { method: "POST", body: JSON.stringify({ nombre }) })
export const actualizarEstadoEntrega = (id, nombre) =>
  authFetch(`/catalogos/estados-entrega/${id}`, { method: "PUT", body: JSON.stringify({ nombre }) })
export const eliminarEstadoEntrega = (id) =>
  authFetch(`/catalogos/estados-entrega/${id}`, { method: "DELETE" })

// Estados de Pago
export const listarEstadosPago = () => authFetch("/catalogos/estados-pago")
export const crearEstadoPago = (nombre) =>
  authFetch("/catalogos/estados-pago", {method: "POST", body: JSON.stringify({ nombre }) })
export const actualizarEstadoPago = (id, nombre) =>
  authFetch(`/catalogos/estados-pago/${id}`, {method: "PUT", body: JSON.stringify({ nombre }) })
export const eliminarEstadoPago = (id) =>
  authFetch(`/catalogos/estados-pago/${id}`, {method: "DELETE" })

// Métodos de Pago
export const listarMetodosPago = () => authFetch("/catalogos/metodos-pago")
export const crearMetodoPago = (nombre) =>
  authFetch("/catalogos/metodos-pago", {method: "POST", body: JSON.stringify({ nombre }) })
export const actualizarMetodoPago = (id, nombre) =>
  authFetch(`/catalogos/metodos-pago/${id}`, {method: "PUT", body: JSON.stringify({ nombre }) })
export const eliminarMetodoPago = (id) =>
  authFetch(`/catalogos/metodos-pago/${id}`, {method: "DELETE" })

// Planes de Suscripción
export const listarPlanes = () => authFetch("/subscription/planes")
export const obtenerPlan = (id) => authFetch(`/subscription/planes/${id}`)
export const crearPlan = (nombre, precio_mensual, descripcion) =>
  authFetch("/subscription/planes", {method: "POST", body: JSON.stringify({ nombre, precio_mensual, descripcion }) })
export const actualizarPlan = (id, nombre, precio_mensual, descripcion) =>
  authFetch(`/subscription/planes/${id}`, {method: "PUT", body: JSON.stringify({ nombre, precio_mensual, descripcion }) })
export const eliminarPlan = (id) =>
  authFetch(`/subscription/planes/${id}`, { method: "DELETE" })

// Tipos de Pregunta
export const listarTiposPregunta = () => authFetch("/catalogos/tipos-pregunta")

export const crearTipoPregunta = (data) =>
  authFetch("/catalogos/tipos-pregunta", {
    method: "POST",
    body: JSON.stringify(data),
  })

export const actualizarTipoPregunta = (id, data) =>
  authFetch(`/catalogos/tipos-pregunta/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })

export const eliminarTipoPregunta = (id) =>
  authFetch(`/catalogos/tipos-pregunta/${id}`, {
    method: "DELETE",
  })

export const listarCanales = () => authFetch("/catalogos/canales")

export const crearCanal = (canalData) =>
  authFetch("/catalogos/canales", {
    method: "POST",
    body: JSON.stringify(canalData),
  })

export const actualizarCanal = (id, canalData) =>
  authFetch(`/catalogos/canales/${id}`, {
    method: "PUT",
    body: JSON.stringify(canalData),
  })

export const eliminarCanal = (id) =>
  authFetch(`/catalogos/canales/${id}`, {
    method: "DELETE",
  })

// Funciones para el perfil del admin
export async function updateAdmin(data) {
  const token = localStorage.getItem("token")
  try {
    const response = await fetch(`${API_BASE_URL}/auth/update/admin`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error al actualizar el perfil del administrador")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al actualizar administrador:", error)
    throw error
  }
}
export const listarEstadosDocumento = () =>
  authFetch("/catalogos/estados-documento")

export const crearEstadoDocumento = (nombre) =>
  authFetch("/catalogos/estados-documento", {
    method: "POST",
    body  : JSON.stringify({ nombre }),
  })

export const actualizarEstadoDocumento = (id, nombre) =>
  authFetch(`/catalogos/estados-documento/${id}`, {
    method: "PUT",
    body  : JSON.stringify({ nombre }),
  })

export const eliminarEstadoDocumento = (id) =>
  authFetch(`/catalogos/estados-documento/${id}`, { method: "DELETE" })