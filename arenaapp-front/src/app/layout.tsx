// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\layout.tsx
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './Providers'
import type { Metadata } from 'next'

export default function RootLayout ({ children }: { children: ReactNode }) {
  return (
    <html lang='es'>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
