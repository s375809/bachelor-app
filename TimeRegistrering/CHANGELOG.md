# Change Log

## [1.1.0] - 2025-03-12

### Added
- Ny `CaseSearchSelect`-komponent for dynamisk sakssøk
- Forbedret visning av saksinformasjon i ubekreftede forslag
- Lagt til badges for å tydelig vise saksnummer, klientnavn og sakstype
- Utvidet Case-type med flere felter (caseNumber, clientName, caseType)
- Utvidet UnconfirmedSuggestion-type med caseNumber og clientName-felter

### Endret
- Oppdatert `app/page.tsx` til å bruke den nye CaseSearchSelect-komponenten
- Forbedret INITIAL_CASES-data med nye påkrevde felter
- Endret data for ubekreftede forslag til å inkludere saksnumre og klientnavn
- Oppdatert UnconfirmedSuggestions-komponenten for å vise formatert saksinformasjon
- Forbedret redigeringsdialogen i UnconfirmedSuggestions til å bruke den nye søkekomponenten

### Endrede filer
- `types/time-tracking.ts`: Utvidet typedefinisjoner
- `components/case-search-select.tsx`: Ny komponent
- `components/unconfirmed-suggestions.tsx`: Oppdatert formatering og visning
- `app/page.tsx`: Oppdatert til å bruke nye komponenter og datastruktur

