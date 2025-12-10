// C:\Users\salvaCastro\Desktop\arenaapp-front\src\context\AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import type { User } from '@/lib/user'
import { getCurrentUser } from '@/lib/user'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Al montar: sincronizar localStorage con el backend
  useEffect(() => {
    let cancelled = false

    async function syncAuth() {
      try {
        let storedUser: User | null = null

        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('arenaapp_user')
          if (raw) {
            try {
              storedUser = JSON.parse(raw) as User
              console.log(
                'AuthProvider: usuario desde localStorage',
                storedUser
              )
            } catch (e) {
              console.error('AuthProvider: JSON inválido en localStorage', e)
            }
          } else {
            console.log('AuthProvider: no hay usuario en localStorage')
          }
        }

        // Preguntarle al backend si la cookie sigue siendo válida
        const backendUser = await getCurrentUser()

        if (cancelled) return

        if (backendUser) {
          console.log('AuthProvider: backend confirmó sesión', backendUser)
          setUser(backendUser)
          if (typeof window !== 'undefined') {
            localStorage.setItem('arenaapp_user', JSON.stringify(backendUser))
          }
        } else {
          console.log(
            'AuthProvider: backend NO confirmó sesión, limpiando usuario local'
          )
          setUser(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('arenaapp_user')
          }
        }
      } catch (error) {
        console.error('AuthProvider: error sincronizando sesión', error)
        setUser(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('arenaapp_user')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    syncAuth()

    return () => {
      cancelled = true
    }
  }, [])

  function login(user: User) {
    console.log('AuthContext.login: seteando usuario', user)
    setUser(user)

    if (typeof window !== 'undefined') {
      localStorage.setItem('arenaapp_user', JSON.stringify(user))
      // el token real está en la cookie httpOnly del backend
    }
  }

  async function logout() {
    console.log('AuthContext.logout: limpiando usuario')

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`
    console.log('Logout -> URL:', url)

    try {
      await fetch(url, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error(
        'AuthContext.logout: error llamando al endpoint de logout',
        error
      )
    }

    setUser(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('arenaapp_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
