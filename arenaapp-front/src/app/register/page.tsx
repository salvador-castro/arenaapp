// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\register\page.tsx
'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [numero, setNumero] = useState('') // teléfono
  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [passwordRepetida, setPasswordRepetida] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordRepetida, setShowPasswordRepetida] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const passwordLengthOk = password.length >= 8
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[\W_]/.test(password)
  const allPasswordRulesOk =
    passwordLengthOk && hasLower && hasUpper && hasNumber && hasSymbol

  const passwordsMismatch =
    passwordRepetida.length > 0 && passwordRepetida !== password

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError('Debés completar nombre, apellido y email.')
      setLoading(false)
      return
    }

    if (!password || !passwordRepetida) {
      setError('Debés completar ambos campos de contraseña.')
      setLoading(false)
      return
    }

    if (passwordsMismatch) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (!allPasswordRulesOk) {
      setError('La contraseña no cumple con todos los requisitos de seguridad.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: numero || null,
          tipo_documento: null,
          numero_documento: null,
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'No se pudo registrar')
        setLoading(false)
        return
      }

      router.push('/login')
    } catch (err) {
      setError('Error al conectar con el servidor')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-700 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Crear cuenta
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div>
            <label className="block text-sm mb-1">Nombre *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm mb-1">Apellido *</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Tu apellido"
              required
            />
          </div>

          {/* Teléfono (opcional) */}
          <div>
            <label className="block text-sm mb-1">Número telefónico (opcional)</label>
            <input
              type="tel"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Tu número telefónico"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email *</label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="block text-sm mb-1">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? (
                  // ojo abierto
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  // ojo tachado
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.97 9.97 0 012.277-3.915M9.88 9.88A3 3 0 0114.12 14.12M17.94 17.94A9.97 9.97 0 0021.543 12a10.05 10.05 0 00-4.334-5.848M6.1 6.1l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* REPETIR CONTRASEÑA */}
          <div>
            <label className="block text-sm mb-1">Repetir contraseña</label>
            <div className="relative">
              <input
                type={showPasswordRepetida ? 'text' : 'password'}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={passwordRepetida}
                onChange={(e) => setPasswordRepetida(e.target.value)}
                placeholder="Repetí tu contraseña"
                required
              />

              <button
                type="button"
                onClick={() => setShowPasswordRepetida(!showPasswordRepetida)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPasswordRepetida ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.97 9.97 0 012.277-3.915M9.88 9.88A3 3 0 0114.12 14.12M17.94 17.94A9.97 9.97 0 0021.543 12a10.05 10.05 0 00-4.334-5.848M6.1 6.1l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>

            {passwordsMismatch && (
              <p className="mt-1 text-[11px] text-red-400">
                Las contraseñas no coinciden.
              </p>
            )}
          </div>

          {/* Checklist de requisitos */}
          <div className="mt-2 rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2">
            <p className="text-[11px] text-slate-400 mb-1">
              La contraseña debe cumplir con:
            </p>
            <ul className="text-[11px] space-y-0.5">
              <li
                className={
                  passwordLengthOk ? 'text-emerald-400' : 'text-slate-400'
                }
              >
                {passwordLengthOk ? '✔' : '•'} Al menos 8 caracteres
              </li>
              <li className={hasLower ? 'text-emerald-400' : 'text-slate-400'}>
                {hasLower ? '✔' : '•'} Una letra minúscula
              </li>
              <li className={hasUpper ? 'text-emerald-400' : 'text-slate-400'}>
                {hasUpper ? '✔' : '•'} Una letra mayúscula
              </li>
              <li className={hasNumber ? 'text-emerald-400' : 'text-slate-400'}>
                {hasNumber ? '✔' : '•'} Un número
              </li>
              <li className={hasSymbol ? 'text-emerald-400' : 'text-slate-400'}>
                {hasSymbol ? '✔' : '•'} Un símbolo (por ejemplo: !@#$%)
              </li>
            </ul>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold py-2 mt-2 hover:bg-emerald-400 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
