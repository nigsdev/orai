"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { RightPanel } from "./right-panel"
import { MobileMenuButton } from "./mobile-menu-button"
import { useResponsive } from "@/hooks/use-responsive"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isMobile, isTablet } = useResponsive()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-navy-900 bg-navy-gradient transition-colors duration-300">
      <Header />
      <MobileMenuButton isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : "ml-64"
        )}>
          <div className="p-4 md:p-6 pt-24 md:pt-20">
            <div className={cn(
              "flex gap-4 md:gap-6 transition-all duration-300",
              isMobile || isTablet ? "flex-col" : "flex-row"
            )}>
              <div className="flex-1 min-w-0">
                {children}
              </div>
              {!isMobile && <RightPanel />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
