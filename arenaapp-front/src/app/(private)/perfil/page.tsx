// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\(private)\perfil\page.tsx
'use client'

import { FormEvent, useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, type User } from '@/lib/user'
import { CountrySelect } from '../../../components/CountrySelect'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/context/AuthContext'
import UploadAvatar from '@/components/UploadAvatar'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, isLoading, login } = useAuth()

  // estado local para el formulario
  const [user, setUser] = useState<User | null>(null)

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais] = useState('')
  const [telefono, setTelefono] = useState('')
  const [bio, setBio] = useState('')

  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordRepetida, setPasswordRepetida] = useState('')

  const [message, setMessage] = useState<string | null>(null)

  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showRepetida, setShowRepetida] = useState(false)

  const [perfilCargado, setPerfilCargado] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 🔒 Protección de ruta: si no hay user, mandar a login
  useEffect(() => {
    console.log('Perfil: authUser =', authUser, 'isLoading =', isLoading)
    if (!isLoading && !authUser) {
      router.replace('/login?redirect=/perfil')
    }
  }, [authUser, isLoading, router])

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    // 1) Si sigue cargando auth, no hago nada
    if (isLoading) return

    // 2) Si no hay usuario autenticado, no hago nada (ya redirige el otro useEffect)
    if (!authUser) return

    // 3) Si ya traje los datos del perfil una vez, no los vuelvo a pisar
    if (perfilCargado) return

    getCurrentUser().then((u) => {
      if (!u) return

      setUser(u)
      setNombre(u.nombre ?? '')
      setApellido(u.apellido ?? '')
      setEmail(u.email ?? '')
      setCiudad(u.ciudad ?? '')
      setPais(u.pais ?? '')
      setTelefono(u.telefono ?? '')
      setBio(u.bio ?? '')
      setAvatarUrl(u.avatar_url ?? null)

      setPerfilCargado(true) // 👈 clave: no vuelvas a pisar lo que el usuario escriba
    })
  }, [authUser, isLoading, perfilCargado])

  const passwordLengthOk = passwordNueva.length >= 8
  const hasLower = /[a-z]/.test(passwordNueva)
  const hasUpper = /[A-Z]/.test(passwordNueva)
  const hasNumber = /\d/.test(passwordNueva)
  const hasSymbol = /[\W_]/.test(passwordNueva)
  const allPasswordRulesOk =
    passwordLengthOk && hasLower && hasUpper && hasNumber && hasSymbol

  const passwordsMismatch =
    passwordRepetida.length > 0 && passwordRepetida !== passwordNueva

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError('Nombre, apellido y email son obligatorios.')
      setMessage(null)
      return
    }

    if (passwordActual || passwordNueva || passwordRepetida) {
      if (!passwordActual || !passwordNueva || !passwordRepetida) {
        setError(
          'Para cambiar la contraseña completá todos los campos de contraseña.'
        )
        setMessage(null)
        return
      }

      if (passwordsMismatch) {
        setError('Las nuevas contraseñas no coinciden.')
        setMessage(null)
        return
      }

      if (!allPasswordRulesOk) {
        setError(
          'La nueva contraseña no cumple con todos los requisitos de seguridad.'
        )
        setMessage(null)
        return
      }
    }

    setError(null)
    setMessage(null)

    try {
      let finalAvatarUrl = avatarUrl

      // 1) SUBIR AVATAR SI HAY ARCHIVO NUEVO
      if (newAvatarFile) {
        const formData = new FormData()
        formData.append('avatar', newAvatarFile)

        const uploadRes = await fetch(`${API_BASE}/api/auth/perfil/avatar`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        const uploadText = await uploadRes.text()
        let uploadData: any = {}

        // intento parsear JSON, si no se puede uso texto plano
        try {
          uploadData = uploadText ? JSON.parse(uploadText) : {}
        } catch {
          uploadData = { error: uploadText }
        }

        if (!uploadRes.ok) {
          setError(
            uploadData.error ||
              uploadData.message ||
              'Error al subir la foto de perfil'
          )
          setMessage(null)
          return
        }

        let rawAvatarUrl: string | null =
          uploadData.avatar_url || finalAvatarUrl || null

        if (rawAvatarUrl && !rawAvatarUrl.startsWith('http')) {
          rawAvatarUrl = `${API_BASE}${rawAvatarUrl}`
        }

        finalAvatarUrl = rawAvatarUrl
        setAvatarUrl(rawAvatarUrl)
        setNewAvatarFile(null)
      }

      // 2) ACTUALIZAR PERFIL
      const res = await fetch(`${API_BASE}/api/auth/perfil`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          telefono,
          ciudad,
          pais,
          bio,
          avatar_url: finalAvatarUrl,
          passwordActual,
          passwordNueva,
        }),
      })

      const text = await res.text()
      let data: any = {}

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = { error: text }
      }

      if (!res.ok) {
        setError(data.error || data.message || 'Error al actualizar el perfil')
        setMessage(null)
        return
      }

      // 3) OK
      setMessage('Perfil actualizado correctamente ✔️')

      setPasswordActual('')
      setPasswordNueva('')
      setPasswordRepetida('')

      const refreshed = await getCurrentUser()
      if (refreshed) {
        setUser(refreshed)
        setAvatarUrl(refreshed.avatar_url ?? null)
        login(refreshed)
      }
    } catch (err) {
      console.error(err)
      setError('Error de servidor')
      setMessage(null)
    }
  }

  const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  // Mientras se resuelve el estado de auth
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        Cargando...
      </main>
    )
  }

  // Si no hay authUser, el useEffect de arriba ya disparó el redirect.
  // Devolvemos null para no parpadear la UI.
  if (!authUser) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {message && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setMessage(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/60 p-6 shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2 text-emerald-400">
              ¡Cambios guardados!
            </h2>
            <p className="text-sm text-slate-200 mb-4">{message}</p>
            <button
              onClick={() => setMessage(null)}
              className="mt-2 w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold px-4 py-2 text-sm hover:bg-emerald-400 transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tu perfil</h1>
          <p className="text-sm text-slate-400">
            Administrá tu información básica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UserDropdown />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Información personal</h2>

          {!user && (
            <p className="text-sm text-slate-400 mb-4">
              Cargando datos de tu perfil...
            </p>
          )}

          {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

          {user && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar + botón cambiar (componente reutilizable) */}
              <UploadAvatar
                avatarUrl={avatarUrl}
                initials={initials || '👤'}
                onFileSelected={(file, previewUrl) => {
                  setNewAvatarFile(file)
                  setAvatarUrl(previewUrl)
                }}
                onError={(msg) => {
                  setError(msg)
                }}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Teléfono</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm mb-1">Ciudad</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">País</label>
                  <CountrySelect value={pais} onChange={setPais} />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Bio</label>
                <textarea
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Sección de cambio de contraseña */}
              <div className="border-t border-slate-800 pt-4 mt-6">
                <h3 className="text-sm font-semibold mb-3">
                  Cambiar contraseña (opcional)
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* CONTRASEÑA ACTUAL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        type={showActual ? 'text' : 'password'}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowActual(!showActual)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showActual ? (
                          // 👁 Ojo abierto
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
                          // 👁‍🗨 Ojo tachado
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

                  {/* NUEVA CONTRASEÑA */}
                  <div>
                    <label className="block text-sm mb-1">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNueva ? 'text' : 'password'}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowNueva(!showNueva)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNueva ? (
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
                  </div>

                  {/* REPETIR CONTRASEÑA */}
                  <div>
                    <label className="block text-sm mb-1">
                      Repetir nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showRepetida ? 'text' : 'password'}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={passwordRepetida}
                        onChange={(e) => setPasswordRepetida(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowRepetida(!showRepetida)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showRepetida ? (
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
                </div>

                {/* Checklist de requisitos */}
                <div className="mt-3 rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2">
                  <p className="text-[11px] text-slate-400 mb-1">
                    La nueva contraseña debe cumplir con:
                  </p>
                  <ul className="text-[11px] space-y-0.5">
                    <li
                      className={
                        passwordLengthOk ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {passwordLengthOk ? '✔' : '•'} Al menos 8 caracteres
                    </li>
                    <li
                      className={
                        hasLower ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasLower ? '✔' : '•'} Una letra minúscula
                    </li>
                    <li
                      className={
                        hasUpper ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasUpper ? '✔' : '•'} Una letra mayúscula
                    </li>
                    <li
                      className={
                        hasNumber ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasNumber ? '✔' : '•'} Un número
                    </li>
                    <li
                      className={
                        hasSymbol ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasSymbol ? '✔' : '•'} Un símbolo (por ejemplo: !@#$%)
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 text-slate-950 font-semibold px-4 py-2 text-sm hover:bg-emerald-400 transition cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
      <BottomNav />
    </main>
  )
}
