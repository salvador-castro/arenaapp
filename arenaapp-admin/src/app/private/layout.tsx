// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-admin\src\app\(private)\layout.tsx
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode
}) {
  // Next 16: cookies() es async
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    await jwtVerify(token, SECRET)
    return <>{children}</>
  } catch {
    redirect('/login')
  }
}
