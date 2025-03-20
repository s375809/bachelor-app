"use client"

import { Home, Calendar, Settings, HelpCircle, LayoutDashboard } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 px-2 rounded-md">
          Meny
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64">
        <SheetHeader className="text-left">
          <SheetTitle>Meny</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Button variant="ghost" className="justify-start">
            <Home className="mr-2 h-4 w-4" />
            Hjem
          </Button>
          <Button variant="ghost" className="justify-start">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Kalender
          </Button>
          <Button variant="ghost" className="justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Innstillinger
          </Button>
          <Button variant="ghost" className="justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Hjelp
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

