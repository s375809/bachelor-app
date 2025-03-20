// Definerer typene som brukes i applikasjonen

export interface TimeEntry {
  id: string
  caseId: string
  date: Date
  hours: number
  description: string
  activityType: string
  billable: boolean
  fromSuggestion?: boolean // Indikerer om oppføringen ble opprettet fra et forslag
}

export interface Case {
  id: string
  name: string
  caseNumber: string
  clientName: string
}

export interface UnconfirmedSuggestion {
  id: string
  caseId: string
  type: string
  description: string
  hours: number
  date: Date
  confirmed: boolean
}

