const API_URL = "https://surveysbackend-production.up.railway.app"

export async function registerSuscriptor(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register/suscriptor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error al registrar suscriptor")
    }

    return await response.json()
  } catch (error) {
    console.error("Error en registro:", error)
    throw error
  }
}

export async function login(credentials) {
  try {
    // Llamada a la API y autenticación
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    // Procesar respuesta
    const data = await response.json()
    console.log("Respuesta login:", data)

    localStorage.setItem("token", data.access_token)
    const userInfo = await getCurrentUser()
    console.log("Info de usuario:", userInfo)

    // Redirección según la combinación correcta de rol y tipo
    if (userInfo.rol === "admin") {
      window.location.href = "/dashboard/roles"
    } else if (userInfo.tipo === "suscriptor") {
      // Redireccionar a todos los usuarios tipo "suscriptor" (incluye empresas y operadores)
      window.location.href = "/dashboard-suscriptor/plantillas"
    }

    return { ...data, user: userInfo }
  } catch (error) {
    console.error("Error en login:", error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Sesión expirada")
      }
      throw new Error("Error al obtener información del usuario")
    }

    const userData = await response.json()

    let userType = userData.rol
    if (userData.rol === "empresa") {
      userType = "suscriptor"
    }

    return {
      ...userData,
      tipo: userType,
    }
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    throw error
  }
}

export function isAuthenticated() {
  return localStorage.getItem("token") !== null
}

export function logout() {
  localStorage.removeItem("token")
  window.location.href = "/login"
}

export function getAuthToken() {
  return localStorage.getItem("token")
}

export function redirectBasedOnRole(user) {
  if (user.rol === "admin") {
    return "/dashboard/roles"
  } else if (user.tipo === "suscriptor") {
    return "/dashboard-suscriptor/plantillas"
  }
  return "/login"
}

export async function checkRouteAccess(requiredType) {
  try {
    if (!isAuthenticated()) {
      return { hasAccess: false, redirectTo: "/login" }
    }

    const user = await getCurrentUser()
    let hasAccess = false

    if (requiredType === "admin" && user.rol === "admin") {
      hasAccess = true
    } else if (requiredType === "suscriptor" && user.tipo === "suscriptor") {
      hasAccess = true
    }

    if (!hasAccess) {
      const correctRoute = redirectBasedOnRole(user)
      return { hasAccess: false, redirectTo: correctRoute }
    }

    return { hasAccess: true, user }
  } catch (error) {
    return { hasAccess: false, redirectTo: "/login" }
  }
}

export async function verifyRegistrationRequest(token) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-registration?token=${token}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al verificar la cuenta");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en verificación de cuenta:", error);
    throw error;
  }
}

export async function requestVerificationEmail(email) {
  try {
    const response = await fetch(`${API_URL}/auth/request-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al solicitar reenvío de verificación");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en solicitud de verificación:", error);
    throw error;
  }
}
