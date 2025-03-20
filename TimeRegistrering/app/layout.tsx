import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Timeregistrering",
  description: "Timeregistreringssystem for advokater",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nb">
      <head>
        <title>Timeregistrering</title>
      </head>
      <body>{children}</body>
    </html>
  )
}



import './globals.css'