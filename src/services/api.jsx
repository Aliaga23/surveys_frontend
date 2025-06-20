const API_BASE_URL = "https://surveysbackend-production.up.railway.app"

// Función para hacer requests autenticados
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

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

// Plantillas
export const getPlantillas = () => authFetch("/plantillas")
export const getPlantilla = (id) => authFetch(`/plantillas/${id}`)
export const createPlantilla = (data) => authFetch("/plantillas", { method: "POST", body: JSON.stringify(data) })
export const updatePlantilla = (id, data) =>
  authFetch(`/plantillas/${id}`, { method: "PATCH", body: JSON.stringify(data) })
export const deletePlantilla = (id) => authFetch(`/plantillas/${id}`, { method: "DELETE" })

// Preguntas
export const getPreguntas = (plantillaId) => authFetch(`/plantillas/${plantillaId}/preguntas`)
export const createPregunta = (plantillaId, data) =>
  authFetch(`/plantillas/${plantillaId}/preguntas`, { method: "POST", body: JSON.stringify(data) })
export const updatePregunta = (plantillaId, preguntaId, data) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}`, { method: "PATCH", body: JSON.stringify(data) })
export const deletePregunta = (plantillaId, preguntaId) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}`, { method: "DELETE" })

// Opciones
// Obtener todas las opciones de una pregunta
export const getOpciones = (plantillaId, preguntaId) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}/opciones`)

// Crear una nueva opción
export const createOpcion = (plantillaId, preguntaId, data) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}/opciones`, {
    method: "POST",
    body: JSON.stringify(data),
  })

// Actualizar una opción existente
export const updateOpcion = (plantillaId, preguntaId, opcionId, data) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}/opciones/${opcionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })

// Eliminar una opción
export const deleteOpcion = (plantillaId, preguntaId, opcionId) =>
  authFetch(`/plantillas/${plantillaId}/preguntas/${preguntaId}/opciones/${opcionId}`, { method: "DELETE" })

// Destinatarios
export const getDestinatarios = () => authFetch("/destinatarios")
export const createDestinatario = (data) => authFetch("/destinatarios", { method: "POST", body: JSON.stringify(data) })
export const updateDestinatario = (id, data) =>
  authFetch(`/destinatarios/${id}`, { method: "PATCH", body: JSON.stringify(data) })
export const deleteDestinatario = (id) => authFetch(`/destinatarios/${id}`, { method: "DELETE" })

// Campañas
export const getCampanas = () => authFetch("/campanas")
export const getCampana = (id) => authFetch(`/campanas/${id}`)
export const getCampanaFullDetail = (id) => authFetch(`/campanas/${id}/full-detail`)
export const createCampana = (data) => {
  // Limpiar campos vacíos antes de enviar
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== "" && value !== null))
  return authFetch("/campanas", { method: "POST", body: JSON.stringify(cleanData) })
}
export const updateCampana = (id, data) => {
  // Limpiar campos vacíos antes de enviar
  const cleanData = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== "" && value !== null))
  return authFetch(`/campanas/${id}`, { method: "PATCH", body: JSON.stringify(cleanData) })
}
export const deleteCampana = (id) => authFetch(`/campanas/${id}`, { method: "DELETE" })

// Entregas
export const getEntregasByCampana = (campanaId, skip = 0, limit = 100) =>
  authFetch(`/campanas/${campanaId}/entregas?skip=${skip}&limit=${limit}`)

export const createEntrega = (campanaId, data) =>
  authFetch(`/campanas/${campanaId}/entregas`, { method: "POST", body: JSON.stringify(data) })

export const getEntrega = (campanaId, entregaId) => authFetch(`/campanas/${campanaId}/entregas/${entregaId}`)

export const updateEntrega = (campanaId, entregaId, data) =>
  authFetch(`/campanas/${campanaId}/entregas/${entregaId}`, { method: "PATCH", body: JSON.stringify(data) })

export const deleteEntrega = (campanaId, entregaId) =>
  authFetch(`/campanas/${campanaId}/entregas/${entregaId}`, { method: "DELETE" })

export const markEntregaAsSent = (campanaId, entregaId) =>
  authFetch(`/campanas/${campanaId}/entregas/${entregaId}/mark-sent`, { method: "POST" })

export const markEntregaAsResponded = (campanaId, entregaId) =>
  authFetch(`/campanas/${campanaId}/entregas/${entregaId}/mark-responded`, { method: "POST" })

// Respuestas
export const getRespuestas = (campanId = null) => {
  const endpoint = campanId ? `/respuestas?campana_id=${campanId}` : "/respuestas"
  return authFetch(endpoint)
}
