// src/components/dashboard-operador/layout.jsx
import { useState, useEffect, useRef } from "react"
import {
  FileText,
  Users,
  LogOut,
  Search,
  User,
  PhoneCall,
  MessageCircle,
  X,
  Send,
  Bot,
} from "lucide-react"
import { getCurrentUser } from "../../services/auth"
import { useAuth } from "../../context/AuthContext"

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

const DashboardOperadorLayout = ({ children, activeSection = "plantillas" }) => {
  /* ──────────────────────── Auth & user ─────────────────────── */
  const { logout } = useAuth()
  const [user, setUser] = useState({
    name: "Usuario Operador",
    email: "operador@empresa.com",
    avatar: "/placeholder.svg?height=32&width=32",
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser((prev) => ({
          ...prev,
          name: userData?.nombre_completo ?? prev.name,
          email: userData?.email ?? prev.email,
        }))
      } catch (err) {
        console.error("Error loading user:", err)
      }
    }
    loadUser()
  }, [])

  /* ─────────────────────── Sidebar state ────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)
  const handleLogout = () => logout()

  /* ─────────────────────── Chatbot state ─────────────────────── */
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

  /** Envía el mensaje del usuario y genera la respuesta */
  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: getBotResponse(text),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 1200)
  }

  /** Respuestas simuladas. Sustitúyelo por tu propia lógica/API */
  const getBotResponse = (msg) => {
    const m = msg.toLowerCase()
    if (/plantilla|template/.test(m))
      return "Para gestionar una plantilla, navega a la sección de 'Plantillas' donde puedes ver y editar las plantillas asignadas."
    if (/destinatario|contacto/.test(m))
      return "Puedes gestionar los destinatarios en la sección 'Destinatarios', viendo los contactos asignados para las encuestas."
    if (/entrega|envío/.test(m))
      return "Revisa el estado de las entregas en la sección 'Entregas'."
    if (/ayuda|help/.test(m))
      return "Puedo orientarte sobre plantillas, destinatarios, o entregas. ¿Qué deseas hacer?"
    return "Entiendo tu consulta, ¿podrías darme más detalles?"
  }

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  /* ─────────────────────── Menú lateral ─────────────────────── */
  const menu = [
    {
      title: "Gestión de Encuestas",
      items: [
        { title: "Plantillas", url: "/dashboard-operador/plantillas", icon: FileText },
        { title: "Destinatarios", url: "/dashboard-operador/destinatarios", icon: Users },
        { title: "Entregas", url: "/dashboard-operador/entregas", icon: PhoneCall },
      ],
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ──────────────── Sidebar ──────────────── */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}>
        <SidebarHeader className="h-16 flex items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 grid place-items-center bg-blue-600 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Operador</h2>
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
                      isActive={activeSection === title.toLowerCase()}
                      onClick={closeSidebar}
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
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* ──────────────── Main ──────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} className="md:hidden" />

          {/* Search */}
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Buscar plantillas, destinatarios..."
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* User */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                <div className="w-8 h-8 grid place-items-center rounded-full bg-blue-600">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>

        {/* ──────────────── Chatbot ──────────────── */}
        <div className="fixed bottom-4 right-4 z-50">
          {/* FAB */}
          {!chatbotOpen && (
            <button
              onClick={() => setChatbotOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform duration-300 hover:scale-110"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}

          {/* Window */}
          {chatbotOpen && (
            <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
              {/* Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">Asistente Virtual</span>
                </div>
                <button onClick={() => setChatbotOpen(false)} className="hover:text-gray-200">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
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

export default DashboardOperadorLayout
