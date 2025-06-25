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
    });

    const data = await response.json();
    console.log("Respuesta login:", data);

    localStorage.setItem("token", data.access_token);

    const userInfo = await getCurrentUser(); // este ya guarda en localStorage también
    console.log("Info de usuario:", userInfo);

    localStorage.setItem("user", JSON.stringify(userInfo)); //  Guarda usuario local para offline

  if (userInfo.rol === "admin") {
      window.location.href = "/dashboard/roles";
    } else if (userInfo.tipo === "suscriptor") {
      window.location.href = "/dashboard-suscriptor/plantillas";
    } else if (userInfo.tipo === "operator") {
      window.location.href = "/dashboard-operador/plantillas";
    }

    return { ...data, user: userInfo };
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}


export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        throw new Error("Sesión expirada");
      }
      throw new Error("Error al obtener información del usuario");
    }

    const userData = await response.json();

    const tipo = userData.rol === "empresa" ? "suscriptor" : userData.rol;

    //  Actualiza la caché local
    localStorage.setItem("user", JSON.stringify(userData));

    return {
      ...userData,
      tipo,
    };
  } catch (error) {
    console.warn("Error al obtener usuario actual:", error);

    // Intenta cargar desde localStorage si está offline
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      const tipo = userData.rol === "empresa" ? "suscriptor" : userData.rol;

      return {
        ...userData,
        tipo,
      };
    }

    throw error;
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
  } else if (user.tipo === "operator") {
    return "/dashboard-operador/plantillas"
  }
  return "/login"
}

export async function checkRouteAccess(requiredType) {
  try {
    if (!isAuthenticated()) {
      return { hasAccess: false, redirectTo: "/login" }
    }    const user = await getCurrentUser()
    let hasAccess = false
    
    if (requiredType === "admin" && user.rol === "admin") {
      hasAccess = true
    } else if (requiredType === "suscriptor" && user.tipo === "suscriptor") {
      hasAccess = true
    } else if (requiredType === "operator" && user.tipo === "operator") {
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

export async function requestRegistration(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/request-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al solicitar registro");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en solicitud de registro:", error);
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al solicitar restablecimiento de contraseña");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al solicitar restablecimiento:", error);
    throw error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al cambiar la contraseña");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error;
  }
}
