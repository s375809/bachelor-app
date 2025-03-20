"use client"

import type React from "react"

import { useState, useEffect, type KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { format, addDays, subDays, startOfWeek } from "date-fns"
import { nb } from "date-fns/locale" // Norsk språkpakke for date-fns

// Komponentimporter
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CASES, TIME_ENTRIES, UNCONFIRMED_SUGGESTIONS } from "@/data/dummy-data"
import { MainHeader } from "@/components/main-header"
import WeeklyTimeTable from "@/components/weekly-time-table"
import { UnconfirmedSuggestions } from "@/components/unconfirmed-suggestions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { TimeEntry, Case, UnconfirmedSuggestion } from "@/types/time-tracking"
import { cn } from "@/lib/utils"
import { CaseSearchSelect } from "@/components/case-search-select"
import { ActivityCombobox } from "@/components/activity-combobox"

// Hjelpefunksjoner
/**
 * Formaterer timer uten unødvendige desimaler
 * F.eks. 2.0 blir "2t", mens 2.5 blir "2.5t"
 */
const formatHours = (hours: number): string => {
  return hours % 1 === 0 ? `${Math.floor(hours)}t` : `${hours.toFixed(2)}t`
}

/**
 * Genererer datoer for gjeldende uke
 * Basert på en gitt dato, beregner alle datoer i uken (mandag-søndag)
 */
const getCurrentWeekDates = (baseDate: Date) => {
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // Starter på mandag
  return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
}

/**
 * Formaterer et tall for visning med komma som desimalseparator
 * F.eks. 2.5 blir "2,5"
 */
const formatNumberWithComma = (num: number): string => {
  return num === 0 ? "" : num.toString().replace(".", ",")
}

/**
 * Konverterer en streng med enten komma eller punktum som desimalseparator til et tall
 * Returnerer null hvis konverteringen mislykkes
 */
const parseDecimalInput = (value: string): number | null => {
  if (value === "") return 0

  // Erstatter komma med punktum for parsing
  const sanitizedValue = value.replace(",", ".")
  const parsed = Number.parseFloat(sanitizedValue)

  return isNaN(parsed) ? null : parsed
}

/**
 * TimeTrackingPage - Hovedkomponent for timeregistrering
 *
 * Håndterer:
 * - Registrering av nye timer
 * - Visning og behandling av ubekreftede forslag
 * - Ukentlig oversikt over registrerte timer
 * - Navigasjon mellom datoer
 */
