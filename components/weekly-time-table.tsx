"use client"; // Dette er en klient-side komponent som krever browser-miljø

import { useState, useMemo } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { nb } from "date-fns/locale"; // Norsk språkpakke for date-fns
import { cn } from "@/lib/utils";
import type {
  TimeEntry,
  Case,
  UnconfirmedSuggestion,
} from "@/types/time-tracking";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeeklyTimeTableProps {
  selectedDate: Date; // Valgt dato for å vise uken
  timeEntries: TimeEntry[]; // Liste over tidsregistreringer
  cases: Case[]; // Liste over saker
  unconfirmedSuggestions: UnconfirmedSuggestion[]; // Liste over ubekreftede forslag
  onUpdateEntry: (entry: TimeEntry) => void; // Callback for å oppdatere en tidsregistrering
  onDeleteEntry: (entryId: string) => void; // Callback for å slette en tidsregistrering
}

/**
 * Komponent for å vise en ukesoversikt over tidsregistreringer.
 * Lar brukeren redigere og slette registreringer.
 */
export function WeeklyTimeTable({
  selectedDate,
  timeEntries,
  cases,
  unconfirmedSuggestions,
  onUpdateEntry,
  onDeleteEntry,
}: WeeklyTimeTableProps) {
  // State for redigering av tidsregistreringer
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Starter uken på mandag
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  // Genererer ukedagsoverskrifter
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      return {
        dayName: format(date, "EEEE", { locale: nb }).toUpperCase(), // Ukedag (f.eks. "MANDAG")
        dayNumber: format(date, "d", { locale: nb }), // Dagen i måneden (f.eks. "15")
        month: format(date, "MMM", { locale: nb }).toUpperCase(), // Måned (f.eks. "OKT")
        fullDate: date, // Fullt datoobjekt
      };
    });
  }, [weekStart]);

  // Åpner redigeringsdialogen for en tidsregistrering
  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry({ ...entry });
    setIsEditDialogOpen(true);
  };

  // Lagrer endringer i en tidsregistrering
  const handleSaveEdit = () => {
    if (editingEntry) {
      onUpdateEntry(editingEntry);
      setIsEditDialogOpen(false);
      setEditingEntry(null);
    }
  };

  // Sletter en tidsregistrering
  const handleDeleteEdit = () => {
    if (editingEntry) {
      onDeleteEntry(editingEntry.id);
      setIsEditDialogOpen(false);
      setEditingEntry(null);
    }
  };

  // Henter innholdet for en celle i tabellen
  const getCellContent = (caseId: string, date: Date) => {
    // Finner tidsregistreringer for denne saken og datoen
    const entries = timeEntries.filter(
      (entry) => entry.caseId === caseId && isSameDay(entry.date, date)
    );

    if (entries.length === 0) return null;

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={`${entry.id}-${index}`}
            className={cn(
              "p-2 rounded text-sm cursor-pointer",
              entry.billable
                ? "bg-green-500 bg-opacity-20 border border-green-500 text-green-800"
                : "bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-800",
              "hover:opacity-80 transition-opacity"
            )}
            onClick={() => handleEditEntry(entry)}
          >
            <div className="font-bold">{entry.hours.toFixed(2)}t</div>
            <div className="text-xs font-medium">{entry.description}</div>
            {entry.fromSuggestion && (
              <div className="text-xs mt-1 italic">Fra forslag</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Ukesoversiktstabell */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3 text-left font-bold text-gray-700 uppercase text-sm">
                SAK
              </th>
              {weekDays.map((day, i) => (
                <th
                  key={i}
                  className="p-3 text-center font-bold text-gray-700 uppercase text-sm min-w-[120px]"
                >
                  <div>{day.dayName}</div>
                  <div className="font-medium">
                    {day.dayNumber}. {day.month}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => (
              <tr
                key={caseItem.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3">
                  <div className="font-bold text-gray-800">{caseItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {caseItem.description}
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => (
                  <td key={dayIndex} className="p-2">
                    {getCellContent(caseItem.id, day.fullDate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Redigeringsdialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rediger tidsregistrering</DialogTitle>
          </DialogHeader>

          {editingEntry && (
            <div className="grid gap-4 py-4">
              {/* Dato */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-date" className="text-right font-medium">
                  Dato
                </label>
                <div className="col-span-3 font-medium">
                  {format(editingEntry.date, "d. MMMM yyyy", { locale: nb })}
                </div>
              </div>

              {/* Sak */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-case" className="text-right font-medium">
                  Sak
                </label>
                <div className="col-span-3">
                  <Select
                    value={editingEntry.caseId}
                    onValueChange={(value) =>
                      setEditingEntry({ ...editingEntry, caseId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Velg sak" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((caseItem) => (
                        <SelectItem key={caseItem.id} value={caseItem.id}>
                          {caseItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Aktivitet */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="edit-activity"
                  className="text-right font-medium"
                >
                  Aktivitet
                </label>
                <div className="col-span-3">
                  <Select
                    value={editingEntry.activityType}
                    onValueChange={(value) =>
                      setEditingEntry({ ...editingEntry, activityType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Aktivitetstype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Møte">Møte</SelectItem>
                      <SelectItem value="Forskning">Forskning</SelectItem>
                      <SelectItem value="Gjennomgang">Gjennomgang</SelectItem>
                      <SelectItem value="Dokumentskriving">
                        Dokumentskriving
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Beskrivelse */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="edit-description"
                  className="text-right font-medium"
                >
                  Beskrivelse
                </label>
                <Input
                  id="edit-description"
                  value={editingEntry.description}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Timer */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-hours" className="text-right font-medium">
                  Timer
                </label>
                <Input
                  id="edit-hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={editingEntry.hours}
                  onChange={(e) => {
                    const val = Number.parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setEditingEntry({ ...editingEntry, hours: val });
                    }
                  }}
                  className="col-span-3"
                />
              </div>

              {/* Fakturerbar */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Fakturerbar</label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="edit-billable"
                    checked={editingEntry.billable}
                    onCheckedChange={(checked) =>
                      setEditingEntry({
                        ...editingEntry,
                        billable: checked as boolean,
                      })
                    }
                    className="data-[state=checked]:bg-green-600"
                  />
                  <label
                    htmlFor="edit-billable"
                    className="text-sm font-medium"
                  >
                    Merk som fakturerbar
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Dialog-footer med knapper for sletting, avbryting og lagring */}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleDeleteEdit}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Slett
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Avbryt
                </Button>
              </DialogClose>
              <Button onClick={handleSaveEdit}>Lagre endringer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
