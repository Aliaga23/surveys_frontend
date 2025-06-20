// src/services/roles.js
const API_URL = "https://surveysbackend-production.up.railway.app"

function getToken() {
  return localStorage.getItem("token")
}

export async function listarRoles() {
  const res = await fetch(`${API_URL}/catalogos/roles`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (!res.ok) throw new Error("Error al listar roles")
  return await res.json()
}

export async function crearRol(nombre) {
  const res = await fetch(`${API_URL}/catalogos/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ nombre })
  })
  if (!res.ok) throw new Error("Error al crear rol")
  return await res.json()
}

export async function actualizarRol(id, nombre) {
  const res = await fetch(`${API_URL}/catalogos/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ nombre })
  })
  if (!res.ok) throw new Error("Error al actualizar rol")
  return await res.json()
}

export async function eliminarRol(id) {
  const res = await fetch(`${API_URL}/catalogos/roles/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (!res.ok) throw new Error("Error al eliminar rol")
  return true
}
