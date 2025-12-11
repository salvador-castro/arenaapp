// src/context/LocaleContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Locale = 'es' | 'en' | 'pt'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function useLocale () {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    throw new Error('useLocale debe usarse dentro de <LocaleProvider>')
  }
  return ctx
}

const STORAGE_KEY = 'arenaapp_locale'

export function LocaleProvider ({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')

  // Leer idioma guardado al montar
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored && ['es', 'en', 'pt'].includes(stored)) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newLocale)
    }
  }

  const value = useMemo(() => ({ locale, setLocale }), [locale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}
