"use client"

import { useState } from "react"
import { Mail, ArrowLeft, ArrowRight, BarChart3, Menu, X, CheckCircle } from "lucide-react"
import { requestPasswordReset } from "../services/auth"
import { Link } from "react-router-dom"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleChange = (e) => {
    const { value } = e.target
    setEmail(value)
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({
        ...prev,
        email: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await requestPasswordReset(email)
      setIsEmailSent(true)
    } catch (error) {
      console.error("Password reset error:", error)
      setErrors({ general: error.message || "Error al enviar el email de restablecimiento" })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* NAVIGATION */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">SurveySaaS</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Funcionalidades
                </a>
                <a href="/#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Beneficios
                </a>
                <a href="/#testimonios" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Testimonios
                </a>
                <a href="/#precios" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Precios
                </a>
                <a href="/login" className="text-blue-600 font-medium">
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Registrarse
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t">
                <div className="flex flex-col space-y-4">
                  <a href="/#funcionalidades" className="text-gray-600 hover:text-blue-600">
                    Funcionalidades
                  </a>
                  <a href="/#beneficios" className="text-gray-600 hover:text-blue-600">
                    Beneficios
                  </a>
                  <a href="/#testimonios" className="text-gray-600 hover:text-blue-600">
                    Testimonios
                  </a>
                  <a href="/#precios" className="text-gray-600 hover:text-blue-600">
                    Precios
                  </a>
                  <a href="/login" className="text-blue-600 font-medium">
                    Iniciar sesión
                  </a>
                  <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                    Registrarse
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <BarChart3 className="h-12 w-12 text-blue-600 mr-3" />
                <span className="text-2xl font-bold text-gray-900">SurveySaaS</span>
              </div>
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Email enviado</h2>
              <p className="text-gray-600 mb-4">
                Hemos enviado un enlace de restablecimiento de contraseña a:
              </p>
              <p className="text-blue-600 font-medium mb-6">{email}</p>
              <p className="text-gray-600 text-sm">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                El enlace expirará en 1 hora.
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Link>
                <button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                    setErrors({})
                  }}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Enviar otro email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* NAVIGATION */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">SurveySaaS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">
                Funcionalidades
              </a>
              <a href="/#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Beneficios
              </a>
              <a href="/#testimonios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Testimonios
              </a>
              <a href="/#precios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Precios
              </a>
              <a href="/login" className="text-blue-600 font-medium">
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 hover:text-gray-900">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a href="/#funcionalidades" className="text-gray-600 hover:text-blue-600">
                  Funcionalidades
                </a>
                <a href="/#beneficios" className="text-gray-600 hover:text-blue-600">
                  Beneficios
                </a>
                <a href="/#testimonios" className="text-gray-600 hover:text-blue-600">
                  Testimonios
                </a>
                <a href="/#precios" className="text-gray-600 hover:text-blue-600">
                  Precios
                </a>
                <a href="/login" className="text-blue-600 font-medium">
                  Iniciar sesión
                </a>
                <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                  Registrarse
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-blue-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">SurveySaaS</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Restablecer contraseña</h2>
            <p className="text-gray-600">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {/* Forgot Password Form */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="tu@empresa.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Enviar enlace de restablecimiento
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>
            </form>
            {errors.general && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Back to login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                <ArrowLeft className="inline h-4 w-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword 