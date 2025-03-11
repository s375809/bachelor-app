"use client"

import { Calendar, Clock, FileText, Settings, UserCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()

  // Navigasjonselementer for sidefeltet
  const navItems = [
    {
      title: "Dashbord",
      href: "/",
      icon: Clock,
    },
    {
      title: "Kalender",
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: "Klienter",
      href: "/clients",
      icon: UserCheck,
    },
    {
      title: "Rapporter",
      href: "/reports",
      icon: FileText,
    },
    {
      title: "Innstillinger",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon" className="bg-[#2a3f9d] text-white border-r-0">
      <SidebarContent>
        <div className="flex justify-center items-center h-16 border-b border-blue-800">
          <Link
            href="/"
            className="flex items-center justify-center h-10 w-10 text-2xl bg-white text-[#2a3f9d] font-bold rounded-md"
          >
            S
          </Link>
        </div>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                className={cn("text-white hover:bg-blue-800", pathname === item.href && "bg-blue-800 font-medium")}
              >
                <Link href={item.href}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

