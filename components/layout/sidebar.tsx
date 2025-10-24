"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useResponsive } from "@/hooks/use-responsive"
import { 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Wrench, 
  Settings,
  Menu,
  X
} from "lucide-react"

const navigation = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function Sidebar({ isOpen = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { isMobile } = useResponsive()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
    onToggle?.()
  }

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card text-white hover:glow-accent-hover transition-all"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full glass-sidebar w-64 z-40 transition-all duration-300 ease-in-out",
        isMobile ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
      )}>
        <div className="flex h-full flex-col gap-2">
          {/* Logo Section */}
          <div className="flex h-[80px] items-center border-b border-white/10 px-6">
            <Link 
              className="flex items-center gap-3 font-bold text-white text-xl hover:glow-accent-hover transition-all duration-300" 
              href="/"
            >
              {/* <div className="relative">
                <div className="absolute inset-0 bg-accent-blue-500/30 rounded-lg blur-lg"></div>
                <div className="relative bg-accent-blue-500 text-white px-3 py-1 rounded-lg font-bold text-lg glow-accent">
                  <img src="/orailogo.png" alt="ORAI Logo" width={100} height={50} />
                </div>
              </div> */}
              <img src="/orailogo.png" alt="ORAI Logo" width={100} height={50} />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid items-start px-4 text-sm font-medium space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.name === "Chat" && pathname === "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-gray-300 transition-all duration-300",
                      "hover:text-accent-blue-500 hover:bg-white/5 hover:glow-accent-hover",
                      "active:scale-95 transform",
                      isActive && "bg-accent-blue-500/20 text-accent-blue-500 glow-accent border border-accent-blue-500/30"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive && "scale-110"
                    )} />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-accent-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom section for additional content */}
          <div className="p-4 border-t border-white/10">
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">User Profile</p>
                  <p className="text-gray-400 text-xs truncate">user@orai.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