export default function TimeTrackingPage() {
  // Tilstand (State)

  // State-variabler for skjemaet
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [hours, setHours] = useState(1.0)
  const [hoursInput, setHoursInput] = useState("1,0") // Tilstand for input-feltet
  const [isBillable, setIsBillable] = useState(true)
  const [description, setDescription] = useState("")
  const [selectedCase, setSelectedCase] = useState<string>("")
  const [activityType, setActivityType] = useState<string>("")

  // State-variabler for data
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [unconfirmedSuggestions, setUnconfirmedSuggestions] = useState<UnconfirmedSuggestion[]>([])
  const [cases, setCases] = useState<Case[]>([])

  // State for skjemavalideringsfeil
  const [formErrors, setFormErrors] = useState<{
    case?: string
    activityType?: string
    description?: string
  }>({})

  // Holder styr på nylig lagt til oppføring for visuell markering
  const [recentlyAddedEntryId, setRecentlyAddedEntryId] = useState<string | null>(null)

  // Effekter (Effects)

  /**
   * Oppdaterer hoursInput når hours endres
   * Sikrer synkronisering mellom numerisk verdi og visningsformat
   */
  useEffect(() => {
    setHoursInput(formatNumberWithComma(hours))
  }, [hours])

  /**
   * Initialiserer data fra dummy-data
   * I en reell applikasjon ville dette være API-kall
   */
  useEffect(() => {
    // Setter opp saker fra dummy-data
    setCases(CASES)

    // Setter opp tidsregistreringer fra dummy-data
    setTimeEntries(TIME_ENTRIES)

    // Setter opp ubekreftede forslag fra dummy-data
    setUnconfirmedSuggestions(UNCONFIRMED_SUGGESTIONS)
  }, [])

  // Håndterere for timeantall

  /**
   * Øker antall timer med 0.25
   */
  const incrementHours = () => {
    setHours((prev) => Math.min(24, prev + 0.25))
  }

  /**
   * Reduserer antall timer med 0.25
   */
  const decrementHours = () => {
    setHours((prev) => Math.max(0.25, prev - 0.25))
  }

  /**
   * Håndterer endring av timer-input
   */
  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Alltid oppdater input-feltets verdi
    setHoursInput(e.target.value)

    // Parse verdien og oppdater timer hvis gyldig
    const parsedValue = parseDecimalInput(e.target.value)
    if (parsedValue !== null) {
      setHours(parsedValue)
    }
  }

  /**
   * Håndterer når timer-input mister fokus
   * Sikrer at vi har et gyldig tall mellom 0.25 og 24
   */
  const handleHoursInputBlur = () => {
    // Sikrer at vi har et gyldig tall mellom 0.25 og 24
    const validHours = Math.max(0.25, Math.min(24, hours))
    setHours(validHours)
    setHoursInput(formatNumberWithComma(validHours))
  }

  /**
   * Håndterer tastetrykk i timer-input
   * Lar brukeren bruke piltaster for å øke/redusere verdien
   */
  const handleHoursKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Tillat piltaster for å øke/redusere
    if (e.key === "ArrowUp") {
      e.preventDefault()
      incrementHours()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      decrementHours()
    }
  }

  // Håndterere for datonavigasjon

  /**
   * Navigerer til forrige dag
   */
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1))
  }

  /**
   * Navigerer til neste dag
   */
  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  /**
   * Navigerer til dagens dato
   */
  const handleToday = () => {
    setSelectedDate(new Date())
  }

  // Skjemavalidering

  /**
   * Validerer skjemaet før innsending
   * Sjekker at alle nødvendige felt er fylt ut
   */
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

  // Håndterere for tidsregistrering

  /**
   * Håndterer innsending av ny tidsregistrering
   * Validerer data og oppretter ny TimeEntry
   */
  const handleAddEntry = () => {
    if (!validateForm()) {
      return
    }

    const newEntryId = `entry-${Date.now()}`
    const newEntry: TimeEntry = {
      id: newEntryId,
      caseId: selectedCase,
      date: selectedDate,
      hours,
      description,
      activityType,
      billable: isBillable,
    }

    setTimeEntries((prev) => [...prev, newEntry])

    // Sett nylig lagt til oppføring for visuell markering
    setRecentlyAddedEntryId(newEntryId)

    // Fjern markeringen etter 3 sekunder
    setTimeout(() => {
      setRecentlyAddedEntryId(null)
    }, 3000)

    // Vis bekreftelsesmelding
    toast({
      title: "Tidsregistrering lagt til",
      description: `${formatHours(hours)} er registrert på ${cases.find((c) => c.id === selectedCase)?.name || "saken"}.`,
    })

    // Tilbakestiller skjemaet
    setHours(1.0)
    setDescription("")
    setActivityType("")
    setFormErrors({})
  }

  /**
   * Oppdaterer en eksisterende tidsregistrering
   */
  const handleUpdateEntry = (updatedEntry: TimeEntry) => {
    setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))

    // Vis bekreftelsesmelding
    toast({
      title: "Tidsregistrering oppdatert",
      description: `Endringene er lagret.`,
    })
  }

  /**
   * Sletter en tidsregistrering
   */
  const handleDeleteEntry = (entryId: string) => {
    const entryToDelete = timeEntries.find((entry) => entry.id === entryId)
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))

    // Vis bekreftelsesmelding
    toast({
      title: "Tidsregistrering slettet",
      description: `Tidsregistreringen er fjernet.`,
      variant: "destructive",
    })
  }

  // Håndterere for forslag

  /**
   * Bekrefter et forslag og konverterer det til en tidsregistrering
   */
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

    // Vis bekreftelsesmelding
    toast({
      title: "Forslag bekreftet",
      description: `Forslaget er nå lagt til som tidsregistrering.`,
    })
  }

  /**
   * Sletter et forslag
   */
  const handleDeleteSuggestion = (suggestionId: string) => {
    setUnconfirmedSuggestions((prev) => prev.filter((s) => s.id !== suggestionId))
    toast({
      title: "Forslag slettet",
      description: "Forslaget er fjernet.",
      variant: "destructive",
    })
  }

  /**
   * Oppdaterer et forslag
   */
  const handleUpdateSuggestion = (updatedSuggestion: UnconfirmedSuggestion) => {
    setUnconfirmedSuggestions((prev) =>
      prev.map((suggestion) => (suggestion.id === updatedSuggestion.id ? updatedSuggestion : suggestion)),
    )
    toast({
      title: "Forslag oppdatert",
      description: "Endringene er lagret.",
    })
  }

  /**
   * Håndterer oppretting av ny sak
   */
  const handleAddNewCase = (newCaseData: Omit<Case, "id">) => {
    const newId = `sak${Date.now()}`
    const newCase: Case = {
      id: newId,
      ...newCaseData,
    }
    setCases((prev) => [...prev, newCase])
    setSelectedCase(newId)
  }

  // Rendering

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MainHeader />
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
            {/* Saksvalg */}
            <div className="md:col-span-1">
              <CaseSearchSelect
                cases={cases}
                value={selectedCase}
                onValueChange={(value) => {
                  setSelectedCase(value)
                  setFormErrors((prev) => ({ ...prev, case: undefined }))
                }}
                error={!!formErrors.case}
                onAddNewCase={handleAddNewCase}
              />
              {formErrors.case && <p className="text-red-500 text-xs mt-1">{formErrors.case}</p>}
            </div>

            {/* Aktivitetstype */}
            <div className="md:col-span-1">
              <ActivityCombobox
                value={activityType}
                onValueChange={(value) => {
                  setActivityType(value)
                  setFormErrors((prev) => ({ ...prev, activityType: undefined }))
                }}
                error={!!formErrors.activityType}
              />
              {formErrors.activityType && <p className="text-red-500 text-xs mt-1">{formErrors.activityType}</p>}
            </div>

            {/* Beskrivelse */}
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

            {/* Timer med +/- kontroller */}
            <div className="flex items-center md:col-span-1">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementHours}
                className="border-gray-300 hover:bg-gray-100"
                aria-label="Reduser timer"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </Button>
              <Input
                className="mx-2 text-center border-gray-300 font-medium text-gray-800"
                value={hoursInput}
                onChange={handleHoursInputChange}
                onBlur={handleHoursInputBlur}
                onKeyDown={handleHoursKeyDown}
                type="text"
                aria-label="Timer"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementHours}
                className="border-gray-300 hover:bg-gray-100"
                aria-label="Øk timer"
              >
                <Plus className="w-4 h-4 text-gray-700" />
              </Button>
            </div>

            {/* Fakturerbar og Legg til-knapp */}
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

        {/* Ubekreftede forslag */}
        <UnconfirmedSuggestions
          suggestions={unconfirmedSuggestions}
          onConfirm={handleConfirmSuggestion}
          onDelete={handleDeleteSuggestion}
          onUpdate={handleUpdateSuggestion}
          cases={cases}
        />

        {/* Ukentlig tidsoversikt */}
        <WeeklyTimeTable
          selectedDate={selectedDate}
          timeEntries={timeEntries}
          cases={cases}
          unconfirmedSuggestions={unconfirmedSuggestions}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          recentlyAddedEntryId={recentlyAddedEntryId}
        />
      </main>
      <Toaster />
    </div>
  )
}

