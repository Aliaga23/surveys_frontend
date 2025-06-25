"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Sector,
} from "recharts"
import DashboardSuscriptorLayout from "./layout"

const Dashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedCampaignForAnalysis, setSelectedCampaignForAnalysis] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  // Función para obtener datos del API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token") // Asumiendo que el token se guarda en localStorage

      const response = await fetch("https://surveysbackend-production.up.railway.app/analytics/dashboard", {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener datos del dashboard")
      }

      const data = await response.json()
      setDashboardData(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignAnalysis = async (campaignId) => {
    try {
      setLoadingAnalysis(true)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `https://surveysbackend-production.up.railway.app/dashboard/campaigns/${campaignId}/analysis`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Error al cargar análisis")
      }

      const data = await response.json()
      setAnalysisData(data.analysis)
    } catch (err) {
      setError("Error al cargar análisis: " + err.message)
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const openAnalysisModal = (campaign) => {
    setSelectedCampaignForAnalysis(campaign)
    setShowAnalysisModal(true)
    fetchCampaignAnalysis(campaign.id)
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Transformar datos para Recharts
  const campanasData = useMemo(() => {
    if (!dashboardData || !dashboardData.campanas.por_estado) return []

    return Object.entries(dashboardData.campanas.por_estado).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      percentage: ((value / dashboardData.campanas.total) * 100).toFixed(1),
    }))
  }, [dashboardData])

  const entregasCanalData = useMemo(() => {
    if (!dashboardData || !dashboardData.entregas.por_canal) return []

    return Object.entries(dashboardData.entregas.por_canal).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      entregas: value,
      percentage: ((value / dashboardData.entregas.total) * 100).toFixed(1),
    }))
  }, [dashboardData])

  const entregasEstadoData = useMemo(() => {
    if (!dashboardData || !dashboardData.entregas.por_estado) return []

    return Object.entries(dashboardData.entregas.por_estado).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      cantidad: value,
      percentage: ((value / dashboardData.entregas.total) * 100).toFixed(1),
    }))
  }, [dashboardData])

  const preguntasData = useMemo(() => {
    if (!dashboardData || !dashboardData.preguntas.por_tipo) return []

    const totalPreguntas = Object.values(dashboardData.preguntas.por_tipo).reduce((a, b) => a + b, 0)
    return Object.entries(dashboardData.preguntas.por_tipo).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
      percentage: ((value / totalPreguntas) * 100).toFixed(1),
    }))
  }, [dashboardData])

  // Datos para gráfica combinada de campañas exitosas
  const campanasExitosasData = useMemo(() => {
    if (!dashboardData || !dashboardData.campanas.top_exitosas) return []

    return dashboardData.campanas.top_exitosas.map((campana, index) => ({
      nombre: campana.nombre.length > 15 ? campana.nombre.substring(0, 15) + "..." : campana.nombre,
      entregas: campana.total_entregas,
      respuestas: campana.total_respondidas,
      tasa: campana.tasa_respuesta,
      ranking: index + 1,
    }))
  }, [dashboardData])

  // Colores para las gráficas
  const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"]

  // Hook optimizado para animar números una sola vez
  const useCountUp = (end, duration = 2000, delay = 0) => {
    const [count, setCount] = useState(0)
    const [isComplete, setIsComplete] = useState(false)
    const hasStartedRef = useRef(false)

    const startAnimation = useCallback(() => {
      if (hasStartedRef.current || isComplete) return

      hasStartedRef.current = true
      const timer = setTimeout(() => {
        let startTime = null
        const animate = (currentTime) => {
          if (startTime === null) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / duration, 1)
          const easeOutQuart = 1 - Math.pow(1 - progress, 4)
          const newCount = Math.floor(easeOutQuart * end)
          setCount(newCount)

          if (progress >= 1) {
            setCount(end)
            setIsComplete(true)
          } else {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      }, delay)

      return () => clearTimeout(timer)
    }, [end, duration, delay, isComplete])

    return [count, startAnimation, isComplete]
  }

  // Componente para tarjeta métrica
  const MetricCard = ({ title, value, subtitle, delay = 0, color = "blue" }) => {
    const [count, startAnimation, isComplete] = useCountUp(value, 2000, delay)
    const [isVisible, setIsVisible] = useState(false)
    const cardRef = useRef()

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
            startAnimation()
          }
        },
        { threshold: 0.1 },
      )

      if (cardRef.current) {
        observer.observe(cardRef.current)
      }

      return () => observer.disconnect()
    }, [startAnimation, isVisible])

    const colorClasses = {
      blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100",
      green: "border-green-200 bg-gradient-to-br from-green-50 to-green-100",
      yellow: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100",
      purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100",
    }

    return (
      <div
        ref={cardRef}
        className={`
          bg-white rounded-xl shadow-lg border-2 p-6 hover:shadow-xl transition-all duration-300
          transform transition-all duration-700 ease-out
          ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
          ${colorClasses[color]}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold text-gray-900">{isComplete ? value : count}</p>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Tooltip personalizado mejorado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-700">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.value}
                {entry.payload?.percentage && ` (${entry.payload.percentage}%)`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Tooltip para gráfica de pie
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-700">
            Cantidad: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-700">
            Porcentaje: <span className="font-semibold">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Componente para barra de progreso
  const ProgressBar = ({ value, className = "", color = "blue" }) => {
    const [animatedValue, setAnimatedValue] = useState(0)
    const hasAnimatedRef = useRef(false)

    useEffect(() => {
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true
        const timer = setTimeout(() => setAnimatedValue(value), 1000)
        return () => clearTimeout(timer)
      }
    }, [value])

    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    }

    return (
      <div className={`w-full bg-gray-200 rounded-full h-3 ${className}`}>
        <div
          className={`h-3 rounded-full transition-all duration-2000 ease-out ${colorClasses[color]}`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    )
  }

  // Función para renderizar el sector activo en PieChart
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? "start" : "end"

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-sm">
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    )
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Mostrar loading
  if (loading) {
    return (
      <DashboardSuscriptorLayout activeSection="dashboard">
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del dashboard...</p>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  // Mostrar error
  if (error) {
    return (
      <DashboardSuscriptorLayout activeSection="dashboard">
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardSuscriptorLayout>
    )
  }

  // No mostrar nada si no hay datos
  if (!dashboardData) return null

  const { resumen_general, campanas } = dashboardData

  return (
    <DashboardSuscriptorLayout activeSection="dashboard">
      <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div
          className={`
          flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transform transition-all duration-1000
          ${isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
        `}
        >
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard Analítico
            </h1>
            <p className="text-gray-600 mt-2">Resumen completo de tu actividad de encuestas</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              Tasa global: {resumen_general.tasa_respuesta_global}%
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              {resumen_general.total_destinatarios} destinatarios
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Plantillas"
            value={resumen_general.total_plantillas}
            subtitle={`${resumen_general.plantillas_activas} activas`}
            delay={0}
            color="blue"
          />
          <MetricCard
            title="Total Campañas"
            value={resumen_general.total_campanas}
            subtitle={`${Object.values(campanas.por_estado).reduce((a, b) => a + b, 0)} en total`}
            delay={200}
            color="green"
          />
          <MetricCard
            title="Total Entregas"
            value={resumen_general.total_entregas}
            subtitle={`${resumen_general.total_respuestas} respondidas`}
            delay={400}
            color="yellow"
          />
          <MetricCard
            title="Total Destinatarios"
            value={resumen_general.total_destinatarios}
            subtitle={`${resumen_general.destinatarios_completos} completos`}
            delay={600}
            color="purple"
          />
        </div>

        {/* Gráficas principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CustomActiveShapePieChart - Campañas por Estado */}
          {campanasData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-xl text-gray-800 text-center mb-6">Distribución de Campañas</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={campanasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {campanasData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-1 gap-4">
                {campanasData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{entry.name}</p>
                      <p className="text-sm text-gray-600">
                        {entry.value} campañas ({entry.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entregas por Canal */}
          {entregasCanalData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-xl text-gray-800 mb-6">Entregas por Canal</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={entregasCanalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="entregas" radius={[8, 8, 0, 0]} animationDuration={1500}>
                    {entregasCanalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Más gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfica de barras - Estado de Entregas */}
          {entregasEstadoData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-xl text-gray-800 mb-6">Estado de Entregas</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={entregasEstadoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} animationDuration={1500}>
                    {entregasEstadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfica circular - Tipos de Preguntas */}
          {preguntasData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <h4 className="font-bold text-xl text-gray-800 text-center mb-6">Tipos de Preguntas</h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={preguntasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {preguntasData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: entry.color, fontWeight: "bold" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Campañas más exitosas */}
        {campanasExitosasData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ranking de Campañas</h3>
              <p className="text-gray-600">
                Análisis de rendimiento por campaña - Haz clic para ver análisis detallado
              </p>
            </div>

            {/* Gráfica de barras para campañas */}
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campanasExitosasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="entregas" fill="#3b82f6" name="Entregas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="respuestas" fill="#10b981" name="Respuestas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista detallada */}
            <div className="space-y-4">
              {campanas.top_exitosas.map((campana, index) => (
                <div
                  key={campana.id}
                  className={`
                    flex items-center justify-between p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer
                    ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }
                  `}
                  onClick={() => openAnalysisModal(campana)}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl transition-transform duration-300 hover:scale-110
                      ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                          : "bg-blue-100 text-blue-600"
                      }
                    `}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{campana.nombre}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{campana.total_entregas} entregas</span>
                        <span>{campana.total_respondidas} respuestas</span>
                        <span>
                          Efectividad:{" "}
                          {campana.total_entregas > 0
                            ? ((campana.total_respondidas / campana.total_entregas) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{campana.tasa_respuesta}%</div>
                    <p className="text-sm text-gray-500">Tasa de respuesta</p>
                    <div className="mt-2 w-24">
                      <ProgressBar value={campana.tasa_respuesta} color="green" />
                    </div>
                    <div className="mt-2 text-xs text-blue-600 font-medium">Ver análisis →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay datos suficientes */}
        {campanasData.length === 0 &&
          entregasCanalData.length === 0 &&
          entregasEstadoData.length === 0 &&
          preguntasData.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay datos suficientes</h3>
              <p className="text-gray-600">
                Cuando tengas más actividad en tus campañas y encuestas, aquí verás gráficas detalladas de tu
                rendimiento.
              </p>
            </div>
          )}

        {/* Modal de Análisis */}
        {showAnalysisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      Análisis de Campaña
                    </h3>
                    <p className="text-blue-600 font-medium mt-1">{selectedCampaignForAnalysis?.nombre}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAnalysisModal(false)
                      setSelectedCampaignForAnalysis(null)
                      setAnalysisData(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                {loadingAnalysis ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-600">Cargando análisis...</p>
                    </div>
                  </div>
                ) : analysisData ? (
                  <div className="space-y-6">
                    {/* Resumen Ejecutivo */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        Resumen Ejecutivo
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{analysisData.executive_summary.texto}</p>
                    </div>

                    {/* Temas Clave */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                        Temas Clave Identificados
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysisData.temas_clave.map((tema, index) => (
                          <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{tema.tema}</h5>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  tema.categoria === "fortaleza"
                                    ? "bg-green-100 text-green-700"
                                    : tema.categoria === "debilidad"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {tema.categoria}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {tema.evidencia.map((evidencia, idx) => (
                                <p key={idx} className="text-sm text-gray-600">
                                  • {evidencia}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acciones Prioritarias */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        Acciones Prioritarias
                      </h4>
                      <div className="space-y-4">
                        {analysisData.acciones_prioritarias.map((accion, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">{accion.accion}</p>
                              <div className="flex gap-2">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    accion.impacto === "alto"
                                      ? "bg-red-100 text-red-700"
                                      : accion.impacto === "medio"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  Impacto: {accion.impacto}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    accion.dificultad === "alta"
                                      ? "bg-red-100 text-red-700"
                                      : accion.dificultad === "media"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  Dificultad: {accion.dificultad}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback por Pregunta */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        Análisis por Pregunta
                      </h4>
                      <div className="space-y-4">
                        {analysisData.questions.map((question, index) => (
                          <div key={question.question_id} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-3">Pregunta {index + 1}</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {question.feedback.fortalezas.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-green-700 mb-2">Fortalezas</h6>
                                  {question.feedback.fortalezas.map((fortaleza, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 mb-1">
                                      • {fortaleza}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {question.feedback.debilidades.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-red-700 mb-2">Debilidades</h6>
                                  {question.feedback.debilidades.map((debilidad, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 mb-1">
                                      • {debilidad}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {question.feedback.recomendaciones.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-blue-700 mb-2">Recomendaciones</h6>
                                  {question.feedback.recomendaciones.map((recomendacion, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 mb-1">
                                      • {recomendacion}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No se pudo cargar el análisis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardSuscriptorLayout>
  )
}

export default Dashboard
