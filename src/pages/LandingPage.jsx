

import { useState } from "react"
import {
  BarChart3,
  FileText,
  Brain,
  Mail,
  MessageSquare,
  Smartphone,
  Zap,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const { isAuthenticated, user } = useAuth();
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Email submitted:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
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
              <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">
                Funcionalidades
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Beneficios
              </a>
              <a href="#testimonios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Testimonios
              </a>
              <a href="#precios" className="text-gray-600 hover:text-blue-600 transition-colors">
                Precios
              </a>
              {isAuthenticated ? (
                <a
                  href={user?.tipo === "admin" ? "/dashboard/roles" : "/dashboard-suscriptor/plantillas"}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ir al dashboard
                </a>
              ) : (
                <>
                  <a href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                    Iniciar sesión
                  </a>
                  <a
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Registrarse
                  </a>
                </>
              )}
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
                <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600">
                  Funcionalidades
                </a>
                <a href="#beneficios" className="text-gray-600 hover:text-blue-600">
                  Beneficios
                </a>
                <a href="#testimonios" className="text-gray-600 hover:text-blue-600">
                  Testimonios
                </a>
                <a href="#precios" className="text-gray-600 hover:text-blue-600">
                  Precios
                </a>
                {isAuthenticated ? (
                  <a
                    href={user?.tipo === "admin" ? "/dashboard/roles" : "/dashboard-suscriptor/plantillas"}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Ir al dashboard
                  </a>
                ) : (
                  <>
                    <a href="/login" className="text-gray-600 hover:text-blue-600">
                      Iniciar sesión
                    </a>
                    <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                      Registrarse
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-1" />
                Automatización Inteligente
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Transforma tus
                <span className="text-blue-600"> datos </span>
                en decisiones
                <span className="text-purple-600"> inteligentes</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Unifica la recolección multicanal de datos y el procesamiento de documentos con IA y OCR, optimizando
                decisiones estratégicas para tu organización.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  Comenzar gratis ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="#funcionalidades"
                  className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center"
                >
                  Ver funcionalidades
                </a>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Sin configuración compleja
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Soporte 24/7
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Dashboard en Tiempo Real</h3>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-100 h-4 rounded w-full"></div>
                    <div className="bg-purple-100 h-4 rounded w-3/4"></div>
                    <div className="bg-green-100 h-4 rounded w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">+127%</div>
                      <div className="text-sm text-gray-600">Eficiencia</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">50K+</div>
                      <div className="text-sm text-gray-600">Respuestas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Funcionalidades Poderosas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para automatizar la recolección y procesamiento de datos en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Encuestas Multicanal</h3>
              <p className="text-gray-600 mb-4">
                Distribuye encuestas por correo, WhatsApp, web o apps móviles. Datos centralizados en tiempo real.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Integración WhatsApp Business
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Campañas de email automatizadas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Apps móviles nativas
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Procesamiento de Documentos</h3>
              <p className="text-gray-600 mb-4">
                Digitaliza, extrae y organiza información desde imágenes o PDF escaneados usando OCR avanzado.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  OCR con 99.5% precisión
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Procesamiento por lotes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Múltiples formatos
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Modelos de IA</h3>
              <p className="text-gray-600 mb-4">
                Clasificación automática, análisis semántico y generación de reportes usando aprendizaje automático.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Análisis de sentimientos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Clasificación automática
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Reportes inteligentes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Acelera tus decisiones con datos precisos</h2>
              <p className="text-xl text-gray-600 mb-8">
                Reduce el tiempo de procesamiento de datos de semanas a minutos con nuestra plataforma de automatización
                inteligente.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Automatización Completa</h3>
                    <p className="text-gray-600">
                      Elimina tareas manuales repetitivas y enfócate en el análisis estratégico.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Seguridad Empresarial</h3>
                    <p className="text-gray-600">
                      Cumplimiento GDPR y encriptación de extremo a extremo para proteger tus datos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Escalabilidad Ilimitada</h3>
                    <p className="text-gray-600">Crece sin límites, desde startups hasta empresas Fortune 500.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Dashboard Analytics"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Procesando en tiempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-xl text-gray-600">Más de 500 empresas confían en nuestra plataforma</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Hemos reducido el tiempo de procesamiento de encuestas de 2 semanas a 2 horas. La automatización es
                increíble."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="María González"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-semibold">María González</div>
                  <div className="text-sm text-gray-500">Directora de Operaciones, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "La precisión del OCR es impresionante. Procesamos miles de documentos sin errores."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Carlos Ruiz"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-semibold">Carlos Ruiz</div>
                  <div className="text-sm text-gray-500">CTO, DataFlow Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "El ROI fue evidente desde el primer mes. Altamente recomendado para cualquier empresa."
              </p>
              <div className="flex items-center">
                <img
                  src="/placeholder.svg?height=40&width=40"
                  alt="Ana Martínez"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-semibold">Ana Martínez</div>
                  <div className="text-sm text-gray-500">CEO, InnovateLab</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Planes que se adaptan a tu negocio</h2>
            <p className="text-xl text-gray-600">Comienza gratis y escala según tus necesidades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">Gratis</div>
              <p className="text-gray-600 mb-6">Perfecto para equipos pequeños</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Hasta 100 respuestas/mes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />3 canales de distribución
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Reportes básicos
                </li>
              </ul>
              <a
                href="/register"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold transition-colors block text-center"
              >
                Comenzar gratis
              </a>
            </div>

            <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg transform scale-105">
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                Más Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">€99/mes</div>
              <p className="text-blue-100 mb-6">Para empresas en crecimiento</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Respuestas ilimitadas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Todos los canales
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  IA y OCR avanzado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  Soporte prioritario
                </li>
              </ul>
              <a
                href="/register"
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors block text-center"
              >
                Comenzar prueba gratuita
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">Personalizado</div>
              <p className="text-gray-600 mb-6">Para grandes organizaciones</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Volumen ilimitado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Integraciones personalizadas
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Soporte dedicado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  SLA garantizado
                </li>
              </ul>
              <a
                href="#contacto"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
              >
                Contactar ventas
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            ¿Listo para transformar tus decisiones con datos reales?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a más de 500 empresas que ya están automatizando sus procesos de datos. Comienza tu prueba gratuita
            hoy mismo.
          </p>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Comenzar
              </button>
            </div>
          </form>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Comenzar prueba gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <a
              href="#contacto"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Solicitar demo personalizada
            </a>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Hablemos de tu proyecto</h2>
            <p className="text-xl text-gray-600">
              Nuestro equipo de expertos está listo para ayudarte a implementar la solución perfecta
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">Información de contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span>contacto@surveysaas.com</span>
                </div>
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-blue-600 mr-3" />
                  <span>+34 900 123 456</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                  <span>WhatsApp: +34 600 123 456</span>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold mb-4">Horarios de atención</h4>
                <div className="text-gray-600 space-y-1">
                  <div>Lunes - Viernes: 9:00 - 18:00</div>
                  <div>Sábados: 10:00 - 14:00</div>
                  <div>Soporte técnico 24/7</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email empresarial</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cuéntanos sobre tu proyecto..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">SurveySaaS</span>
              </div>
              <p className="text-gray-400 mb-4">
                Automatización inteligente de encuestas y documentos para empresas modernas.
              </p>
              <div className="flex space-x-4">
                <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Integraciones
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Sobre nosotros
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Carreras
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Prensa
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Centro de ayuda
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Estado del servicio
                  </a>
                </li>
                <li>
                  <a href="https://example.com" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SurveySaaS. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://example.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
              <a href="https://example.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </a>
              <a href="https://example.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage
