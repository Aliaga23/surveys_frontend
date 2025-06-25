import { addToOfflineQueue, isOnline, registerSync } from './offlineSync'

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

  // Para métodos que modifican datos (POST, PUT, PATCH, DELETE)
  if (!isOnline() && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
    console.log(`Dispositivo offline. Guardando ${options.method} ${endpoint} para sincronizar más tarde.`)
    
    // Extraer el body como un objeto para almacenar
    let data = null
    if (options.body) {
      try {
        data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
      } catch (e) {
        console.error('Error parsing request body:', e)
        data = options.body
      }
    }

    // Agregar a la cola offline
    await addToOfflineQueue(endpoint, options.method, data)
    
    // Registrar para background sync si está disponible
    await registerSync()

    // Retornar una respuesta simulada para la UI
    // Podemos devolver un objeto con un ID temporal o un estado pendiente
    if (options.method === 'DELETE') {
      return true // Simular éxito para DELETE
    }
    
    return {
      id: `offline_${new Date().getTime()}`,
      _offlineCreated: true,
      ...data,
      status: 'pending'
    }
  }

  try {
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
  } catch (error) {
    if (!isOnline() && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      // Si hay un error de red, intentar guardar offline
      console.log(`Error de red. Guardando ${options.method} ${endpoint} para sincronizar después.`)
      
      let data = null
      if (options.body) {
        try {
          data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
        } catch (e) {
          data = options.body
        }
      }

      await addToOfflineQueue(endpoint, options.method, data)
      await registerSync()

      if (options.method === 'DELETE') {
        return true
      }
      
      return {
        id: `offline_${new Date().getTime()}`,
        _offlineCreated: true,
        ...data,
        status: 'pending'
      }
    }
    throw error
  }
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
//Operadores
export const registerOperator = (data) =>
  authFetch("/auth/register/usuario", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const listOperadores = (suscriptorId) =>
  authFetch(`/auth/operadores/${suscriptorId}`);

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
export const getEntregasByCampana = (campanaId, skip = 0, limit = 1000) =>
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


// Planes
export const listPlanes = () => authFetch("/subscription/planes");

export const getPlan = (id) => authFetch(`/subscription/planes/${id}`);

export const createPlan = (data) =>
  authFetch("/subscription/planes", { method: "POST", body: JSON.stringify(data) });

export const updatePlan = (id, data) =>
  authFetch(`/subscription/planes/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePlan = (id) =>
  authFetch(`/subscription/planes/${id}`, { method: "DELETE" });

// Suscripciones
export const iniciarStripeCheckout = (suscriptorId, planId) =>
  authFetch(`/subscription/stripe-checkout?suscriptor_id=${suscriptorId}&plan_id=${planId}`, {
    method: "POST",
  });

// Auth
export const getMe = () => authFetch("/auth/me");

// Entregas por Papel (Bulk)
export const createBulkEntregas = (campanaId, cantidad) =>
  authFetch(`/campanas/${campanaId}/entregas/bulk?cantidad=${cantidad}`, { method: "POST", body: "" })

// Descargar formulario PDF individual
export const downloadFormularioPdf = async (campanaId) => {
  const token = localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token de autenticación")
  }

  const response = await fetch(`${API_BASE_URL}/entregas/campanas/${campanaId}/formularios.pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
      throw new Error("Sesión expirada")
    }
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  return response.blob()
}

// Funciones para el perfil del suscriptor
export async function updateSuscriptor(data) {
  console.log('data', data)
  const token = localStorage.getItem("token")
  try {
    const response = await fetch(`${API_BASE_URL}/auth/update/suscriptor`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error al actualizar el perfil del suscriptor")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al actualizar suscriptor:", error)
    throw error
  }
}

