"use client"

import { useState, useEffect } from "react"
import { BarChart3, FileText, Target, MessageSquare, Users, Settings, LogOut, Bell, Search } from "lucide-react"
import { logout, getCurrentUser } from "../../services/auth"
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
import { Link } from "react-router-dom"
const DashboardSuscriptorLayout = ({ children, activeSection = "dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState({
    name: "Usuario Suscriptor",
    email: "usuario@empresa.com",
    avatar: "/placeholder.svg?height=32&width=32",
    plan: "Professional",
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser({
          name: userData.nombre || "Usuario Suscriptor",
          email: userData.email || "usuario@empresa.com",
          avatar: "/placeholder.svg?height=32&width=32",
          plan: "Professional",
        })
      } catch (error) {
        console.error("Error loading user:", error)
      }
    }
    loadUser()
  }, [])

  const menuItems = [
    {
      title: "Panel Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard-suscriptor",
          icon: BarChart3,
          isActive: activeSection === "dashboard",
        },
      ],
    },
    {
      title: "Gestión de Encuestas",
      items: [
        {
          title: "Plantillas",
          url: "/dashboard-suscriptor/plantillas",
          icon: FileText,
          isActive: activeSection === "plantillas",
        },
        {
          title: "Destinatarios",
          url: "/dashboard-suscriptor/destinatarios",
          icon: Users,
          isActive: activeSection === "destinatarios",
        },
        {
          title: "Campañas",
          url: "/dashboard-suscriptor/campanas",
          icon: Target,
          isActive: activeSection === "campanas",
        },
        {
          title: "Respuestas",
          url: "/dashboard-suscriptor/respuestas",
          icon: MessageSquare,
          isActive: activeSection === "respuestas",
        },
        {
          title: "Entregas",
          url: "/dashboard-suscriptor/entregas",
          icon: MessageSquare,
          isActive: activeSection === "entregas",
        }
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Configuración",
          url: "/dashboard-suscriptor/configuracion",
          icon: Settings,
          isActive: activeSection === "configuracion",
        },
      ],
    },
  ]

  const closeSidebar = () => setSidebarOpen(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar}>
        <SidebarHeader>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SurveySaaS</h2>
              <p className="text-sm text-gray-500">Panel de Control</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {menuItems.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton href={item.url} isActive={item.isActive} onClick={closeSidebar}>
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <button
            onClick={() => handleLogout()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-2 border-b border-gray-200 bg-white px-4 sm:px-6">
          <SidebarTrigger onClick={() => setSidebarOpen(true)} className="md:hidden" />

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar plantillas, campañas..."
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600">
                <Search className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/dashboard-suscriptor/perfil-suscriptor"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full bg-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

export default DashboardSuscriptorLayout
