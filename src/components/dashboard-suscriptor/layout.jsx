
import { useState, useEffect, useRef } from "react"
import {
  BarChart3,
  FileText,
  Target,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Search,
  User,
  UserCog,
  PhoneCall,
  MessageCircle,
  X,
  Send,
  Bot,
} from "lucide-react"
import { useLocation } from "react-router-dom"
import { getCurrentUser } from "../../services/auth"
import { useAuth } from "../../context/AuthContext"
import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "../sidebar"

/* ───────── Utilidades ───────── */
const getToken = () => localStorage.getItem("token")

const askBot = async (message, section) => {
  const res = await fetch("https://surveysbackend-production.up.railway.app/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    },
    body: JSON.stringify({
      message,
      context: {
        route: window.location.pathname,
        section,
      },
    }),
  })

  if (!res.ok) {
    const { detail } = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail || "Error inesperado en el chatbot")
  }
  return res.json() // { answer, action_log }
}

/* ──────────────────────────────── Componente ─────────────────────────────── */
const DashboardSuscriptorLayout = ({ children }) => {
  /* Localización para contexto y resaltado de menú */
  const location = useLocation()
  const currentSection = location.pathname.split("/")[2] || "dashboard"

  /* Auth & usuario */
  const { logout } = useAuth()
  const [user, setUser] = useState({
    name: "Usuario Suscriptor",
    email: "usuario@empresa.com",
    avatar: "/placeholder.svg?height=32&width=32",
    plan: "Professional",
  })

  useEffect(() => {
    ;(async () => {
      try {
        const u = await getCurrentUser()
        setUser((prev) => ({
          ...prev,
          name: u?.nombre ?? prev.name,
          email: u?.email ?? prev.email,
        }))
      } catch (err) {
        console.error("Error loading user:", err)
      }
    })()
  }, [])

  /* Sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /* Chatbot */
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const bottomRef = useRef(null)

  /* Enviar mensaje */
  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text, timestamp: new Date() },
    ])
    setInput("")
    setIsTyping(true)

    try {
      const { answer } = await askBot(text, currentSection)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: answer, timestamp: new Date() },
      ])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "❌ Hubo un problema al conectar con el asistente.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  /* Auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  /* Menú lateral */
  const menu = [
    {
      title: "Panel Principal",
      items: [{ title: "Dashboard", url: "/dashboard-suscriptor/dashboard", icon: BarChart3 }],
    },
    {
      title: "Gestión de Encuestas",
      items: [
        { title: "Plantillas", url: "/dashboard-suscriptor/plantillas", icon: FileText },
        { title: "Destinatarios", url: "/dashboard-suscriptor/destinatarios", icon: Users },
        { title: "Operadores", url: "/dashboard-suscriptor/operadores", icon: UserCog },
        { title: "Campañas", url: "/dashboard-suscriptor/campanas", icon: Target },
        { title: "Respuestas", url: "/dashboard-suscriptor/respuestas", icon: MessageSquare },
        { title: "Entregas", url: "/dashboard-suscriptor/entregas", icon: PhoneCall },
      ],
    },
    {
      title: "Sistema",
      items: [{ title: "Configuración", url: "/dashboard-suscriptor/configuracion", icon: Settings }],
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ───────── Sidebar ───────── */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarHeader className="h-16 flex items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 grid place-items-center bg-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SurveySaaS</h2>
              <p className="text-sm text-gray-500">Panel de Control</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {menu.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map(({ title, url, icon: Icon }) => (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton
                      href={url}
                      isActive={location.pathname.startsWith(url)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* ───────── Main ───────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} className="md:hidden" />

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Buscar plantillas, campañas..."
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
            </div>

                <Link
                to="/dashboard-suscriptor/perfil-suscriptor"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                {/* Avatar sustituido por icono */}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600">
                  <User className="w-4 h-4 text-white" />
                </div>

                {/* Nombre (solo en pantallas ≥ sm) */}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </Link>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>

        {/* ───────── Chatbot ───────── */}
        <div className="fixed bottom-4 right-4 z-50">
          {!chatbotOpen && (
            <button
              onClick={() => setChatbotOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}

          {chatbotOpen && (
            <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
              {/* Header chat */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">Asistente Virtual</span>
                </div>
                <button onClick={() => setChatbotOpen(false)} className="hover:text-gray-200">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(({ id, sender, text }) => (
                  <div key={id} className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg text-sm leading-snug ${
                        sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-bl-none rounded-lg">
                      <div className="flex gap-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce [animation-delay:.1s]">•</span>
                        <span className="animate-bounce [animation-delay:.2s]">•</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardSuscriptorLayout
