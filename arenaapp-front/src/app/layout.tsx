// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\layout.tsx
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Providers from './Providers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { LocaleProvider } from '@/context/LocaleContext'
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt'

export const metadata: Metadata = {
  title: "Arena Press",
  description: "ALL YOU NEED TO KNOW",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arena Press",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LocaleProvider>
          <Providers>
            {children}
            <PwaInstallPrompt />
          </Providers>
        </LocaleProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
