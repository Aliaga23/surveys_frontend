"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, ArrowLeft, ArrowRight, BarChart3, Menu, X, CheckCircle } from "lucide-react"
import { resetPassword } from "../services/auth"
import { Link, useSearchParams, useNavigate } from "react-router-dom"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [token, setToken] = useState("")
  const [isTokenValid, setIsTokenValid] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    console.log('tokenParam', tokenParam)
    if (!tokenParam) {
      setIsTokenValid(false)
      setErrors({ general: "Token de restablecimiento no válido o expirado" })
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
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
      await resetPassword(token, formData.password)
      setIsPasswordReset(true)
    } catch (error) {
      console.error("Password reset error:", error)
      if (error.message.includes("token") || error.message.includes("expirado")) {
        setIsTokenValid(false)
        setErrors({ general: "El enlace de restablecimiento ha expirado o no es válido. Solicita uno nuevo." })
      } else {
        setErrors({ general: error.message || "Error al restablecer la contraseña" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
              <p className="text-gray-600 mb-6">
                El enlace de restablecimiento de contraseña ha expirado o no es válido.
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
              <div className="text-center space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/forgot-password"
                    className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Solicitar nuevo enlace
                  </Link>
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isPasswordReset) {
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
              <p className="text-gray-600">
                Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>

            {/* Actions */}
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ir al inicio de sesión
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Nueva contraseña</h2>
            <p className="text-gray-600">
              Ingresa tu nueva contraseña para restablecer tu cuenta
            </p>
          </div>

          {/* Reset Password Form */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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
                      Actualizando contraseña...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Actualizar contraseña
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

export default ResetPassword 