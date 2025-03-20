"use client"

import { useState, useRef, useEffect, forwardRef } from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Case } from "@/types/time-tracking"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CaseSearchSelectProps {
  cases: Case[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  error?: boolean
  onAddNewCase?: (newCaseData: Omit<Case, "id">) => void
}

export const CaseSearchSelect = forwardRef<HTMLButtonElement, CaseSearchSelectProps>(function CaseSearchSelect(
  { cases, value, onValueChange, placeholder = "Velg sak", className, error, onAddNewCase },
  ref,
) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isNewCaseDialogOpen, setIsNewCaseDialogOpen] = useState(false)
  const [newCaseName, setNewCaseName] = useState("")
  const [newCaseNumber, setNewCaseNumber] = useState("")
  const [newClientName, setNewClientName] = useState("")

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      caseItem.caseNumber.toLowerCase().includes(inputValue.toLowerCase()) ||
      caseItem.clientName.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const handleCreateNewCase = () => {
    if (newCaseName && newCaseNumber && newClientName && onAddNewCase) {
      onAddNewCase({
        name: newCaseName,
        caseNumber: newCaseNumber,
        clientName: newClientName,
      })
      setIsNewCaseDialogOpen(false)
      setNewCaseName("")
      setNewCaseNumber("")
      setNewClientName("")
      setOpen(false)
    }
  }

  return (
    <>
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
            {value ? cases.find((caseItem) => caseItem.id === value)?.name || placeholder : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0">
          <Command>
            <CommandInput
              placeholder="Søk etter sak..."
              value={inputValue}
              onValueChange={setInputValue}
              ref={inputRef}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-2 px-4 flex flex-col gap-2">
                  <p className="text-sm text-gray-500">Ingen treff.</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      setIsNewCaseDialogOpen(true)
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Opprett ny sak
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredCases.map((caseItem) => (
                  <CommandItem
                    key={caseItem.id}
                    value={caseItem.name}
                    onSelect={() => {
                      onValueChange(caseItem.id)
                      setInputValue(caseItem.name)
                      setOpen(false)
                    }}
                  >
                    {caseItem.name} ({caseItem.caseNumber})
                    {value === caseItem.id && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={isNewCaseDialogOpen} onOpenChange={setIsNewCaseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Opprett ny sak</DialogTitle>
            <DialogDescription>Fyll ut feltene nedenfor for å opprette en ny sak.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Sak
              </label>
              <Input
                id="name"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="caseNumber" className="text-right">
                Saksnummer
              </label>
              <Input
                id="caseNumber"
                value={newCaseNumber}
                onChange={(e) => setNewCaseNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="clientName" className="text-right">
                Klient
              </label>
              <Input
                id="clientName"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Avbryt
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleCreateNewCase}>
              Opprett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

