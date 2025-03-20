"use client"

import { useState, useRef, useEffect, forwardRef } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Grensesnitt

interface ActivityComboboxProps {
  value: string // Valgt aktivitetstype
  onValueChange: (value: string) => void // Funksjon for å oppdatere valgt aktivitetstype
  placeholder?: string // Placeholdertekst som vises når ingen verdi er valgt
  className?: string // Ekstra CSS-klasser
  error?: boolean // Om feltet har en valideringsfeil
}

// Predefinerte aktivitetstyper

// Liste over forhåndsdefinerte aktivitetstyper
const ACTIVITY_TYPES = [
  "Reisetid",
  "Juridisk bistand",
  "Mediakommunikasjon",
  "Møte med skatt",
  "Undersøkelser",
  "Forhandlinger",
  "Mekling",
  "Admin",
  "Kontraktgjennomgang",
]

/**
 * ActivityCombobox - Komponent for å velge eller opprette aktivitetstyper
 *
 * Lar brukeren:
 * - Velge fra en forhåndsdefinert liste med aktivitetstyper
 * - Søke etter aktivitetstyper
 * - Legge til nye aktivitetstyper som ikke finnes i listen
 */
export const ActivityCombobox = forwardRef<HTMLButtonElement, ActivityComboboxProps>(function ActivityCombobox(
  { value, onValueChange, placeholder = "Velg aktivitetstype", className, error = false },
  ref,
) {
  // Tilstand (State)

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Effekter (Effects)

  /**
   * Oppdaterer input-verdien når value-prop endres
   */
  useEffect(() => {
    setInputValue(value)
  }, [value])

  /**
   * Setter fokus på input-feltet når popover åpnes
   */
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Beregninger

  // Filtrerer aktivitetstyper basert på søkeinput
  const filteredActivities = ACTIVITY_TYPES.filter((activity) =>
    activity.toLowerCase().includes(inputValue.toLowerCase()),
  )

  // Rendering

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between border-gray-300 font-medium text-gray-800 h-10",
            error && "border-red-500",
            className,
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Søk eller skriv aktivitetstype..."
            value={inputValue}
            onValueChange={setInputValue}
            ref={inputRef}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-2 px-4">
                <p className="text-sm text-gray-500">Ingen treff. Trykk Enter for å legge til "{inputValue}"</p>
                <Button
                  variant="ghost"
                  className="w-full mt-2 justify-start text-sm"
                  onClick={() => {
                    onValueChange(inputValue)
                    setOpen(false)
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Legg til "{inputValue}"
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredActivities.map((activity) => (
                <CommandItem
                  key={activity}
                  value={activity}
                  onSelect={() => {
                    onValueChange(activity)
                    setInputValue(activity)
                    setOpen(false)
                  }}
                >
                  {activity}
                  {value === activity && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})

