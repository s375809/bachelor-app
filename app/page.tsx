"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { format, addDays, subDays, startOfWeek } from "date-fns"
import { nb } from "date-fns/locale" // Norsk språkpakke for date-fns

import { AppSidebar } from "@/components/app-sidebar"
import { WeeklyTimeTable } from "@/components/weekly-time-table"
import { UnconfirmedSuggestions } from "@/components/unconfirmed-suggestions"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { TimeEntry, Case, UnconfirmedSuggestion } from "@/types/time-tracking"
import { cn } from "@/lib/utils"

// Initiell testdata for saker
const INITIAL_CASES: Case[] = [
  { id: "case1", name: "Sak #1", description: "Kundemøte" },
  { id: "case2", name: "Sak #2", description: "Forskning" },
  { id: "case3", name: "Sak #3", description: "Dokumentgjennomgang" },
]

// Genererer datoer for gjeldende uke
const getCurrentWeekDates = (baseDate: Date) => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // Starter på mandag
  return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
}

export default function TimeTrackingPage() {
  // State-variabler for skjemaet
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [hours, setHours] = useState(1.0)
  const [isBillable, setIsBillable] = useState(true)
  const [description, setDescription] = useState("")
  const [selectedCase, setSelectedCase] = useState<string>("")
  const [activityType, setActivityType] = useState<string>("")

  // State-variabler for data
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [unconfirmedSuggestions, setUnconfirmedSuggestions] = useState<UnconfirmedSuggestion[]>([])

  // Initialiserer ubekreftede forslag med datoer for gjeldende uke
  useEffect(() => {
    const weekDates = getCurrentWeekDates(new Date())

    // Oppretter testdata for ubekreftede forslag
    const suggestions: UnconfirmedSuggestion[] = [
      {
        id: "sugg1",
        caseId: "case1",
        type: "Kundemøte",
        description: "Oppfølgingsmøte med klient",
        hours: 2.5,
        date: weekDates[2], // Onsdag
        important: true,
        confirmed: false,
      },
      {
        id: "sugg2",
        caseId: "case2",
        type: "Forskning",
        description: "Juridisk presedensforskning",
        hours: 1.75,
        date: weekDates[1], // Tirsdag
        important: false,
        confirmed: false,
      },
      {
        id: "sugg3",
        caseId: "case1",
        type: "Dokumentgjennomgang",
        description: "Kontraktanalyse",
        hours: 3.0,
        date: weekDates[3], // Torsdag
        important: true,
        confirmed: false,
      },
      {
        id: "sugg4",
        caseId: "case3",
        type: "Juridisk Skriving",
        description: "Utarbeide begjæring om avvisning",
        hours: 2.0,
        date: weekDates[4], // Fredag
        important: false,
        confirmed: false,
      },
    ]

    setUnconfirmedSuggestions(suggestions)

    // Legger til noen initielle tidsregistreringer
    setTimeEntries([
      {
        id: "entry1",
        caseId: "case1",
        date: weekDates[0], // Mandag
        hours: 2.5,
        description: "Innledende konsultasjon",
        activityType: "Møte",
        billable: true,
      },
      {
        id: "entry2",
        caseId: "case2",
        date: weekDates[1], // Tirsdag
        hours: 3.0,
        description: "Juridisk forskning",
        activityType: "Forskning",
        billable: true,
      },
    ])
  }, [])

  // Øker antall timer med 0.25
  const incrementHours = () => {
    setHours((prev) => Math.min(24, prev + 0.25))
  }

  // Reduserer antall timer med 0.25
  const decrementHours = () => {
    setHours((prev) => Math.max(0.25, prev - 0.25))
  }

  // Navigerer til forrige uke
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  // Navigerer til neste uke
  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  // Navigerer til dagens dato
  const handleToday = () => {
    setSelectedDate(new Date())
  }

  // State for skjemavalideringsfeil
  const [formErrors, setFormErrors] = useState<{
    case?: string
    activityType?: string
    description?: string
  }>({})

  // Validerer skjemaet før innsending
  const validateForm = () => {
    const errors: {
      case?: string
      activityType?: string
      description?: string
    } = {}

    if (!selectedCase) {
      errors.case = "Vennligst velg en sak"
    }

    if (!activityType) {
      errors.activityType = "Vennligst velg en aktivitetstype"
    }

    if (!description.trim()) {
      errors.description = "Vennligst skriv en beskrivelse"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Håndterer innsending av ny tidsregistrering
  const handleAddEntry = () => {
    if (!validateForm()) {
      return
    }

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      caseId: selectedCase,
      date: selectedDate,
      hours,
      description,
      activityType,
      billable: isBillable,
    }

    setTimeEntries((prev) => [...prev, newEntry])

    // Tilbakestiller skjemaet
    setHours(1.0)
    setDescription("")
    setActivityType("")
    setFormErrors({})
  }

  // Oppdaterer en eksisterende tidsregistrering
  const handleUpdateEntry = (updatedEntry: TimeEntry) => {
    setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
  }

  // Sletter en tidsregistrering
  const handleDeleteEntry = (entryId: string) => {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  // Bekrefter et forslag og konverterer det til en tidsregistrering
  const handleConfirmSuggestion = (suggestionId: string) => {
    const suggestion = unconfirmedSuggestions.find((s) => s.id === suggestionId)
    if (!suggestion) return

    // Oppretter en ny tidsregistrering fra forslaget
    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      caseId: suggestion.caseId,
      date: suggestion.date,
      hours: suggestion.hours,
      description: suggestion.description,
      activityType: suggestion.type,
      billable: true, // Standard er fakturerbar
      fromSuggestion: true,
    }

    setTimeEntries((prev) => [...prev, newEntry])

    // Fjerner forslaget
    setUnconfirmedSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  // Sletter et forslag
  const handleDeleteSuggestion = (suggestionId: string) => {
    setUnconfirmedSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
  }

  // Oppdaterer et forslag
  const handleUpdateSuggestion = (updatedSuggestion: UnconfirmedSuggestion) => {
    setUnconfirmedSuggestions((prev) =>
      prev.map((sugg) => (sugg.id === updatedSuggestion.id ? updatedSuggestion : sugg)),
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <header className="flex items-center h-16 px-4 border-b bg-white shadow-sm">
            <h1 className="text-xl font-bold text-gray-800">SmartTimer</h1>
          </header>
          <main className="flex-1 p-4 space-y-4">
            {/* Hurtig aktivitetsregistrering */}
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousDay}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center justify-between w-[200px] border-gray-300 font-medium text-gray-800"
                      >
                        {format(selectedDate, "d. MMMM yyyy", { locale: nb })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        locale={nb}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextDay}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToday}
                    className="border-gray-300 hover:bg-gray-100 font-medium text-gray-800"
                  >
                    I dag
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-5 md:gap-4">
                <div className="md:col-span-1">
                  <Select
                    value={selectedCase}
                    onValueChange={(value) => {
                      setSelectedCase(value)
                      setFormErrors((prev) => ({ ...prev, case: undefined }))
                    }}
                  >
                    <SelectTrigger
                      className={cn("border-gray-300 font-medium text-gray-800", formErrors.case && "border-red-500")}
                    >
                      <SelectValue placeholder="Velg sak" />
                    </SelectTrigger>
                    <SelectContent>
                      {INITIAL_CASES.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.case && <p className="text-red-500 text-xs mt-1">{formErrors.case}</p>}
                </div>
                <div className="md:col-span-1">
                  <Select
                    value={activityType}
                    onValueChange={(value) => {
                      setActivityType(value)
                      setFormErrors((prev) => ({ ...prev, activityType: undefined }))
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "border-gray-300 font-medium text-gray-800",
                        formErrors.activityType && "border-red-500",
                      )}
                    >
                      <SelectValue placeholder="Aktivitetstype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Møte">Møte</SelectItem>
                      <SelectItem value="Forskning">Forskning</SelectItem>
                      <SelectItem value="Gjennomgang">Gjennomgang</SelectItem>
                      <SelectItem value="Dokumentskriving">Dokumentskriving</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.activityType && <p className="text-red-500 text-xs mt-1">{formErrors.activityType}</p>}
                </div>
                <div className="md:col-span-1">
                  <Input
                    placeholder="Beskrivelse"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (e.target.value.trim()) {
                        setFormErrors((prev) => ({ ...prev, description: undefined }))
                      }
                    }}
                    className={cn("border-gray-300 text-gray-800", formErrors.description && "border-red-500")}
                  />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>
                <div className="flex items-center md:col-span-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementHours}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Input
                    className="mx-2 text-center border-gray-300 font-medium text-gray-800"
                    value={hours.toFixed(2)}
                    onChange={(e) => {
                      const val = Number.parseFloat(e.target.value)
                      if (!isNaN(val)) setHours(val)
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementHours}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4 md:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billable"
                      checked={isBillable}
                      onCheckedChange={(checked) => setIsBillable(checked as boolean)}
                      className="border-gray-400 data-[state=checked]:bg-green-600"
                    />
                    <label htmlFor="billable" className="text-sm font-medium text-gray-800">
                      Fakturerbar
                    </label>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-medium" onClick={handleAddEntry}>
                    Legg til
                  </Button>
                </div>
              </div>
            </div>

            {/* Ukentlig tidsoversikt */}
            <WeeklyTimeTable
              selectedDate={selectedDate}
              timeEntries={timeEntries}
              cases={INITIAL_CASES}
              unconfirmedSuggestions={unconfirmedSuggestions}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
            />

            {/* Ubekreftede forslag */}
            <UnconfirmedSuggestions
              suggestions={unconfirmedSuggestions}
              onConfirm={handleConfirmSuggestion}
              onDelete={handleDeleteSuggestion}
              onUpdate={handleUpdateSuggestion}
              cases={INITIAL_CASES}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

