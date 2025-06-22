import { BarChart3, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const EmailSentPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate("/")
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex flex-col">
      {/* NAVIGATION */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">SurveySaaS</span>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Verifica tu correo!</h2>
          <p className="text-gray-600 mb-6">
            Te enviamos un correo de verificación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailSentPage
