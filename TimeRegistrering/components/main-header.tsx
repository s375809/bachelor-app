"use client"

import type React from "react"
import { Clock, Users, FileText, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LAWYERS } from "@/data/dummy-data"

// Grensesnitt

interface HeaderItemProps {
  icon: React.ReactNode // Ikonet som vises ved siden av teksten
  label: string // Teksten som vises i knappen
  href?: string // Valgfri lenke (for navigasjonsknapper)
  hasDropdown?: boolean // Om knappen har en dropdown-meny
  dropdownItems?: { label: string; href?: string; onClick?: () => void }[] // Elementer i dropdown-menyen
  onClick?: () => void // Valgfri click-handler
}

/**
 * HeaderItem - Komponent for navigasjonselementer i headeren
 *
 * Kan være:
 * - En vanlig knapp (onClick må oppgis)
 * - En lenke (href må oppgis)
 * - En dropdown-meny (hasDropdown må være true og dropdownItems må oppgis)
 */
const HeaderItem = ({ icon, label, href, hasDropdown = false, dropdownItems = [], onClick }: HeaderItemProps) => {
  const pathname = usePathname()
  const isActive = href ? pathname === href : false

  // Dropdown-meny
  if (hasDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "flex items-center gap-2 text-gray-700 hover:bg-gray-100",
              isActive && "bg-gray-100 font-medium",
            )}
          >
            {icon}
            <span>{label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dropdownItems.map((item, index) =>
            item.href ? (
              <Link href={item.href} key={index}>
                <DropdownMenuItem>{item.label}</DropdownMenuItem>
              </Link>
            ) : (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Lenke
  if (href) {
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 text-gray-700 hover:bg-gray-100",
            isActive && "bg-gray-100 font-medium",
          )}
        >
          {icon}
          <span>{label}</span>
        </Button>
      </Link>
    )
  }

  // Vanlig knapp
  return (
    <Button variant="ghost" className="flex items-center gap-2 text-gray-700 hover:bg-gray-100" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </Button>
  )
}

// Hovednavigasjon
/**
 * MainHeader - Hovednavigasjon for applikasjonen
 *
 * Viser:
 * - Applikasjonsnavn
 * - Hovednavigeringselementer
 * - Profilmeny
 * - Varselmeny
 * - Mobilmeny for små skjermer
 */
export function MainHeader() {
  const pathname = usePathname()
  // Bruker den første advokaten fra dummy-dataen
  const lawyer = LAWYERS[0]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo og applikasjonsnavn */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-blue-600">Timeregistrering</span>
        </div>

        {/* Hovednavigasjon (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <HeaderItem icon={<Clock className="h-5 w-5" />} label="Timer" href="/" />
          <HeaderItem icon={<FileText className="h-5 w-5" />} label="Fakturering" href="/fakturering" />
          <HeaderItem icon={<Users className="h-5 w-5" />} label="Analyse & KPI" href="/analyse" />
        </nav>

        {/* Brukerområde (desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Varselbjelle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-700" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <div className="p-4 text-center text-sm text-gray-500">Ingen nye varsler</div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profilmeny */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={lawyer.name} />
                  <AvatarFallback>
                    {lawyer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{lawyer.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Min profil
              </DropdownMenuItem>
              <DropdownMenuItem>Innstillinger</DropdownMenuItem>
              <DropdownMenuItem>Logg ut</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobilmeny */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <Link href="/">
                <DropdownMenuItem>
                  <Clock className="h-4 w-4 mr-2" />
                  Timer
                </DropdownMenuItem>
              </Link>
              <Link href="/fakturering">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Fakturering
                </DropdownMenuItem>
              </Link>
              <Link href="/analyse">
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Analyse & KPI
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Varsler
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                {lawyer.name}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

