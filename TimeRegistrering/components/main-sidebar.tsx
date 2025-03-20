"use client"

import type React from "react"

import { useState } from "react"
import {
  Menu,
  BarChart2,
  Clock,
  Users,
  FileText,
  Settings,
  HelpCircle,
  MessageCircle,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Grensesnitt

interface SidebarItemProps {
  icon: React.ReactNode // Ikonet som vises ved siden av teksten
  label: string // Teksten som vises i knappen
  expanded: boolean // Om sidebaren er utvidet eller ikke
  hasDropdown?: boolean // Om elementet har en dropdown-meny
  onClick?: () => void // Valgfri click-handler
}

/**
 * SidebarItem - Komponent for navigasjonselementer i sidebaren
 *
 * Tilpasser visningen basert på om sidebaren er utvidet eller ikke:
 * - Når utvidet: Viser ikon og tekst side om side
 * - Når sammenslått: Viser kun ikon med tooltip
 */
const SidebarItem = ({ icon, label, expanded, hasDropdown = false, onClick }: SidebarItemProps) => {
  const buttonContent = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-white hover:bg-blue-700 hover:text-white",
        expanded ? "px-4" : "px-0 justify-center",
      )}
      onClick={onClick}
    >
      <div className="flex items-center w-full">
        <div className={cn("flex-shrink-0", expanded ? "mr-3" : "mx-auto")}>{icon}</div>
        {expanded && (
          <div className="flex items-center justify-between w-full">
            <span>{label}</span>
            {hasDropdown && <ChevronRight className="h-4 w-4 ml-2" />}
          </div>
        )}
      </div>
    </Button>
  )

  // Når sidebaren er sammenslått, bruk tooltip for å vise etiketten
  if (!expanded) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonContent
}

/**
 * MainSidebar - Sidemeny for applikasjonen
 *
 * Kan ekspanderes/kollapses, og tilpasser visningen deretter.
 * Viser hovedelementer for navigasjon, med støtte for undermenyer.
 */
export function MainSidebar() {
  // Tilstand (State)

  const [expanded, setExpanded] = useState(false)

  // Rendering

  return (
    <div
      className={cn(
        "h-screen bg-blue-600 flex flex-col transition-all duration-300 fixed top-0 left-0 z-50",
        expanded ? "w-64" : "w-16",
      )}
    >
      {/* Toppområde med logo/tittel og toggle-knapp */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500">
        {expanded ? (
          <div className="flex items-center">
            <span className="text-2xl font-bold text-white mr-2">TR</span>
            <span className="text-xl font-semibold text-white">Timeregistrering</span>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-2xl font-bold text-white mx-auto cursor-pointer">TR</span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Timeregistrering</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-700"
          onClick={() => setExpanded(!expanded)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Hovedmenyelementer */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          <SidebarItem icon={<BarChart2 className="h-5 w-5" />} label="Oversikt" expanded={expanded} />

          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <SidebarItem
                icon={<Clock className="h-5 w-5" />}
                label="Timeregistrering"
                expanded={expanded}
                hasDropdown={expanded}
              />
            </CollapsibleTrigger>
            {expanded && (
              <CollapsibleContent className="pl-10 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700">
                  Registrer timer
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700">
                  Ukeoversikt
                </Button>
              </CollapsibleContent>
            )}
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <SidebarItem
                icon={<FileText className="h-5 w-5" />}
                label="Fakturering"
                expanded={expanded}
                hasDropdown={expanded}
              />
            </CollapsibleTrigger>
            {expanded && (
              <CollapsibleContent className="pl-10 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700">
                  Fakturaer
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-blue-700">
                  Rapporter
                </Button>
              </CollapsibleContent>
            )}
          </Collapsible>

          <SidebarItem icon={<Users className="h-5 w-5" />} label="Analyse & KPI" expanded={expanded} />

          <SidebarItem icon={<Settings className="h-5 w-5" />} label="Innstillinger" expanded={expanded} />
        </div>
      </div>

      {/* Bunnområde med støttefunksjoner */}
      <div className="border-t border-blue-500 py-4 px-2 space-y-1">
        <SidebarItem icon={<HelpCircle className="h-5 w-5" />} label="Hjelp" expanded={expanded} />
        <SidebarItem icon={<MessageCircle className="h-5 w-5" />} label="Kontakt oss" expanded={expanded} />
        <SidebarItem icon={<LogOut className="h-5 w-5" />} label="Log ut" expanded={expanded} />
      </div>
    </div>
  )
}

