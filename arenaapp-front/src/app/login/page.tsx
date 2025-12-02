// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\login\page.tsx

'use client'

import { FormEvent, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import type { User } from '@/lib/user' // solo tipo, no afecta en runtime

// 👇 Este es el componente que Next usa para la ruta /login
export default function LoginPage () {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  )
}

// 👇 Acá va todo tu código original (hooks + lógica + JSX)
function LoginPageInner () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  async function handleSubmit (e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include' // para que se guarde la cookie httpOnly
        }
      )

      const data = await res.json()
      console.log('Respuesta login FRONT:', res.status, data)

      if (!res.ok) {
        setError(data.error || data.message || 'Error al iniciar sesión')
        return
      }

      // el backend devuelve los datos del usuario
      const user: User = {
        id: data.user.id,
        nombre: data.user.nombre,
        apellido: data.user.apellido,
        email: data.user.email,
        rol: data.user.rol
        // si tu interfaz User tiene más campos obligatorios, sumalos acá
      }

      console.log('Login OK FRONT, user armado:', user)

      // Guardar en contexto + localStorage
      login(user)

      // Usar redirect si vino en la query, sino ir al dashboard
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err) {
      console.error('Error en fetch login:', err)
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-50'>
      <div className='w-full max-w-md bg-slate-900/60 border border-slate-700 rounded-2xl p-6 shadow-lg'>
        <h1 className='text-2xl font-semibold mb-4 text-center'>
          Iniciar sesión
        </h1>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm mb-1'>Email</label>
            <input
              type='email'
              className='w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='tu@email.com'
              required
            />
          </div>

          <div>
            <label className='block text-sm mb-1'>Contraseña</label>
            <input
              type='password'
              className='w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
            />
          </div>

          {error && <p className='text-red-400 text-xs text-center'>{error}</p>}

          <button
            type='submit'
            className='w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold py-2 mt-2 hover:bg-emerald-400 transition disabled:opacity-50'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className='text-xs text-center text-slate-400 mt-4'>
          ¿No tenés cuenta?{' '}
          <Link href='/register' className='text-emerald-400 hover:underline'>
            Crear cuenta
          </Link>
        </p>

        <p className='text-xs text-center text-slate-400 mt-4'>
          ¿Inconvenientes para ingresar? Mande un mail a:{' '}
          <a
            href='mailto:ayuda@arenapress.app'
            className='text-emerald-400 hover:underline'
          >
            ayuda@arenapress.app
          </a>
        </p>
      </div>
    </main>
  )
}
