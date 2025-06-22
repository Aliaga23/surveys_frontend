

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const Sidebar = ({ children, isOpen, onClose, className = "" }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, isMobile])

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

        {/* Mobile Sidebar */}
        <div
          className={`
          fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${className}
        `}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex-1">{/* Header content will be passed as children */}</div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div
      className={`
      w-64 bg-white border-r border-gray-200 flex flex-col h-screen
      ${className}
    `}
    >
      {children}
    </div>
  )
}

const SidebarHeader = ({ children, className = "" }) => {
  return <div className={`border-b border-gray-200 p-4 ${className}`}>{children}</div>
}

const SidebarContent = ({ children, className = "" }) => {
  return <div className={`flex-1 overflow-y-auto p-4 ${className}`}>{children}</div>
}

const SidebarFooter = ({ children, className = "" }) => {
  return <div className={`border-t border-gray-200 p-4 ${className}`}>{children}</div>
}

const SidebarGroup = ({ children, className = "" }) => {
  return <div className={`mb-6 ${className}`}>{children}</div>
}

const SidebarGroupLabel = ({ children, className = "" }) => {
  return (
    <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ${className}`}>{children}</div>
  )
}

const SidebarMenu = ({ children, className = "" }) => {
  return <div className={`space-y-1 ${className}`}>{children}</div>
}

const SidebarMenuItem = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>
}

const SidebarMenuButton = ({ children, isActive = false, onClick, href, className = "" }) => {
  const baseClasses = `
    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
    hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:text-gray-900"}
    ${className}
  `

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {children}
    </button>
  )
}

const SidebarTrigger = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
}
