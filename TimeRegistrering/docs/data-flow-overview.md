# OVERSIKT OVER DATAFLYT I TIMEREGISTRERINGSSYSTEMET

Dette dokumentet beskriver hvordan data flyter gjennom applikasjonen,
hvilke komponenter som interagerer med hverandre, og viktige avhengigheter.

## HOVEDKOMPONENTER OG DATAFLYT

1. app/page.tsx (TimeTrackingPage)
   - Hovedkomponenten som orkestrerer hele timeregistreringssystemet
   - Inneholder all tilstand (state) og håndterere for å endre denne tilstanden
   - Sender data og håndterere nedover til underkomponenter

2. components/weekly-time-table.tsx (WeeklyTimeTable)
   - Viser en ukentlig oversikt over tidsregistreringer
   - Mottar data fra TimeTrackingPage: timeEntries, cases, selectedDate
   - Sender hendelser oppover: onUpdateEntry, onDeleteEntry

3. components/unconfirmed-suggestions.tsx (UnconfirmedSuggestions)
   - Viser og håndterer ubekreftede forslag
   - Mottar data fra TimeTrackingPage: suggestions, cases
   - Sender hendelser oppover: onConfirm, onDelete, onUpdate

4. components/case-search-select.tsx (CaseSearchSelect)
   - Komponent for å søke og velge saker
   - Brukes i både WeeklyTimeTable og UnconfirmedSuggestions
   - Mottar data: cases, value
   - Sender hendelser oppover: onValueChange, onAddNewCase

5. components/activity-combobox.tsx (ActivityCombobox)
   - Komponent for å velge aktivitetstype
   - Brukes i både WeeklyTimeTable og UnconfirmedSuggestions
   - Mottar data: value
   - Sender hendelser oppover: onValueChange

## DATAMODELLER

Hovedmodellene i systemet er definert i types/time-tracking.ts:

