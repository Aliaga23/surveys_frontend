"use client"

import { useState, useEffect } from "react"

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
    verificarToken()
  }, [token])

  useEffect(() => {
    if (encuestaData) {
      setShowProgress(encuestaData.plantilla.preguntas.length > 5)
    }
  }, [encuestaData])

  const verificarToken = async () => {
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
  }

  const handleRespuestaChange = (preguntaId, valor) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor,
    }))

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
        return "Campo obligatorio"
      }
    }

    if (pregunta.tipo_pregunta_id === 2 && valor !== "") {
      const num = Number.parseFloat(valor)
      if (isNaN(num)) {
        return "Formato numérico inválido"
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
        throw new Error(errorData.detail || "Error al procesar la solicitud")
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

    const inputClasses = `w-full p-3 border border-gray-400 bg-white transition-colors duration-150 outline-none ${
      hasError ? "border-red-500 bg-red-50" : "focus:border-gray-600 hover:border-gray-500"
    }`

    switch (pregunta.tipo_pregunta_id) {
      case 1: // Texto libre
        return (
          <div className="space-y-2">
            <textarea
              value={valor || ""}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="Ingrese su respuesta"
              className={`${inputClasses} min-h-[100px] resize-vertical`}
              rows={4}
            />
            {hasError && <p className="text-red-600 text-sm">{hasError}</p>}
          </div>
        )

      case 2: // Número
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={valor || ""}
              onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
              placeholder="0"
              step="0.01"
              className={inputClasses}
            />
            {hasError && <p className="text-red-600 text-sm">{hasError}</p>}
          </div>
        )

      case 3: // Selección única
        return (
          <div className="space-y-2">
            {pregunta.opciones.map((opcion) => (
              <label
                key={opcion.id}
                className={`flex items-center space-x-3 cursor-pointer p-3 border transition-colors duration-150 ${
                  valor === opcion.id
                    ? "border-gray-600 bg-gray-50"
                    : hasError
                      ? "border-red-300"
                      : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name={`pregunta-${pregunta.id}`}
                  value={opcion.id}
                  checked={valor === opcion.id}
                  onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                  className="w-4 h-4 text-gray-600 border-gray-400 focus:ring-gray-500"
                />
                <span className="flex-1 text-gray-800">
                  {opcion.texto}
                  {opcion.valor && <span className="text-gray-500 ml-2">({opcion.valor})</span>}
                </span>
              </label>
            ))}
            {hasError && <p className="text-red-600 text-sm">{hasError}</p>}
          </div>
        )

      case 4: // Selección múltiple
        return (
          <div className="space-y-2">
            {pregunta.opciones.map((opcion) => (
              <label
                key={opcion.id}
                className={`flex items-center space-x-3 cursor-pointer p-3 border transition-colors duration-150 ${
                  (valor || []).includes(opcion.id)
                    ? "border-gray-600 bg-gray-50"
                    : hasError
                      ? "border-red-300"
                      : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={(valor || []).includes(opcion.id)}
                  onChange={(e) => handleMultipleChange(pregunta.id, opcion.id, e.target.checked)}
                  className="w-4 h-4 text-gray-600 border-gray-400 focus:ring-gray-500"
                />
                <span className="flex-1 text-gray-800">
                  {opcion.texto}
                  {opcion.valor && <span className="text-gray-500 ml-2">({opcion.valor})</span>}
                </span>
              </label>
            ))}
            {hasError && <p className="text-red-600 text-sm">{hasError}</p>}
          </div>
        )

      default:
        return <div className="text-red-600 p-3 bg-red-50 border border-red-300">Tipo de pregunta no compatible</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (error && !encuestaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white border border-gray-300 p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de acceso</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 transition-colors duration-150"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white border border-gray-300 p-8 w-full max-w-md text-center">
          <div className="w-12 h-12 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Formulario completado</h2>
          <p className="text-gray-600 mb-6">Sus respuestas han sido registradas correctamente.</p>
          <div className="bg-gray-50 p-4 border border-gray-200">
            <p className="text-sm text-gray-700">Puede cerrar esta ventana.</p>
          </div>
        </div>
      </div>
    )
  }

  const progress = showProgress ? getProgress() : 0

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-b border-gray-300">
          {/* Header ultra minimalista */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">{encuestaData.plantilla.nombre}</h1>
              {encuestaData.plantilla.descripcion && (
                <p className="text-gray-600">{encuestaData.plantilla.descripcion}</p>
              )}
            </div>

            <div className="border border-gray-200 p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Campaña:</strong> {encuestaData.campana.nombre}
                </div>
                <div>
                  <strong>Destinatario:</strong> {encuestaData.destinatario.nombre}
                </div>
              </div>
            </div>

            {/* Barra de progreso minimalista */}
            {showProgress && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progreso del formulario</span>
                  <span className="text-sm font-medium text-gray-900">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-1">
                  <div className="bg-gray-800 h-1 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-8 border-l-4 border-red-500 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error de validación</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {encuestaData.plantilla.preguntas.map((pregunta, index) => (
              <div key={pregunta.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-900 mb-2">
                    {index + 1}. {pregunta.texto}
                    {pregunta.obligatorio && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {pregunta.obligatorio && <p className="text-sm text-gray-500">Campo obligatorio</p>}
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
              className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-medium py-3 px-6 transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Procesando...
                </>
              ) : (
                "Enviar formulario"
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Al enviar este formulario, confirma que la información proporcionada es correcta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
