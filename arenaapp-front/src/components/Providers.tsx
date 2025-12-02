// C:\Users\salvaCastro\Desktop\arenaapp-front\src\components\Providers.tsx
'use client'

import { AuthProvider } from '@/context/AuthContext'

export function Providers ({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
