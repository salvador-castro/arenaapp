// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\login\page.tsx

'use client'

import { FormEvent, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/lib/user'
import { useLocale } from '@/context/LocaleContext'

// 🔹 API base unificada, con fallback a localhost
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

// 🔹 Textos por idioma
const LOGIN_TEXTS = {
  es: {
    title: 'Iniciar sesión',
    emailLabel: 'Email',
    emailPlaceholder: 'tu@email.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: '••••••••',
    submitIdle: 'Entrar',
    submitLoading: 'Entrando...',
    noAccount: '¿No tenés cuenta?',
    createAccount: 'Crear cuenta',
    helpText: '¿Inconvenientes para ingresar? Mandanos un mail a:',
    helpMail: 'ayuda@arenapress.app',
    errorGeneric: 'Error al iniciar sesión',
    errorConnection: 'Error de conexión',
  },
  en: {
    title: 'Log in',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    submitIdle: 'Log in',
    submitLoading: 'Logging in...',
    noAccount: "Don't have an account?",
    createAccount: 'Create account',
    helpText: 'Having trouble logging in? Send us an email at:',
    helpMail: 'ayuda@arenapress.app',
    errorGeneric: 'Error while logging in',
    errorConnection: 'Connection error',
  },
  pt: {
    title: 'Entrar',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    passwordLabel: 'Senha',
    passwordPlaceholder: '••••••••',
    submitIdle: 'Entrar',
    submitLoading: 'Entrando...',
    noAccount: 'Não tem conta?',
    createAccount: 'Criar conta',
    helpText: 'Problemas para entrar? Envie um e-mail para:',
    helpMail: 'ayuda@arenapress.app',
    errorGeneric: 'Erro ao entrar',
    errorConnection: 'Erro de conexão',
  },
} as const

// 👇 Ruta /login (wrapper con Suspense)
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}

// 👇 Componente principal con lógica + UI
function LoginPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const { locale } = useLocale()

  // Elegimos el set de textos según idioma, default ES
  const t = LOGIN_TEXTS[locale as keyof typeof LOGIN_TEXTS] ?? LOGIN_TEXTS.es

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // guarda cookie httpOnly
      })

      const data = await res.json()
      console.log('Respuesta login FRONT:', res.status, data)

      if (!res.ok) {
        setError(data.error || data.message || t.errorGeneric)
        return
      }

      const user: User = {
        id: data.user.id,
        nombre: data.user.nombre,
        apellido: data.user.apellido,
        email: data.user.email,
        rol: data.user.rol,
        avatar_url: data.user.avatar_url ?? null,
      }

      console.log('Login OK FRONT, user armado:', user)

      // Guardar en contexto + localStorage
      login(user)

      // Usar redirect si vino en la query, sino ir al dashboard
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err) {
      console.error('Error en fetch login:', err)
      setError(t.errorConnection)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-50">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">{t.title}</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">{t.emailLabel}</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">{t.passwordLabel}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold py-2 mt-2 hover:bg-emerald-400 transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.submitLoading : t.submitIdle}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-4">
          {t.noAccount}{' '}
          <Link href="/register" className="text-emerald-400 hover:underline">
            {t.createAccount}
          </Link>
        </p>

        <p className="text-xs text-center text-slate-400 mt-4">
          {t.helpText}{' '}
          <a
            href={`mailto:${t.helpMail}`}
            className="text-emerald-400 hover:underline"
          >
            {t.helpMail}
          </a>
        </p>
      </div>
    </main>
  )
}
