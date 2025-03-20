import type { Metadata } from "next";
import "./globals.css";

// Metadata for applikasjonen (tittel og beskrivelse)
export const metadata: Metadata = {
  title: "App",
  description: "Applikasjon for timeregistrering",
};

// Rotlayout for applikasjonen
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}