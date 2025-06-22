
import { useState, useEffect, useCallback } from "react"

const API_BASE_URL = "https://surveysbackend-production.up.railway.app"

export default function EncuestaPublica({ token }) {
  const [encuestaData, setEncuestaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [respuestas, setRespuestas] = useState({})
  const [validationErrors, setValidationErrors] = useState({})
  const [showProgress, setShowProgress] = useState(false)

  useEffect(() => {
    if (encuestaData) {
      setShowProgress(encuestaData.plantilla.preguntas.length > 3)
    }
  }, [encuestaData])

  const verificarToken = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/encuestas/verificar/${token}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al verificar la encuesta")
      }

      const data = await response.json()
      setEncuestaData(data)

      const respuestasIniciales = {}
      data.plantilla.preguntas.forEach((pregunta) => {
        if (pregunta.tipo_pregunta_id === 4) {
          respuestasIniciales[pregunta.id] = []
        } else {
          respuestasIniciales[pregunta.id] = ""
        }
      })
      setRespuestas(respuestasIniciales)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    verificarToken()
  }, [verificarToken])

  const handleRespuestaChange = (preguntaId, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor,
    }))

    // Limpiar error de validación si existe
    if (validationErrors[preguntaId]) {
      setValidationErrors((prev) => ({
        ...prev,
        [preguntaId]: null,
      }))
    }
  }

  const handleMultipleChange = (preguntaId, opcionId, checked) => {
    setRespuestas((prev) => {
      const currentValues = prev[preguntaId] || []
      let newValues
      if (checked) {
        newValues = [...currentValues, opcionId]
      } else {
        newValues = currentValues.filter((id) => id !== opcionId)
      }
      return {
        ...prev,
        [preguntaId]: newValues,
      }
    })

    // Limpiar error de validación si existe
    if (validationErrors[preguntaId]) {
      setValidationErrors((prev) => ({
        ...prev,
        [preguntaId]: null,
      }))
    }
  }

  const validateQuestion = (pregunta) => {
    const valor = respuestas[pregunta.id]

    if (pregunta.obligatorio) {
      if (valor === "" || valor === null || valor === undefined || (Array.isArray(valor) && valor.length === 0)) {
        return "Esta pregunta es obligatoria"
      }
    }

    // Validaciones específicas por tipo
    if (pregunta.tipo_pregunta_id === 2 && valor !== "") {
      const num = Number.parseFloat(valor)
      if (isNaN(num)) {
        return "Debe ser un número válido"
      }
    }

    return null
  }

  const validateAllQuestions = () => {
    const errors = {}
    let hasErrors = false

    encuestaData.plantilla.preguntas.forEach((pregunta) => {
      const error = validateQuestion(pregunta)
      if (error) {
        errors[pregunta.id] = error
        hasErrors = true
      }
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const getProgress = () => {
    const totalPreguntas = encuestaData.plantilla.preguntas.length
    const preguntasRespondidas = encuestaData.plantilla.preguntas.filter((pregunta) => {
      const valor = respuestas[pregunta.id]
      return valor !== "" && valor !== null && valor !== undefined && !(Array.isArray(valor) && valor.length === 0)
    }).length

    return Math.round((preguntasRespondidas / totalPreguntas) * 100)
  }

  const prepararRespuestas = () => {
    const respuestasArray = []

    encuestaData.plantilla.preguntas.forEach((pregunta) => {
      const valor = respuestas[pregunta.id]

      if (valor === "" || valor === null || valor === undefined || (Array.isArray(valor) && valor.length === 0)) {
        return
      }

      const respuesta = {
        pregunta_id: pregunta.id,
        tipo_respuesta: getTipoRespuesta(pregunta.tipo_pregunta_id),
      }

      switch (pregunta.tipo_pregunta_id) {
        case 1:
          respuesta.texto = valor
          break
        case 2:
          respuesta.numero = Number.parseFloat(valor) || 0
          break
        case 3:
          respuesta.opcion_id = valor
          break
        case 4:
          respuesta.opciones_ids = valor
          break
        default:
          // Opcional: podrías hacer log o manejar el caso
          console.warn(`Tipo de pregunta desconocido: ${pregunta.tipo_pregunta_id}`)
          break
      }
      respuestasArray.push(respuesta)
    })

    return respuestasArray
  }

  const getTipoRespuesta = (tipoPreguntaId) => {
    switch (tipoPreguntaId) {
      case 1:
        return "texto"
      case 2:
        return "numero"
      case 3:
        return "opcion"
      case 4:
        return "opciones"
      default:
        return "texto"
    }
  }

  const enviarRespuestas = async () => {
    try {
      setSubmitting(true)
      setError(null)

      if (!validateAllQuestions()) {
        setSubmitting(false)
        return
      }

      const respuestasArray = prepararRespuestas()

      const response = await fetch(`${API_BASE_URL}/encuestas/responder/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(respuestasArray),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Error al enviar las respuestas")
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderPregunta = (pregunta, index) => {
    const valor = respuestas[pregunta.id]
    const hasError = validationErrors[pregunta.id]

    const inputClasses = `w-full p-4 border-2 rounded-lg transition-all duration-200 outline-none ${
      hasError
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
        : "border-gray-300 bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 hover:border-gray-400"
    }`

    switch (pregunta.tipo_pregunta_id) {
      case 1: // Texto libre
        return (
          <div className="space-y-2">
            <textarea
              value={valor || ""}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className={`${inputClasses} min-h-[120px] resize-none`}
              rows={4}
            />
            {hasError && (
              <p className="text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {hasError}
              </p>
            )}
          </div>
        )

      case 2: // Número
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={valor || ""}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="Ingresa un número"
              step="0.1"
              className={inputClasses}
            />
            {hasError && (
              <p className="text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {hasError}
              </p>
            )}
          </div>
        )

      case 3: // Selección única
        return (
          <div className="space-y-3">
            {pregunta.opciones.map((opcion, opcionIndex) => (
              <label
                key={opcion.id}
                className={`flex items-center space-x-4 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${
                  valor === opcion.id
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : hasError
                      ? "border-red-300 hover:border-red-400"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name={`pregunta-${pregunta.id}`}
                    value={opcion.id}
                    checked={valor === opcion.id}
                    onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                      valor === opcion.id ? "border-blue-600 bg-blue-600" : "border-gray-400"
                    }`}
                  >
                    {valor === opcion.id && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                </div>
                <span className="flex-1 font-medium text-gray-800">
                  {opcion.texto}
                  {opcion.valor && <span className="text-sm text-gray-500 ml-2 font-normal">({opcion.valor})</span>}
                </span>
              </label>
            ))}
            {hasError && (
              <p className="text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {hasError}
              </p>
            )}
          </div>
        )

      case 4: // Selección múltiple
        return (
          <div className="space-y-3">
            {pregunta.opciones.map((opcion, opcionIndex) => (
              <label
                key={opcion.id}
                className={`flex items-center space-x-4 cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${
                  (valor || []).includes(opcion.id)
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : hasError
                      ? "border-red-300 hover:border-red-400"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={(valor || []).includes(opcion.id)}
                    onChange={(e) => handleMultipleChange(pregunta.id, opcion.id, e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                      (valor || []).includes(opcion.id) ? "border-blue-600 bg-blue-600" : "border-gray-400"
                    }`}
                  >
                    {(valor || []).includes(opcion.id) && (
                      <svg
                        className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="flex-1 font-medium text-gray-800">
                  {opcion.texto}
                  {opcion.valor && <span className="text-sm text-gray-500 ml-2 font-normal">({opcion.valor})</span>}
                </span>
              </label>
            ))}
            {hasError && (
              <p className="text-red-600 text-sm flex items-center gap-2 animate-fade-in">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {hasError}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">
            Tipo de pregunta no soportado
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando encuesta</h2>
          <p className="text-gray-600">Preparando el formulario...</p>
        </div>
      </div>
    )
  }

  if (error && !encuestaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md border border-green-200 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Respuestas enviadas</h2>
          <p className="text-gray-600 mb-6">
            Gracias por completar la encuesta. Sus respuestas han sido registradas correctamente.
          </p>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-800">Puede cerrar esta ventana.</p>
          </div>
        </div>
      </div>
    )
  }

  const progress = showProgress ? getProgress() : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header profesional */}
          <div className="bg-slate-800 text-white p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{encuestaData.plantilla.nombre}</h1>
                <p className="text-slate-300 text-sm">Formulario de encuesta</p>
              </div>
            </div>

            {encuestaData.plantilla.descripcion && (
              <p className="text-slate-200 mb-6 text-lg leading-relaxed">{encuestaData.plantilla.descripcion}</p>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    <strong>Campaña:</strong> {encuestaData.campana.nombre}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>
                    <strong>Destinatario:</strong> {encuestaData.destinatario.nombre}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            {showProgress && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progreso</span>
                  <span className="text-sm font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6">
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-red-800 font-semibold">Error de validación</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {encuestaData.plantilla.preguntas.map((pregunta, index) => (
                <div key={pregunta.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                        {pregunta.texto}
                        {pregunta.obligatorio && <span className="text-red-500 ml-2">*</span>}
                      </h3>
                      {pregunta.obligatorio && <p className="text-sm text-gray-500 mt-1">Campo requerido</p>}
                    </div>
                  </div>
                  {renderPregunta(pregunta, index)}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-8 mt-8 border-t border-gray-200">
              <button
                onClick={enviarRespuestas}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Enviando respuestas...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Enviar respuestas
                  </>
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Sus respuestas serán procesadas de forma segura y confidencial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
