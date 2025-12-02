// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\Providers.tsx
'use client'

import type { ReactNode } from 'react'
import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider } from '@/context/ThemeContext'

export default function Providers ({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </ThemeProvider>
  )
}