1. TimeEntry - Representerer en tidsregistrering
   \`\`\`typescript
   {
     id: string
     caseId: string        // ID til saken registreringen tilhører
     date: Date            // Dato for registreringen
     hours: number         // Antall timer
     description: string   // Beskrivelse av arbeidet
     activityType: string  // Type aktivitet (f.eks. "Juridisk bistand")
     billable: boolean     // Om tiden er fakturerbar
     fromSuggestion?: boolean // Om registreringen ble opprettet fra et forslag
   }
   \`\`\`

2. Case - Representerer en sak
   \`\`\`typescript
   {
     id: string            // Unik ID for saken
     name: string          // Navn på saken
     caseNumber: string    // Saksnummer
     clientName: string    // Klientens navn
   }
   \`\`\`

3. UnconfirmedSuggestion - Representerer et ubekreftet forslag
   \`\`\`typescript
   {
     id: string            // Unik ID for forslaget
     caseId: string        // ID til saken forslaget tilhører
     type: string          // Type aktivitet
     description: string   // Beskrivelse av arbeidet
     hours: number         // Antall timer
     date: Date            // Dato for forslaget
     confirmed: boolean    // Om forslaget er bekreftet
   }
   \`\`\`

## DATAFLYT

1. Initialisering
   - app/page.tsx henter data fra dummy-data.ts (i en reell app ville dette være API-kall)
   - Data lagres i tilstand (useState): timeEntries, cases, unconfirmedSuggestions

2. Visning
   - Data sendes nedover til WeeklyTimeTable og UnconfirmedSuggestions
   - Komponentene rendrer UI basert på mottatt data

3. Brukerinteraksjon
   - Når brukeren interagerer med UI (f.eks. redigerer en registrering):
     a. Komponenten kaller en handler-funksjon (f.eks. onUpdateEntry)
     b. Handler-funksjonen i app/page.tsx oppdaterer tilstanden
     c. Oppdatert tilstand sendes nedover til komponentene igjen

4. Dataflyt for tidsregistrering
   - Ny registrering:
     a. Bruker fyller ut skjema i app/page.tsx
     b. handleAddEntry oppretter ny TimeEntry
     c. TimeEntry legges til i timeEntries-tilstanden
     d. WeeklyTimeTable oppdateres med ny registrering

   - Redigering av registrering:
     a. Bruker klikker på registrering i WeeklyTimeTable
     b. WeeklyTimeTable viser redigeringsskjema
     c. Bruker endrer data og klikker Lagre
     d. handleSaveEdit i WeeklyTimeTable kaller onUpdateEntry
     e. onUpdateEntry i app/page.tsx oppdaterer timeEntries-tilstanden

   - Sletting av registrering:
     a. Bruker klikker Slett i redigeringsskjema
     b. handleDeleteEntry i WeeklyTimeTable kaller onDeleteEntry
     c. onDeleteEntry i app/page.tsx fjerner registreringen fra timeEntries-tilstanden

5. Dataflyt for ubekreftede forslag
   - Bekreftelse av forslag:
     a. Bruker klikker Bekreft på et forslag
     b. handleConfirmSuggestion i UnconfirmedSuggestions kaller onConfirm
     c. onConfirm i app/page.tsx:
        - Oppretter ny TimeEntry basert på forslaget
        - Legger til TimeEntry i timeEntries-tilstanden
        - Fjerner forslaget fra unconfirmedSuggestions-tilstanden

   - Redigering av forslag:
     a. Bruker klikker Rediger på et forslag
     b. UnconfirmedSuggestions viser redigeringsskjema
     c. Bruker endrer data og klikker Lagre
     d. handleSaveEdit i UnconfirmedSuggestions kaller onUpdate
     e. onUpdate i app/page.tsx oppdaterer unconfirmedSuggestions-tilstanden

   - Sletting av forslag:
     a. Bruker klikker Slett på et forslag
     b. UnconfirmedSuggestions kaller onDelete
     c. onDelete i app/page.tsx fjerner forslaget fra unconfirmedSuggestions-tilstanden

## VIKTIGE AVHENGIGHETER

1. date-fns
   - Brukes for datoformatering og -manipulering
   - Viktig for ukentlig visning og datoberegninger

2. shadcn/ui komponenter
   - Brukes for UI-elementer som knapper, input-felt, etc.
   - Gir konsistent design og tilgjengelighet

3. lucide-react
   - Brukes for ikoner

4. Tailwind CSS
   - Brukes for styling

5. React Hooks
   - useState: Håndterer tilstand i komponentene
   - useEffect: Håndterer sideeffekter som fokushåndtering
   - useMemo: Optimaliserer beregninger som ukegenerering
   - useRef: Håndterer referanser til DOM-elementer

## VIKTIGE ASPEKTER VED SYSTEMET

1. Tilgjengelighet (Accessibility)
   - Tastaturnavigasjon er implementert for alle interaktive elementer
   - ARIA-attributter brukes for å forbedre skjermleseropplevelsen
   - Fokushåndtering sikrer at brukeren alltid vet hvor de er

2. Responsivt design
   - UI tilpasser seg ulike skjermstørrelser
   - Mobile-first tilnærming med responsive grid-layouts

3. Brukeropplevelse
   - Toast-meldinger gir feedback på brukerhandlinger
   - Visuell markering av nylig lagt til registreringer
   - Kategorisering av forslag for bedre oversikt

4. Ytelse
   - Memoization av beregninger for å unngå unødvendig re-rendering
   - Effektiv håndtering av store datamengder

5. Vedlikeholdbarhet
   - Modulær kodestruktur med klart definerte ansvarsområder
   - Konsistent navngivning og kodestruktur
   - Omfattende kommentering for å forklare kompleks logikk

## FREMTIDIGE FORBEDRINGER

1. Server-side databehandling
   - Implementere API-endepunkter for CRUD-operasjoner
   - Bruke React Query eller SWR for datauthenting og -caching

2. Autentisering og autorisasjon
   - Implementere brukerinnlogging
   - Rollebasert tilgangskontroll for ulike brukertyper

3. Offline-støtte
   - Implementere service workers for offline-funksjonalitet
   - Lokal lagring av data med synkronisering når online

4. Avansert søk og filtrering
   - Implementere mer avanserte søke- og filtreringsmuligheter
   - Lagre brukerpreferanser for filtre

5. Rapportering og analyse
   - Implementere dashboards for visualisering av timedata
   - Eksport av data til ulike formater (Excel, PDF, etc.)

