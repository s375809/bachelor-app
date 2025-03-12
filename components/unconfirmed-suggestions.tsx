"use client"; // Dette er en klient-side komponent som krever browser-miljø

import React from "react";
import {
  FileText,
  MessagesSquare,
  SearchIcon,
  Trash2,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { nb } from "date-fns/locale"; // Norsk språkpakke for date-fns
import type { UnconfirmedSuggestion } from "@/types/time-tracking";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { Case } from "@/types/time-tracking";

interface UnconfirmedSuggestionsProps {
  suggestions: UnconfirmedSuggestion[]; // Liste over ubekreftede forslag
  onConfirm: (suggestionId: string) => void; // Callback for å bekrefte et forslag
  onDelete: (suggestionId: string) => void; // Callback for å slette et forslag
  onUpdate: (suggestion: UnconfirmedSuggestion) => void; // Callback for å oppdatere et forslag
  cases: Case[]; // Liste over saker som kan knyttes til forslag
}

/**
 * Komponent for å vise og håndtere ubekreftede forslag.
 * Lar brukeren bekrefte, slette, redigere og merke forslag som viktige.
 */
export function UnconfirmedSuggestions({
  suggestions,
  onConfirm,
  onDelete,
  onUpdate,
  cases,
}: UnconfirmedSuggestionsProps) {
  // State for valgte forslag
  const [selectedSuggestions, setSelectedSuggestions] = useState<
    Record<string, boolean>
  >({});
  // State for redigering av forslag
  const [editingSuggestion, setEditingSuggestion] =
    useState<UnconfirmedSuggestion | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Håndterer endring av avkrysningsbokser
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedSuggestions((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  // Bekrefter alle valgte forslag
  const handleConfirmSelected = () => {
    Object.entries(selectedSuggestions).forEach(([id, isSelected]) => {
      if (isSelected) {
        onConfirm(id);
      }
    });
    setSelectedSuggestions({}); // Tilbakestiller valgte forslag
  };

  // Henter riktig ikon basert på aktivitetstype
  const getIconComponent = (type: string) => {
    switch (type) {
      case "Kundemøte":
        return MessagesSquare;
      case "Forskning":
        return SearchIcon;
      case "Dokumentgjennomgang":
        return FileText;
      case "Juridisk Skriving":
        return FileEdit;
      default:
        return FileText;
    }
  };

  // Sjekker om det er noen valgte forslag
  const hasSelectedSuggestions =
    Object.values(selectedSuggestions).some(Boolean);

  // Åpner redigeringsdialogen for et forslag
  const handleEditSuggestion = (suggestion: UnconfirmedSuggestion) => {
    setEditingSuggestion({ ...suggestion });
    setIsEditDialogOpen(true);
  };

  // Lagrer endringer i et forslag
  const handleSaveEdit = () => {
    if (editingSuggestion) {
      onUpdate(editingSuggestion);
      setIsEditDialogOpen(false);
      setEditingSuggestion(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Toppseksjon med tittel og bekreft-knapp */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Ubekreftede forslag</h2>
        {hasSelectedSuggestions && (
          <button
            className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium flex items-center"
            onClick={handleConfirmSelected}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Bekreft valgte
          </button>
        )}
      </div>

      {/* Liste over ubekreftede forslag */}
      <div>
        {suggestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Ingen ubekreftede forslag tilgjengelig
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={cn(
                "p-4 border-b border-gray-200 flex items-center gap-3",
                suggestion.important ? "bg-red-50" : "bg-white"
              )}
            >
              <Checkbox
                id={`check-${suggestion.id}`}
                checked={!!selectedSuggestions[suggestion.id]}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(suggestion.id, checked as boolean)
                }
                className="border-gray-400 h-5 w-5 data-[state=checked]:bg-blue-600"
              />
              <div
                className={cn(
                  "flex flex-1 items-center gap-3 cursor-pointer",
                  suggestion.important ? "text-red-800" : "text-gray-800"
                )}
                onClick={() => handleEditSuggestion(suggestion)}
              >
                {React.createElement(getIconComponent(suggestion.type), {
                  className: "w-5 h-5 flex-shrink-0",
                })}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <div className="font-bold flex items-center text-base">
                        {suggestion.type}
                        {suggestion.important && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                            Viktig
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {suggestion.description}
                      </div>
                    </div>
                    <div className="text-lg font-bold">
                      {suggestion.hours.toFixed(2)}t
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    {format(suggestion.date, "EEEE d. MMMM yyyy", {
                      locale: nb,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"
                  aria-label="Slett forslag"
                  onClick={() => onDelete(suggestion.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                  aria-label="Bekreft forslag"
                  onClick={() => onConfirm(suggestion.id)}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Redigeringsdialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rediger forslag</DialogTitle>
          </DialogHeader>

          {editingSuggestion && (
            <div className="grid gap-4 py-4">
              {/* Dato */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-date" className="text-right font-medium">
                  Dato
                </label>
                <div className="col-span-3 font-medium">
                  {format(editingSuggestion.date, "d. MMMM yyyy", {
                    locale: nb,
                  })}
                </div>
              </div>

              {/* Sak */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-case" className="text-right font-medium">
                  Sak
                </label>
                <div className="col-span-3">
                  <Select
                    value={editingSuggestion.caseId}
                    onValueChange={(value) =>
                      setEditingSuggestion({
                        ...editingSuggestion,
                        caseId: value,
                      })
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
                    value={editingSuggestion.type}
                    onValueChange={(value) =>
                      setEditingSuggestion({
                        ...editingSuggestion,
                        type: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Aktivitetstype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Møte">Juridisk Bistand</SelectItem>
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
                  value={editingSuggestion.description}
                  onChange={(e) =>
                    setEditingSuggestion({
                      ...editingSuggestion,
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
                  value={editingSuggestion.hours}
                  onChange={(e) => {
                    const val = Number.parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setEditingSuggestion({
                        ...editingSuggestion,
                        hours: val,
                      });
                    }
                  }}
                  className="col-span-3"
                />
              </div>

              {/* Viktig */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right font-medium">Viktig</label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox
                    id="edit-important"
                    checked={editingSuggestion.important}
                    onCheckedChange={(checked) =>
                      setEditingSuggestion({
                        ...editingSuggestion,
                        important: checked as boolean,
                      })
                    }
                    className="data-[state=checked]:bg-red-600"
                  />
                  <label
                    htmlFor="edit-important"
                    className="text-sm font-medium"
                  >
                    Merk som viktig
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Dialog-footer med knapper for sletting, avbryting og lagring */}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => {
                if (editingSuggestion) {
                  onDelete(editingSuggestion.id);
                  setIsEditDialogOpen(false);
                  setEditingSuggestion(null);
                }
              }}
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
    </div>
  );
}
