"use client"

import React, { useState, type KeyboardEvent } from "react"
import {
  FileText,
  MessagesSquare,
  SearchIcon,
  Trash2,
  CheckCircle2,
  FileEdit,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Pencil,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import type { UnconfirmedSuggestion } from "@/types/time-tracking"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Case } from "@/types/time-tracking"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CaseSearchSelect } from "@/components/case-search-select"
import { ActivityCombobox } from "@/components/activity-combobox"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Grensesnitt og hjelpefunksjoner

interface UnconfirmedSuggestionsProps {
  suggestions: UnconfirmedSuggestion[] // Liste over ubekreftede forslag
  onConfirm: (suggestionId: string) => void // Funksjon for å bekrefte et forslag
  onDelete: (suggestionId: string) => void // Funksjon for å slette et forslag
  onUpdate: (suggestion: UnconfirmedSuggestion) => void // Funksjon for å oppdatere et forslag
  cases: Case[] // Liste over alle saker
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
 * UnconfirmedSuggestions - Komponent for håndtering av ubekreftede forslag
 *
 * Viser en liste over ubekreftede forslag gruppert i kategorier:
 * - Fullført: Forslag med all nødvendig informasjon
 * - Delvis fullført: Forslag som mangler noe informasjon
 * - Spam: Forslag uten noen informasjon
 *
 * Brukeren kan bekrefte, redigere eller slette forslag.
 */
export function UnconfirmedSuggestions({
  suggestions,
  onConfirm,
  onDelete,
  onUpdate,
  cases,
}: UnconfirmedSuggestionsProps) {
  // Tilstand (state)

  // Tilstand for valgte forslag (for massebekreftelse)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, boolean>>({})

  // Tilstand for å vise/skjule hele seksjonen
  const [isSectionExpanded, setIsSectionExpanded] = useState(true)

  // Tilstand for redigering av forslag
  const [editingSuggestionId, setEditingSuggestionId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<{
    caseId: string
    type: string
    description: string
    hours: number
    hoursInput: string
    billable: boolean
  }>({
    caseId: "",
    type: "",
    description: "",
    hours: 0,
    hoursInput: "",
    billable: true,
  })

  // Håndterere (handlers)

  /**
   * Håndterer endring av avkrysningsbokser for valg av forslag
   * Brukes for å velge flere forslag for massebekreftelse
   */
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [id]: checked,
    }))
  }

  /**
   * Bekrefter alle valgte forslag
   * Kaller onConfirm for hvert valgte forslag og viser en bekreftelsesmelding
   */
  const handleConfirmSelected = () => {
    const selectedCount = Object.entries(selectedSuggestions).filter(([id, isSelected]) => isSelected).length

    Object.entries(selectedSuggestions).forEach(([id, isSelected]) => {
      if (isSelected) {
        onConfirm(id)
      }
    })
    setSelectedSuggestions({})

    // Vis bekreftelsesmelding hvis noen forslag ble bekreftet
    if (selectedCount > 0) {
      toast({
        title: `${selectedCount} forslag bekreftet`,
        description: "Forslagene er nå lagt til som tidsregistreringer.",
      })
    }
  }

  /**
   * Henter riktig ikon basert på aktivitetstype
   * Brukes for visuell indikasjon av aktivitetstypen i forslagslisten
   */
  const getIconComponent = (type: string) => {
    switch (type) {
      case "Kundemøte":
        return MessagesSquare
      case "Forskning":
        return SearchIcon
      case "Dokumentgjennomgang":
        return FileText
      case "Juridisk Skriving":
        return FileEdit
      default:
        return FileText
    }
  }

  /**
   * Sjekker om det er noen valgte forslag
   * Brukes for å vise/skjule "Bekreft valgte"-knappen
   */
  const hasSelectedSuggestions = Object.values(selectedSuggestions).some(Boolean)

  /**
   * Starter redigering av et forslag
   * Setter opp redigeringsskjemaet med data fra det valgte forslaget
   */
  const handleStartEdit = (suggestion: UnconfirmedSuggestion) => {
    setEditingSuggestionId(suggestion.id)
    setEditFormData({
      caseId: suggestion.caseId,
      type: suggestion.type,
      description: suggestion.description,
      hours: suggestion.hours,
      hoursInput: formatNumberWithComma(suggestion.hours),
      billable: true, // Standard er fakturerbar
    })
  }

  /**
   * Avbryter redigering av et forslag
   */
  const handleCancelEdit = () => {
    setEditingSuggestionId(null)
  }

  /**
   * Lagrer endringer i et forslag
   * Validerer data og kaller onUpdate med oppdatert forslag
   */
  const handleSaveEdit = () => {
    if (!editingSuggestionId) return

    const suggestion = suggestions.find((s) => s.id === editingSuggestionId)
    if (!suggestion) return

    const updatedSuggestion: UnconfirmedSuggestion = {
      ...suggestion,
      caseId: editFormData.caseId,
      type: editFormData.type,
      description: editFormData.description,
      hours: editFormData.hours,
    }

    onUpdate(updatedSuggestion)
    setEditingSuggestionId(null)

    toast({
      title: "Forslag oppdatert",
      description: "Endringene er lagret.",
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
    // Sikrer at vi har et gyldig tall mellom 0.25 og 24
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
   * Håndterer tastetrykk for seksjonstoggling
   * Lar brukeren trykke Enter for å vise/skjule seksjonen
   */
  const handleSectionToggleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      toggleSection()
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

  /**
   * Sletter et forslag under redigering
   */
  const handleDeleteEdit = () => {
    if (!editingSuggestionId) return

    onDelete(editingSuggestionId)
    setEditingSuggestionId(null)

    toast({
      title: "Forslag slettet",
      description: "Forslaget er slettet.",
    })
  }

  // Beregninger og kategorisering

  /**
   * Kategoriserer forslagene i tre grupper:
   * - Fullført: Forslag med all nødvendig informasjon
   * - Delvis fullført: Forslag som mangler noe informasjon
   * - Spam: Forslag uten noen informasjon
   */
  const categorizedSuggestions = {
    // Fullførte forslag har all nødvendig informasjon
    completed: suggestions.filter(
      (suggestion) => suggestion.caseId && suggestion.type && suggestion.description && suggestion.hours > 0,
    ),
    // Delvis fullførte forslag mangler noe informasjon
    partiallyCompleted: suggestions.filter(
      (suggestion) =>
        (suggestion.caseId || suggestion.type || suggestion.description || suggestion.hours > 0) &&
        (!suggestion.caseId || !suggestion.type || !suggestion.description || suggestion.hours <= 0),
    ),
    // Spam-forslag har ingen informasjon
    spam: suggestions.filter(
      (suggestion) => !suggestion.caseId && !suggestion.type && !suggestion.description && suggestion.hours <= 0,
    ),
  }

  /**
   * Henter saksinformasjon for et forslag
   */
  const getCaseInfo = (caseId: string) => {
    return cases.find((c) => c.id === caseId)
  }

  /**
   * Viser/skjuler hele forslagsseksjonen
   */
  const toggleSection = () => {
    setIsSectionExpanded(!isSectionExpanded)
  }

  /**
   * Henter ikon basert på kategoritype
   * Brukes for visuell indikasjon av kategorien i forslagslisten
   */
  const getCategoryIcon = (category: "completed" | "partiallyCompleted" | "spam") => {
    switch (category) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
      case "partiallyCompleted":
        return <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
      case "spam":
        return <X className="h-5 w-5 text-red-600 mr-2" />
      default:
        return null
    }
  }

  // Rendering av forslagselementer

  /**
   * Rendrer et forslagselement
   * Viser enten redigeringsskjema eller forslagsvisning avhengig av tilstand
   */
  const renderSuggestionItem = (
    suggestion: UnconfirmedSuggestion,
    category: "completed" | "partiallyCompleted" | "spam",
  ) => {
    const caseInfo = getCaseInfo(suggestion.caseId)
    const isEditing = editingSuggestionId === suggestion.id

    // Vis redigeringsskjema hvis forslaget redigeres
    if (isEditing) {
      return (
        <div key={suggestion.id} className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {/* Saksvelger */}
            <div className="w-full md:w-[calc(16.67%-0.75rem)]">
              <CaseSearchSelect
                cases={cases}
                value={editFormData.caseId}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, caseId: value }))}
                placeholder="Velg sak"
              />
            </div>

            {/* Aktivitetstype-velger */}
            <div className="w-full md:w-[calc(16.67%-0.75rem)]">
              <ActivityCombobox
                value={editFormData.type}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, type: value }))}
                placeholder="Velg aktivitetstype"
              />
            </div>

            {/* Beskrivelse */}
            <div className="w-full md:w-[calc(33.33%-0.75rem)]">
              <Input
                placeholder="Beskrivelse"
                value={editFormData.description}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="border-gray-300 text-gray-800"
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
                  id={`billable-${suggestion.id}`}
                  checked={editFormData.billable}
                  onCheckedChange={(checked) => setEditFormData((prev) => ({ ...prev, billable: checked as boolean }))}
                  className="border-gray-400 data-[state=checked]:bg-green-600"
                />
                <label
                  htmlFor={`billable-${suggestion.id}`}
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
                        onClick={handleDeleteEdit}
                        className="h-9 w-9 text-red-600 hover:bg-red-50"
                        aria-label="Slett"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        <Check className="w-4 h-4" />
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
                        className="h-9 w-9 text-gray-500 hover:bg-gray-200"
                        aria-label="Avbryt"
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
      )
    }

    // Vis normal forslagsvisning
    return (
      <div
        key={suggestion.id}
        className={cn(
          "p-4 border-b border-gray-200 flex items-center gap-3",
          category === "spam" ? "bg-gray-50" : "bg-white",
        )}
      >
        {/* Avkrysningsboks for valg av forslag */}
        <div
          className="flex items-center"
          onClick={() => handleCheckboxChange(suggestion.id, !selectedSuggestions[suggestion.id])}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleCheckboxChange(suggestion.id, !selectedSuggestions[suggestion.id])
            }
          }}
          tabIndex={0}
          role="checkbox"
          aria-checked={!!selectedSuggestions[suggestion.id]}
        >
          <Checkbox
            id={`check-${suggestion.id}`}
            checked={!!selectedSuggestions[suggestion.id]}
            onCheckedChange={(checked) => handleCheckboxChange(suggestion.id, checked as boolean)}
            className="border-gray-400 h-5 w-5 data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* Forslagsinnhold */}
        <div className="flex flex-1 items-center gap-3 text-gray-800">
          {/* Ikon basert på aktivitetstype */}
          {React.createElement(getIconComponent(suggestion.type || "Dokumentgjennomgang"), {
            className: "w-5 h-5 flex-shrink-0 text-gray-500",
          })}

          <div className="flex-1">
            {/* Forslagsinformasjon */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                {/* Beskrivelse */}
                {category === "completed" || suggestion.description ? (
                  <div className="font-bold flex items-center text-base">{suggestion.description}</div>
                ) : (
                  <div className="font-bold flex items-center text-base">
                    <span className="text-yellow-600 italic">
                      {category === "spam" ? "Uidentifisert aktivitet" : "Mangler beskrivelse"}
                    </span>
                  </div>
                )}

                {/* Saksinformasjon */}
                {caseInfo ? (
                  <div className="text-sm font-medium text-gray-600">
                    {caseInfo.name} ({caseInfo.caseNumber}) {caseInfo.clientName}
                  </div>
                ) : (
                  category !== "spam" && (
                    <div className="text-sm font-medium text-yellow-600 italic">Mangler saksinformasjon</div>
                  )
                )}
              </div>

              <div className="flex items-center">
                {/* Timer */}
                <div className="text-lg font-bold mr-4">
                  {suggestion.hours > 0 ? (
                    `${formatHours(suggestion.hours)}t`
                  ) : (
                    <span className="italic text-yellow-600">Mangler timer</span>
                  )}
                </div>

                {/* Handlingsknapper */}
                <div className="flex gap-2">
                  {/* Rediger-knapp */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-blue-600 hover:bg-blue-50"
                          aria-label="Rediger forslag"
                          onClick={() => handleStartEdit(suggestion)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rediger</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Slett-knapp */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-600 hover:bg-red-50"
                          aria-label="Slett forslag"
                          onClick={() => onDelete(suggestion.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Slett</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Bekreft-knapp (vises ikke for spam) */}
                  {category !== "spam" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-green-600 hover:bg-green-50"
                            aria-label="Bekreft forslag"
                            onClick={() => onConfirm(suggestion.id)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bekreft</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>

            {/* Dato */}
            <div className="text-xs text-gray-500 mt-1 font-medium">
              {format(suggestion.date, "EEEE d. MMMM yyyy", { locale: nb })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Hovedrendering

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Overskrift og toggle-knapp */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={toggleSection}
          onKeyDown={handleSectionToggleKeyDown}
          tabIndex={0}
          role="button"
          aria-expanded={isSectionExpanded}
        >
          {isSectionExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
          <h2 className="text-lg font-bold text-gray-800">Ubekreftede forslag</h2>
        </div>

        {/* Bekreft valgte-knapp (vises kun når seksjonen er utvidet og noen forslag er valgt) */}
        {isSectionExpanded && hasSelectedSuggestions && (
          <button
            className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium flex items-center"
            onClick={handleConfirmSelected}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Bekreft valgte
          </button>
        )}
      </div>

      {/* Innhold (vises kun når seksjonen er utvidet) */}
      {isSectionExpanded && (
        <div>
          {suggestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Ingen ubekreftede forslag tilgjengelig</div>
          ) : (
            <Accordion type="multiple" defaultValue={["completed"]}>
              {/* Fullførte forslag */}
              <AccordionItem value="completed" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                  <div className="flex items-center">
                    {getCategoryIcon("completed")}
                    <span className="font-bold text-gray-800">Fullført</span>
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {categorizedSuggestions.completed.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {categorizedSuggestions.completed.map((suggestion) => renderSuggestionItem(suggestion, "completed"))}
                </AccordionContent>
              </AccordionItem>

              {/* Delvis fullførte forslag */}
              <AccordionItem value="partiallyCompleted" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                  <div className="flex items-center">
                    {getCategoryIcon("partiallyCompleted")}
                    <span className="font-bold text-gray-800">Delvis fullført</span>
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {categorizedSuggestions.partiallyCompleted.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {categorizedSuggestions.partiallyCompleted.map((suggestion) =>
                    renderSuggestionItem(suggestion, "partiallyCompleted"),
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Spam-forslag */}
              <AccordionItem value="spam" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md">
                  <div className="flex items-center">
                    {getCategoryIcon("spam")}
                    <span className="font-bold text-gray-800">Spam</span>
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {categorizedSuggestions.spam.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {categorizedSuggestions.spam.map((suggestion) => renderSuggestionItem(suggestion, "spam"))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}
    </div>
  )
}

