'use client' // Dette er en klient-side komponent som krever browser-miljø

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * En wrapper-komponent som tilbyr tema-støtte ved hjelp av `next-themes`.
 * Denne komponenten sikrer at temaet (f.eks. lys/mørk modus) kan brukes i hele applikasjonen.
 *
 * @param {ThemeProviderProps} props - Egenskaper for `ThemeProvider`.
 * @param {React.ReactNode} props.children - Innholdet som skal omsluttes av tema-provideren.
 * @returns {JSX.Element} En React-komponent som tilbyr tema-kontekst.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}