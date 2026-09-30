import type { Metadata } from "next"
import "../index.css"
import { AppProvider } from "./App"

export const metadata: Metadata = {
  title: "Biblioteca Horizonte · Gestión de recursos",
  description: "Prototipo navegable de Biblioteca Horizonte",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
