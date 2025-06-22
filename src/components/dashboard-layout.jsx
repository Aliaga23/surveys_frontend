
import { useState, useEffect } from "react"
import {
  BarChart3,
  Users,
  Radio,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  MessageSquare,
  Target,
  Truck,
  CreditCard,
  DollarSign,
  Crown,
} from "lucide-react"
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
} from "./sidebar"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../services/auth"
const DashboardLayout = ({ children, activeSection = "roles" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState({
    name: "Usuario Administrador",
    email: "admin@surveysaas.com",
    avatar: "/placeholder.svg?height=32&width=32",
    plan: "Administrador",
  })

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser({
          name: userData.nombre || "Usuario Administrador",
          email: userData.email || "usuario@empresa.com",
          avatar: "/placeholder.svg?height=32&width=32",
          plan: "Administrador",
        })
      } catch (error) {
        console.error("Error loading user:", error)
      }
    }
    loadUser()
  }, [])

  const menuItems = [
    {
      title: "Gestión de Usuarios",
      items: [
        {
          title: "Roles",
          url: "/dashboard/roles",
          icon: Users,
          isActive: activeSection === "roles",
        },
      ],
    },
    {
      title: "Configuración de Encuestas",
      items: [
        {
          title: "Tipos de Pregunta",
          url: "/dashboard/tipos-pregunta",
          icon: MessageSquare,
          isActive: activeSection === "tipos-pregunta",
        },
        {
          title: "Canales",
          url: "/dashboard/canales",
          icon: Radio,
          isActive: activeSection === "canales",
        },
      ],
    },
    {
      title: "Estados del Sistema",
      items: [
        {
          title: "Estados Campaña",
          url: "/dashboard/estados-campana",
          icon: Target,
          isActive: activeSection === "estados-campana",
        },
        {
          title: "Estados Entrega",
          url: "/dashboard/estados-entrega",
          icon: Truck,
          isActive: activeSection === "estados-entrega",
        },
        {
          title: "Estados Documento",
          url: "/dashboard/estado-documento",
          icon: FileText,
          isActive: activeSection === "estado-documento",
        },
        {
          title: "Estados Pago",
          url: "/dashboard/estados-pago",
          icon: CreditCard,
          isActive: activeSection === "estados-pago",
        },
      ],
    },
    {
      title: "Suscripciones y Pagos",
      items: [
        {
          title: "Planes",
          url: "/dashboard/planes",
          icon: Crown,
          isActive: activeSection === "planes",
        },
        {
          title: "Métodos de Pago",
          url: "/dashboard/metodos-pago",
          icon: DollarSign,
          isActive: activeSection === "metodos-pago",
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        {
          title: "Configuración",
          url: "/dashboard/configuracion",
          icon: Settings,
          isActive: activeSection === "configuracion",
        },
      ],
    },
  ]

  const closeSidebar = () => setSidebarOpen(false)
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
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
              <p className="text-sm text-gray-500">Panel Administrativo</p>
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
                to="/dashboard/perfil-admin"
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

export default DashboardLayout
