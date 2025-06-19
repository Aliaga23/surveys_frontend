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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Error en inicio de sesión")
    }

    const data = await response.json()

    localStorage.setItem("token", data.access_token)

    const userInfo = await getCurrentUser()

    if (userInfo.tipo === "admin") {
      window.location.href = "/dashboard"
    } else if (userInfo.tipo === "suscriptor") {
      window.location.href = "/dashboard-suscriptor"
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

export function redirectBasedOnRole(userRole) {
  if (userRole === "admin") {
    return "/dashboard"
  } else if (userRole === "empresa" || userRole === "suscriptor") {
    return "/dashboard-suscriptor"
  } else if (userRole === "operator") {
    return "/dashboard-suscriptor" 
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
    } else if (requiredType === "suscriptor" && (user.rol === "empresa" || user.rol === "operator")) {
      hasAccess = true
    }

    if (!hasAccess) {
      const correctRoute = redirectBasedOnRole(user.rol)
      return { hasAccess: false, redirectTo: correctRoute }
    }

    return { hasAccess: true, user }
  } catch (error) {
    return { hasAccess: false, redirectTo: "/login" }
  }
}
