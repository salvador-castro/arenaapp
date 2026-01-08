// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\layout.tsx
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './Providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { LocaleProvider } from '@/context/LocaleContext'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LocaleProvider>
          <Providers>{children}</Providers>
        </LocaleProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
