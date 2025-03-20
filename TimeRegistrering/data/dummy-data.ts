import type { Case, TimeEntry, UnconfirmedSuggestion } from "@/types/time-tracking"

// Get current date and week
const today = new Date()
const currentWeekStart = new Date(today)
currentWeekStart.setDate(today.getDate() - today.getDay() + 1) // Start of current week (Monday)

// Only include the specified cases
export const CASES: Case[] = [
  {
    id: "sak9",
    name: "Drap",
    caseNumber: "sak 9",
    clientName: "Per Gunnar",
  },
  {
    id: "sak33",
    name: "Barnevern",
    caseNumber: "sak 33",
    clientName: "Fatima Khan",
  },
  {
    id: "sak286",
    name: "Mishandling i nære relasjoner",
    caseNumber: "sak 286",
    clientName: "Mads Thomassen",
  },
  {
    id: "sak287",
    name: "Omsorgsovertagelse",
    caseNumber: "sak 287",
    clientName: "Gunnar Aage",
  },
  {
    id: "sak14",
    name: "Skattesvik",
    caseNumber: "sak 14",
    clientName: "Abdi Mohammed",
  },
  {
    id: "sak43",
    name: "Foreldreansvar, samvær",
    caseNumber: "sak 43",
    clientName: "Aisha Hakeem",
  },
]

// Create time entries based on the specified cases for the current week only
export const TIME_ENTRIES: TimeEntry[] = [
  // Current week entries - Monday
  {
    id: "entry-current-1",
    caseId: "sak9",
    date: new Date(currentWeekStart),
    hours: 3.5,
    description: "Møte med klient",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-2",
    caseId: "sak9",
    date: new Date(currentWeekStart),
    hours: 2.0,
    description: "Forberedelse til rettsmøte",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-3",
    caseId: "sak33",
    date: new Date(currentWeekStart),
    hours: 1.5,
    description: "Gjennomgang av dokumenter",
    activityType: "Juridisk bistand",
    billable: true,
  },

  // Current week entries - Tuesday
  {
    id: "entry-current-4",
    caseId: "sak286",
    date: new Date(currentWeekStart.getTime() + 86400000), // +1 day
    hours: 4.0,
    description: "Rettsmøte",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-5",
    caseId: "sak286",
    date: new Date(currentWeekStart.getTime() + 86400000), // +1 day
    hours: 2.0,
    description: "Etterarbeid rettsmøte",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-6",
    caseId: "sak14",
    date: new Date(currentWeekStart.getTime() + 86400000), // +1 day
    hours: 1.0,
    description: "Telefonsamtale med klient",
    activityType: "Mediakommunikasjon",
    billable: true,
  },

  // Current week entries - Wednesday
  {
    id: "entry-current-7",
    caseId: "sak287",
    date: new Date(currentWeekStart.getTime() + 172800000), // +2 days
    hours: 3.0,
    description: "Møte med barnevernet",
    activityType: "Møte med skatt",
    billable: true,
  },
  {
    id: "entry-current-8",
    caseId: "sak287",
    date: new Date(currentWeekStart.getTime() + 172800000), // +2 days
    hours: 1.5,
    description: "Notat fra møte",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-9",
    caseId: "sak43",
    date: new Date(currentWeekStart.getTime() + 172800000), // +2 days
    hours: 2.5,
    description: "Forberedelse til mekling",
    activityType: "Juridisk bistand",
    billable: true,
  },

  // Current week entries - Thursday
  {
    id: "entry-current-10",
    caseId: "sak43",
    date: new Date(currentWeekStart.getTime() + 259200000), // +3 days
    hours: 4.0,
    description: "Mekling",
    activityType: "Mekling",
    billable: true,
  },
  {
    id: "entry-current-11",
    caseId: "sak43",
    date: new Date(currentWeekStart.getTime() + 259200000), // +3 days
    hours: 1.0,
    description: "Oppsummering etter mekling",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-12",
    caseId: "sak9",
    date: new Date(currentWeekStart.getTime() + 259200000), // +3 days
    hours: 2.0,
    description: "Gjennomgang av bevis",
    activityType: "Juridisk bistand",
    billable: true,
  },

  // Current week entries - Friday
  {
    id: "entry-current-13",
    caseId: "sak33",
    date: new Date(currentWeekStart.getTime() + 345600000), // +4 days
    hours: 3.0,
    description: "Møte med klient",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-14",
    caseId: "sak33",
    date: new Date(currentWeekStart.getTime() + 345600000), // +4 days
    hours: 2.0,
    description: "Utarbeidelse av prosesskriv",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-15",
    caseId: "sak33",
    date: new Date(currentWeekStart.getTime() + 345600000), // +4 days
    hours: 1.5,
    description: "Korrespondanse med motpart",
    activityType: "Juridisk bistand",
    billable: true,
  },

  // Current week entries - Saturday
  {
    id: "entry-current-16",
    caseId: "sak9",
    date: new Date(currentWeekStart.getTime() + 432000000), // +5 days
    hours: 2.5,
    description: "Forberedelse til vitneforklaring",
    activityType: "Juridisk bistand",
    billable: true,
  },
  {
    id: "entry-current-17",
    caseId: "sak14",
    date: new Date(currentWeekStart.getTime() + 432000000), // +5 days
    hours: 1.0,
    description: "Gjennomgang av dokumentasjon",
    activityType: "Undersøkelser",
    billable: true,
  },

  // Current week entries - Sunday
  {
    id: "entry-current-18",
    caseId: "sak286",
    date: new Date(currentWeekStart.getTime() + 518400000), // +6 days
    hours: 3.0,
    description: "Forberedelse til rettssak",
    activityType: "Juridisk bistand",
    billable: false,
  },
  {
    id: "entry-current-19",
    caseId: "sak287",
    date: new Date(currentWeekStart.getTime() + 518400000), // +6 days
    hours: 2.0,
    description: "Gjennomgang av saksdokumenter",
    activityType: "Juridisk bistand",
    billable: true,
  },
]

