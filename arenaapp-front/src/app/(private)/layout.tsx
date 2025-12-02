import type { ReactNode } from 'react'
import AuthGuard from '@/components/AuthGuard'

export default function PrivateLayout ({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>
}
