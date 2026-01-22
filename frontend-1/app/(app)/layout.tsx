"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
    
      <Navbar toggleSidebar={() => setSidebarOpen((p) => !p)} />

      <div className="flex flex-1 overflow-hidden">
        
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 md:px-6 md:pb-6">
             {children}
        </main>
      </div>
    </div>
  )
}