// Create unconfirmed suggestions for the current week only
export const UNCONFIRMED_SUGGESTIONS: UnconfirmedSuggestion[] = [
  // 5 Completed suggestions - spread across the current week
  {
    id: "sugg1",
    caseId: "sak9",
    type: "Reisetid",
    description: "Sendt brev til motpart",
    hours: 0.3,
    date: new Date(currentWeekStart), // Monday
    confirmed: false,
  },
  {
    id: "sugg2",
    caseId: "sak33",
    type: "Juridisk bistand",
    description: "Brev til politiet",
    hours: 2.0,
    date: new Date(currentWeekStart.getTime() + 86400000), // Tuesday
    confirmed: false,
  },
  {
    id: "sugg3",
    caseId: "sak286",
    type: "Juridisk bistand",
    description: "Epost mottatt: Saksinfo",
    hours: 1.0,
    date: new Date(currentWeekStart.getTime() + 172800000), // Wednesday
    confirmed: false,
  },
  {
    id: "sugg4",
    caseId: "sak9",
    type: "Mediakommunikasjon",
    description: "Samtaler med klient",
    hours: 4.0,
    date: new Date(currentWeekStart.getTime() + 259200000), // Thursday
    confirmed: false,
  },
  {
    id: "sugg5",
    caseId: "sak287",
    type: "Møte med skatt",
    description: "Korrespondanse",
    hours: 7.0,
    date: new Date(currentWeekStart.getTime() + 345600000), // Friday
    confirmed: false,
  },

  // 4 Partially Completed suggestions - spread across the current week
  {
    id: "sugg6",
    caseId: "sak14",
    type: "",
    description: "Møte: Rettsmøte",
    hours: 5.0,
    date: new Date(currentWeekStart), // Monday
    confirmed: false,
  },
  {
    id: "sugg7",
    caseId: "sak287",
    type: "Forhandlinger",
    description: "",
    hours: 2.0,
    date: new Date(currentWeekStart.getTime() + 86400000), // Tuesday
    confirmed: false,
  },
  {
    id: "sugg8",
    caseId: "sak286",
    type: "Juridisk bistand",
    description: "Journalist",
    hours: 0,
    date: new Date(currentWeekStart.getTime() + 172800000), // Wednesday
    confirmed: false,
  },
  {
    id: "sugg9",
    caseId: "",
    type: "Mediakommunikasjon",
    description: "Epost sendt: Saksinfo",
    hours: 0.5,
    date: new Date(currentWeekStart.getTime() + 259200000), // Thursday
    confirmed: false,
  },

  // 4 Spam suggestions - spread across the current week
  {
    id: "sugg10",
    caseId: "",
    type: "",
    description: "",
    hours: 0,
    date: new Date(currentWeekStart.getTime() + 345600000), // Friday
    confirmed: false,
  },
  {
    id: "sugg11",
    caseId: "",
    type: "",
    description: "",
    hours: 0,
    date: new Date(currentWeekStart.getTime() + 432000000), // Saturday
    confirmed: false,
  },
  {
    id: "sugg12",
    caseId: "",
    type: "",
    description: "",
    hours: 0,
    date: new Date(currentWeekStart.getTime() + 518400000), // Sunday
    confirmed: false,
  },
  {
    id: "sugg13",
    caseId: "",
    type: "",
    description: "",
    hours: 0,
    date: new Date(currentWeekStart), // Monday
    confirmed: false,
  },
]

// Lawyer information
export const LAWYERS = [
  {
    id: "lawyer1",
    name: "Fatima Khan",
    email: "fatima.khan@lawfirm.no",
    role: "Advokat",
  },
  {
    id: "lawyer2",
    name: "Mads Thomassen",
    email: "mads.thomassen@lawfirm.no",
    role: "Advokat",
  },
]

