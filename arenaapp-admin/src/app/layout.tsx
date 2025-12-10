// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\layout.tsx
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './Providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
