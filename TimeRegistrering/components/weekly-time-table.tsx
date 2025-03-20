"use client"

import React from "react"
import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TimeEntry, Case, UnconfirmedSuggestion } from "@/types/time-tracking"
import { Trash2, X, Minus, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CaseSearchSelect } from "@/components/case-search-select"
import { ActivityCombobox } from "@/components/activity-combobox"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Grensesnitt og hjelpefunksjoner

interface WeeklyTimeTableProps {
  selectedDate: Date // Valgt dato som bestemmer hvilken uke som vises
  timeEntries: TimeEntry[] // Liste over alle tidsregistreringer
  cases: Case[] // Liste over alle saker
  unconfirmedSuggestions: UnconfirmedSuggestion[] // Liste over ubekreftede forslag
  onUpdateEntry: (entry: TimeEntry) => void // Funksjon for å oppdatere en tidsregistrering
  onDeleteEntry: (entryId: string) => void // Funksjon for å slette en tidsregistrering
  recentlyAddedEntryId?: string | null // ID til nylig lagt til registrering (for visuell markering)
}

/**
 * Formaterer timer uten unødvendige desimaler
 * F.eks. 2.0 blir "2", mens 2.5 blir "2.5"
 */
const formatHours = (hours: number): string => {
  return hours % 1 === 0 ? `${Math.floor(hours)}` : `${hours.toFixed(2)}`
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
 * WeeklyTimeTable - Komponent for ukentlig oversikt over tidsregistreringer
 *
 * Viser en tabell med saker i rader og ukedager i kolonner.
 * Hver celle inneholder tidsregistreringer for den aktuelle saken og dagen.
 * Brukeren kan klikke på en tidsregistrering for å redigere den.
 */
function WeeklyTimeTable({
  selectedDate,
  timeEntries,
  cases,
  unconfirmedSuggestions,
  onUpdateEntry,
  onDeleteEntry,
  recentlyAddedEntryId,
}: WeeklyTimeTableProps) {
  // Tilstand (State)

  // Tilstand for redigering av tidsregistreringer
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<{
    id: string
    caseId: string
    date: Date
    hours: number
    hoursInput: string
    description: string
    activityType: string
    billable: boolean
  }>({
    id: "",
    caseId: "",
    date: new Date(),
    hours: 0,
    hoursInput: "",
    description: "",
    activityType: "",
    billable: true,
  })

  // Referanser (Refs)

  // Referanser for redigeringsskjemaet og dets første fokuserbare element
  const editFormRef = useRef<HTMLDivElement>(null)
  const caseSelectRef = useRef<HTMLButtonElement>(null)
  const activitySelectRef = useRef<HTMLButtonElement>(null)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  // Beregninger og Memo

  // Beregner startdatoen for uken (mandag)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })

  // Genererer ukedagsoverskrifter - memoized for å unngå unødvendige beregninger
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i)
      return {
        dayName: format(date, "EEEE", { locale: nb }).toUpperCase(),
        dayNumber: format(date, "d", { locale: nb }),
        month: format(date, "MMM", { locale: nb }).toUpperCase(),
        fullDate: date,
      }
    })
  }, [weekStart])

  // Håndterere (Handlers)

  /**
   * Starter redigering av en tidsregistrering
   * Setter opp redigeringsskjemaet med data fra den valgte registreringen
   */
  const handleStartEdit = (entry: TimeEntry) => {
    setEditingEntryId(entry.id)
    setEditFormData({
      id: entry.id,
      caseId: entry.caseId,
      date: entry.date,
      hours: entry.hours,
      hoursInput: formatNumberWithComma(entry.hours),
      description: entry.description,
      activityType: entry.activityType,
      billable: entry.billable,
    })
  }

  /**
   * Avbryter redigering av en tidsregistrering
   */
  const handleCancelEdit = () => {
    setEditingEntryId(null)
  }

  /**
   * Lagrer endringer i en tidsregistrering
   * Validerer data og kaller onUpdateEntry med oppdatert registrering
   */
  const handleSaveEdit = () => {
    if (!editingEntryId) return

    const updatedEntry: TimeEntry = {
      id: editFormData.id,
      caseId: editFormData.caseId,
      date: editFormData.date,
      hours: editFormData.hours,
      description: editFormData.description,
      activityType: editFormData.activityType,
      billable: editFormData.billable,
    }

    onUpdateEntry(updatedEntry)
    setEditingEntryId(null)

    toast({
      title: "Endringer lagret",
      description: "Tidsregistreringen er oppdatert.",
    })
  }

  /**
   * Sletter en tidsregistrering
   * Kaller onDeleteEntry med ID til registreringen som skal slettes
   */
  const handleDeleteEntry = () => {
    if (!editingEntryId) return

    onDeleteEntry(editingEntryId)
    setEditingEntryId(null)

    toast({
      title: "Tidsregistrering slettet",
      description: "Tidsregistreringen er fjernet.",
      variant: "destructive",
    })
  }

  /**
   * Håndterer endring av timer-input
   * Oppdaterer både input-feltet og timer-verdien
   */
  const handleHoursInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Oppdaterer alltid input-feltets verdi
    setEditFormData((prev) => ({
      ...prev,
      hoursInput: e.target.value,
    }))

    // Parser verdien og oppdaterer timer hvis gyldig
    const parsedValue = parseDecimalInput(e.target.value)
    if (parsedValue !== null) {
      setEditFormData((prev) => ({
        ...prev,
        hours: parsedValue,
      }))
    }
  }

  /**
   * Håndterer når timer-input mister fokus
   * Sikrer at vi har et gyldig tall mellom 0.25 og 24
   */
  const handleHoursInputBlur = () => {
    const validHours = Math.max(0.25, Math.min(24, editFormData.hours))
    setEditFormData((prev) => ({
      ...prev,
      hours: validHours,
      hoursInput: formatNumberWithComma(validHours),
    }))
  }

  /**
   * Håndterer tastetrykk i timer-input
   * Lar brukeren bruke piltaster for å øke/redusere verdien
   */
  const handleHoursKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const newHours = Math.min(24, editFormData.hours + 0.25)
      setEditFormData((prev) => ({
        ...prev,
        hours: newHours,
        hoursInput: formatNumberWithComma(newHours),
      }))
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      const newHours = Math.max(0.25, editFormData.hours - 0.25)
      setEditFormData((prev) => ({
        ...prev,
        hours: newHours,
        hoursInput: formatNumberWithComma(newHours),
      }))
    }
  }

  /**
   * Håndterer tastetrykk på en tidsregistrering
   * Lar brukeren trykke Enter for å starte redigering
   */
  const handleTimeEntryKeyDown = (e: KeyboardEvent<HTMLDivElement>, entry: TimeEntry) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleStartEdit(entry)
    }
  }

  /**
   * Håndterer tastetrykk i redigeringsskjemaet
   * Lar brukeren trykke Escape for å avbryte redigering
   */
  const handleEditFormKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  /**
   * Øker timer med 0.25
   */
  const incrementHours = () => {
    const newHours = Math.min(24, editFormData.hours + 0.25)
    setEditFormData((prev) => ({
      ...prev,
      hours: newHours,
      hoursInput: formatNumberWithComma(newHours),
    }))
  }

  /**
   * Reduserer timer med 0.25
   */
  const decrementHours = () => {
    const newHours = Math.max(0.25, editFormData.hours - 0.25)
    setEditFormData((prev) => ({
      ...prev,
      hours: newHours,
      hoursInput: formatNumberWithComma(newHours),
    }))
  }

  // Effekter (Effects)

  /**
   * Fokushåndtering for redigeringsskjemaet
   * Når en registrering åpnes for redigering:
   * 1. Skroller skjemaet inn i visning
   * 2. Setter fokus på første input-element
   */
  useEffect(() => {
    if (editingEntryId) {
      // Skroller skjemaet inn i visning
      if (editFormRef.current) {
        setTimeout(() => {
          editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }, 50)
      }

      // Setter fokus på første input-element - prøver hver ref i rekkefølge
      setTimeout(() => {
        if (descriptionInputRef.current) {
          descriptionInputRef.current.focus()
        } else if (activitySelectRef.current) {
          activitySelectRef.current.focus()
        } else if (caseSelectRef.current) {
          caseSelectRef.current.focus()
        }
      }, 100)
    }
  }, [editingEntryId])

  // Hjelpefunksjoner for rendering

  /**
   * Henter innholdet for en celle i tabellen
   * Finner tidsregistreringer for den aktuelle saken og datoen
   */
  const getCellContent = (caseId: string, date: Date) => {
    // Finner tidsregistreringer for denne saken og datoen
    const entries = timeEntries.filter((entry) => entry.caseId === caseId && isSameDay(entry.date, date))

    if (entries.length === 0) return null

    return (
      <div className="space-y-0.5 flex flex-col items-start h-full w-full">
        {entries.map((entry, index) => (
          <div
            key={`${entry.id}-${index}`}
            className={cn(
              "p-1 rounded text-xs cursor-pointer w-full transition-all duration-300",
              entry.billable
                ? "bg-green-500 bg-opacity-20 border border-green-500 text-green-800"
                : "bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-800",
              "hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500",
              entry.id === recentlyAddedEntryId && "ring-2 ring-blue-500 ring-offset-1 scale-105 animate-pulse",
              entry.id === editingEntryId && "ring-2 ring-blue-500 ring-offset-1",
            )}
            onClick={() => handleStartEdit(entry)}
            onKeyDown={(e) => handleTimeEntryKeyDown(e, entry)}
            tabIndex={0}
            role="button"
            aria-label={`${entry.description}, ${formatHours(entry.hours)}t, ${entry.billable ? "Fakturerbar" : "Ikke fakturerbar"}`}
          >
            <div className="font-bold">{formatHours(entry.hours)}t</div>
            <div className="text-xs font-medium truncate w-full">{entry.description}</div>
            {entry.fromSuggestion && <div className="text-xs italic">Fra forslag</div>}
          </div>
        ))}
      </div>
    )
  }

  // Rendering

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse" style={{ tableLayout: "fixed" }}>
        {/* Definerer kolonnebredder */}
        <colgroup>
          <col style={{ width: "200px" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
          <col style={{ width: "14.28%" }} />
        </colgroup>

        {/* Tabellhode med ukedager */}
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-2 text-left font-bold text-gray-700 uppercase text-xs">SAK</th>
            {weekDays.map((day, i) => (
              <th
                key={i}
                className={cn(
                  "p-2 text-center font-bold text-gray-700 uppercase text-xs",
                  isSameDay(day.fullDate, selectedDate) && "bg-blue-50 border-b-2 border-blue-500",
                )}
              >
                <div>{day.dayName}</div>
                <div className="font-medium">
                  {day.dayNumber}. {day.month}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Tabellkropp med saker og tidsregistreringer */}
        <tbody>
          {cases.map((caseItem) => (
            <React.Fragment key={caseItem.id}>
              {/* Rad for sak med tidsregistreringer */}
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 align-top">
                  <div className="font-bold text-gray-800 text-sm">
                    {caseItem.name} ({caseItem.caseNumber})
                  </div>
                  <div className="text-xs text-gray-600">{caseItem.clientName}</div>
                </td>
                {weekDays.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    className={cn("p-1 h-16 align-top", isSameDay(day.fullDate, selectedDate) && "bg-blue-50")}
                  >
                    {getCellContent(caseItem.id, day.fullDate)}
                  </td>
                ))}
              </tr>

              {/* Redigeringsrad - vises kun når en registrering redigeres */}
              {editingEntryId && timeEntries.find((entry) => entry.id === editingEntryId)?.caseId === caseItem.id && (
                <tr className="bg-gray-50">
                  <td colSpan={8} className="p-0">
                    <div
                      ref={editFormRef}
                      className="p-4 border-b border-gray-200 relative"
                      onKeyDown={handleEditFormKeyDown}
                      tabIndex={-1} // Gjør div fokuserbar men ikke i tab-rekkefølge
                    >
                      <div className="flex flex-wrap gap-3 pt-2 pb-1">
                        {/* Saksvelger */}
                        <div className="w-full md:w-[calc(16.67%-0.75rem)]">
                          <CaseSearchSelect
                            cases={cases}
                            value={editFormData.caseId}
                            onValueChange={(value) => setEditFormData((prev) => ({ ...prev, caseId: value }))}
                            placeholder="Velg sak"
                            ref={caseSelectRef}
                          />
                        </div>

                        {/* Aktivitetstype-velger */}
                        <div className="w-full md:w-[calc(16.67%-0.75rem)]">
                          <ActivityCombobox
                            value={editFormData.activityType}
                            onValueChange={(value) => setEditFormData((prev) => ({ ...prev, activityType: value }))}
                            placeholder="Velg aktivitetstype"
                            ref={activitySelectRef}
                          />
                        </div>

                        {/* Beskrivelse */}
                        <div className="w-full md:w-[calc(33.33%-0.75rem)]">
                          <Input
                            placeholder="Beskrivelse"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                            className="border-gray-300 text-gray-800"
                            ref={descriptionInputRef}
                          />
                        </div>

                        {/* Timer-input med pluss/minus-knapper */}
                        <div className="flex items-center w-full md:w-[calc(16.67%-0.75rem)]">
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
                            value={editFormData.hoursInput}
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

                        {/* Fakturerbar-avkrysning og handlingsknapper */}
                        <div className="flex items-center justify-between w-full md:w-auto md:flex-1">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`billable-${editFormData.id}`}
                              checked={editFormData.billable}
                              onCheckedChange={(checked) =>
                                setEditFormData((prev) => ({ ...prev, billable: checked as boolean }))
                              }
                              className="border-gray-400 data-[state=checked]:bg-green-600"
                            />
                            <label
                              htmlFor={`billable-${editFormData.id}`}
                              className="text-sm font-medium text-gray-800 cursor-pointer"
                              onClick={() => setEditFormData((prev) => ({ ...prev, billable: !prev.billable }))}
                            >
                              Fakturerbar
                            </label>
                          </div>

                          {/* Handlingsknapper - gruppert sammen i riktig rekkefølge for tastaturnavigasjon */}
                          <div className="flex items-center gap-2 ml-auto">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDeleteEntry}
                                    className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    aria-label="Slett"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Slett</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    onClick={handleSaveEdit}
                                    className="h-9 w-9 bg-green-600 hover:bg-green-700 text-white"
                                    aria-label="Lagre"
                                  >
                                    <Check className="w-5 h-5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Lagre</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancelEdit}
                                    className="h-9 w-9 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                    aria-label="Avbryt"
                                    ref={cancelButtonRef}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Avbryt</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WeeklyTimeTable

