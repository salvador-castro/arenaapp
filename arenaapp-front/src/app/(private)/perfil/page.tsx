// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\(private)\perfil\page.tsx
'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, type User } from '@/lib/user'
import { CountrySelect } from '../../../components/CountrySelect'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/context/AuthContext'
import UploadAvatar from '@/components/UploadAvatar'
import { useLocale } from '@/context/LocaleContext'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

/* -------------------- i18n simple (es, en, pt) -------------------- */

const PROFILE_TEXTS = {
  es: {
    pageTitle: 'Tu perfil',
    pageSubtitle: 'Administrá tu información básica.',
    loadingGlobal: 'Cargando...',
    loadingProfile: 'Cargando datos de tu perfil...',
    modal: {
      title: '¡Cambios guardados!',
      close: 'Cerrar',
    },
    messages: {
      profileUpdated: 'Perfil actualizado correctamente ✔️',
    },
    errors: {
      requiredFields: 'Nombre, apellido y email son obligatorios.',
      passwordAllFields:
        'Para cambiar la contraseña completá todos los campos de contraseña.',
      passwordMismatch: 'Las nuevas contraseñas no coinciden.',
      passwordRules:
        'La nueva contraseña no cumple con todos los requisitos de seguridad.',
      server: 'Error de servidor',
      uploadAvatarDefault: 'Error al subir la foto de perfil',
      updateProfileDefault: 'Error al actualizar el perfil',
    },
    sections: {
      personalInfo: 'Información personal',
      passwordTitle: 'Cambiar contraseña (opcional)',
      passwordCurrent: 'Contraseña actual',
      passwordNew: 'Nueva contraseña',
      passwordRepeat: 'Repetir nueva contraseña',
      passwordChecklistTitle: 'La nueva contraseña debe cumplir con:',
      passwordChecklist: {
        length: 'Al menos 8 caracteres',
        lower: 'Una letra minúscula',
        upper: 'Una letra mayúscula',
        number: 'Un número',
        symbol: 'Un símbolo (por ejemplo: !@#$%)',
      },
      passwordMismatchInline: 'Las contraseñas no coinciden.',
    },
    formLabels: {
      nombre: 'Nombre',
      apellido: 'Apellido',
      email: 'Email',
      telefono: 'Teléfono',
      ciudad: 'Ciudad',
      pais: 'País',
      bio: 'Bio',
    },
    buttons: {
      saveChanges: 'Guardar cambios',
    },
  },
  en: {
    pageTitle: 'Your profile',
    pageSubtitle: 'Manage your basic information.',
    loadingGlobal: 'Loading...',
    loadingProfile: 'Loading your profile data...',
    modal: {
      title: 'Changes saved!',
      close: 'Close',
    },
    messages: {
      profileUpdated: 'Profile updated successfully ✔️',
    },
    errors: {
      requiredFields: 'First name, last name and email are required.',
      passwordAllFields:
        'To change your password, please fill in all password fields.',
      passwordMismatch: 'New passwords do not match.',
      passwordRules:
        'The new password does not meet all security requirements.',
      server: 'Server error',
      uploadAvatarDefault: 'Error uploading profile picture',
      updateProfileDefault: 'Error updating profile',
    },
    sections: {
      personalInfo: 'Personal information',
      passwordTitle: 'Change password (optional)',
      passwordCurrent: 'Current password',
      passwordNew: 'New password',
      passwordRepeat: 'Repeat new password',
      passwordChecklistTitle: 'The new password must meet:',
      passwordChecklist: {
        length: 'At least 8 characters',
        lower: 'One lowercase letter',
        upper: 'One uppercase letter',
        number: 'One number',
        symbol: 'One symbol (for example: !@#$%)',
      },
      passwordMismatchInline: 'Passwords do not match.',
    },
    formLabels: {
      nombre: 'First name',
      apellido: 'Last name',
      email: 'Email',
      telefono: 'Phone',
      ciudad: 'City',
      pais: 'Country',
      bio: 'Bio',
    },
    buttons: {
      saveChanges: 'Save changes',
    },
  },
  pt: {
    pageTitle: 'Seu perfil',
    pageSubtitle: 'Gerencie suas informações básicas.',
    loadingGlobal: 'Carregando...',
    loadingProfile: 'Carregando dados do seu perfil...',
    modal: {
      title: 'Alterações salvas!',
      close: 'Fechar',
    },
    messages: {
      profileUpdated: 'Perfil atualizado com sucesso ✔️',
    },
    errors: {
      requiredFields: 'Nome, sobrenome e e-mail são obrigatórios.',
      passwordAllFields:
        'Para alterar a senha, preencha todos os campos de senha.',
      passwordMismatch: 'As novas senhas não coincidem.',
      passwordRules:
        'A nova senha não cumpre todos os requisitos de segurança.',
      server: 'Erro de servidor',
      uploadAvatarDefault: 'Erro ao enviar foto de perfil',
      updateProfileDefault: 'Erro ao atualizar o perfil',
    },
    sections: {
      personalInfo: 'Informações pessoais',
      passwordTitle: 'Alterar senha (opcional)',
      passwordCurrent: 'Senha atual',
      passwordNew: 'Nova senha',
      passwordRepeat: 'Repetir nova senha',
      passwordChecklistTitle: 'A nova senha deve cumprir:',
      passwordChecklist: {
        length: 'Pelo menos 8 caracteres',
        lower: 'Uma letra minúscula',
        upper: 'Uma letra maiúscula',
        number: 'Um número',
        symbol: 'Um símbolo (por exemplo: !@#$%)',
      },
      passwordMismatchInline: 'As senhas não coincidem.',
    },
    formLabels: {
      nombre: 'Nome',
      apellido: 'Sobrenome',
      email: 'E-mail',
      telefono: 'Telefone',
      ciudad: 'Cidade',
      pais: 'País',
      bio: 'Bio',
    },
    buttons: {
      saveChanges: 'Salvar alterações',
    },
  },
} as const

type Lang = keyof typeof PROFILE_TEXTS

export default function ProfilePage () {
  const router = useRouter()
  const { user: authUser, isLoading, login } = useAuth()
  const { locale } = useLocale()
  const currentLang: Lang =
    locale === 'en' || locale === 'pt' || locale === 'es' ? locale : 'es'
  const t = PROFILE_TEXTS[currentLang]

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
    if (!isLoading && !authUser) {
      router.replace('/login?redirect=/perfil')
    }
  }, [authUser, isLoading, router])

  // Cargar datos del usuario desde el backend
  useEffect(() => {
    if (isLoading) return
    if (!authUser) return
    if (perfilCargado) return

    getCurrentUser().then(u => {
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

      setPerfilCargado(true)
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

  async function handleSubmit (e: FormEvent) {
    e.preventDefault()

    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setError(t.errors.requiredFields)
      setMessage(null)
      return
    }

    if (passwordActual || passwordNueva || passwordRepetida) {
      if (!passwordActual || !passwordNueva || !passwordRepetida) {
        setError(t.errors.passwordAllFields)
        setMessage(null)
        return
      }

      if (passwordsMismatch) {
        setError(t.errors.passwordMismatch)
        setMessage(null)
        return
      }

      if (!allPasswordRulesOk) {
        setError(t.errors.passwordRules)
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

        try {
          uploadData = uploadText ? JSON.parse(uploadText) : {}
        } catch {
          uploadData = { error: uploadText }
        }

        if (!uploadRes.ok) {
          setError(
            uploadData.error ||
              uploadData.message ||
              t.errors.uploadAvatarDefault
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
        setError(data.error || data.message || t.errors.updateProfileDefault)
        setMessage(null)
        return
      }

      // 3) OK
      setMessage(t.messages.profileUpdated)

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
      setError(t.errors.server)
      setMessage(null)
    }
  }

  const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase()

  // Mientras se resuelve el estado de auth
  if (isLoading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-slate-950 text-slate-100'>
        {t.loadingGlobal}
      </main>
    )
  }

  // Si no hay authUser, el useEffect de arriba ya disparó el redirect.
  if (!authUser) {
    return null
  }

  return (
    <main className='min-h-screen bg-slate-950 text-slate-100 pb-12'>
      {message && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
          onClick={() => setMessage(null)}
        >
          <div
            className='w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/60 p-6 shadow-2xl mx-4'
            onClick={e => e.stopPropagation()}
          >
            <h2 className='text-lg font-semibold mb-2 text-emerald-400'>
              {t.modal.title}
            </h2>
            <p className='text-sm text-slate-200 mb-4'>{message}</p>
            <button
              onClick={() => setMessage(null)}
              className='mt-2 w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold px-4 py-2 text-sm hover:bg-emerald-400 transition cursor-pointer'
            >
              {t.modal.close}
            </button>
          </div>
        </div>
      )}

      <header className='border-b border-slate-800 px-4 py-3 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t.pageTitle}</h1>
          <p className='text-sm text-slate-400'>{t.pageSubtitle}</p>
        </div>

        <div className='flex items-center gap-3'>
          <UserDropdown />
        </div>
      </header>

      <div className='max-w-3xl mx-auto px-4 pt-6 pb-12'>
        <section className='rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow'>
          <h2 className='text-lg font-semibold mb-4'>
            {t.sections.personalInfo}
          </h2>

          {!user && (
            <p className='text-sm text-slate-400 mb-4'>{t.loadingProfile}</p>
          )}

          {error && <p className='mb-3 text-xs text-red-400'>{error}</p>}

          {user && (
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Avatar + botón cambiar (componente reutilizable) */}
              <UploadAvatar
                avatarUrl={avatarUrl}
                initials={initials || '👤'}
                onFileSelected={(file, previewUrl) => {
                  setNewAvatarFile(file)
                  setAvatarUrl(previewUrl)
                }}
                onError={msg => {
                  setError(msg)
                }}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.nombre}
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.apellido}
                  </label>
                  <input
                    type='text'
                    required
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    value={apellido}
                    onChange={e => setApellido(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.email}
                  </label>
                  <input
                    type='email'
                    required
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.telefono}
                  </label>
                  <input
                    type='text'
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.ciudad}
                  </label>
                  <input
                    type='text'
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                    value={ciudad}
                    onChange={e => setCiudad(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block text-sm mb-1'>
                    {t.formLabels.pais}
                  </label>
                  <CountrySelect value={pais} onChange={setPais} />
                </div>
              </div>

              <div>
                <label className='block text-sm mb-1'>{t.formLabels.bio}</label>
                <textarea
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>

              {/* Sección de cambio de contraseña */}
              <div className='border-t border-slate-800 pt-4 mt-6'>
                <h3 className='text-sm font-semibold mb-3'>
                  {t.sections.passwordTitle}
                </h3>

                <div className='grid gap-4 md:grid-cols-2'>
                  {/* CONTRASEÑA ACTUAL */}
                  <div className='md:col-span-2'>
                    <label className='block text-sm mb-1'>
                      {t.sections.passwordCurrent}
                    </label>
                    <div className='relative'>
                      <input
                        type={showActual ? 'text' : 'password'}
                        className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        value={passwordActual}
                        onChange={e => setPasswordActual(e.target.value)}
                      />

                      <button
                        type='button'
                        onClick={() => setShowActual(!showActual)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                      >
                        {showActual ? (
                          // ojo abierto
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        ) : (
                          // ojo tachado
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.97 9.97 0 012.277-3.915M9.88 9.88A3 3 0 0114.12 14.12M17.94 17.94A9.97 9.97 0 0021.543 12a10.05 10.05 0 00-4.334-5.848M6.1 6.1l12 12'
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* NUEVA CONTRASEÑA */}
                  <div>
                    <label className='block text-sm mb-1'>
                      {t.sections.passwordNew}
                    </label>
                    <div className='relative'>
                      <input
                        type={showNueva ? 'text' : 'password'}
                        className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        value={passwordNueva}
                        onChange={e => setPasswordNueva(e.target.value)}
                      />

                      <button
                        type='button'
                        onClick={() => setShowNueva(!showNueva)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                      >
                        {showNueva ? (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.97 9.97 0 012.277-3.915M9.88 9.88A3 3 0 0114.12 14.12M17.94 17.94A9.97 9.97 0 0021.543 12a10.05 10.05 0 00-4.334-5.848M6.1 6.1l12 12'
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REPETIR CONTRASEÑA */}
                  <div>
                    <label className='block text-sm mb-1'>
                      {t.sections.passwordRepeat}
                    </label>
                    <div className='relative'>
                      <input
                        type={showRepetida ? 'text' : 'password'}
                        className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        value={passwordRepetida}
                        onChange={e => setPasswordRepetida(e.target.value)}
                      />

                      <button
                        type='button'
                        onClick={() => setShowRepetida(!showRepetida)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200'
                      >
                        {showRepetida ? (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-5 w-5'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a9.97 9.97 0 012.277-3.915M9.88 9.88A3 3 0 0114.12 14.12M17.94 17.94A9.97 9.97 0 0021.543 12a10.05 10.05 0 00-4.334-5.848M6.1 6.1l12 12'
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {passwordsMismatch && (
                      <p className='mt-1 text-[11px] text-red-400'>
                        {t.sections.passwordMismatchInline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checklist de requisitos */}
                <div className='mt-3 rounded-lg bg-slate-900/80 border border-slate-700 px-3 py-2'>
                  <p className='text-[11px] text-slate-400 mb-1'>
                    {t.sections.passwordChecklistTitle}
                  </p>
                  <ul className='text-[11px] space-y-0.5'>
                    <li
                      className={
                        passwordLengthOk ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {passwordLengthOk ? '✔' : '•'}{' '}
                      {t.sections.passwordChecklist.length}
                    </li>
                    <li
                      className={
                        hasLower ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasLower ? '✔' : '•'}{' '}
                      {t.sections.passwordChecklist.lower}
                    </li>
                    <li
                      className={
                        hasUpper ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasUpper ? '✔' : '•'}{' '}
                      {t.sections.passwordChecklist.upper}
                    </li>
                    <li
                      className={
                        hasNumber ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasNumber ? '✔' : '•'}{' '}
                      {t.sections.passwordChecklist.number}
                    </li>
                    <li
                      className={
                        hasSymbol ? 'text-emerald-400' : 'text-slate-400'
                      }
                    >
                      {hasSymbol ? '✔' : '•'}{' '}
                      {t.sections.passwordChecklist.symbol}
                    </li>
                  </ul>
                </div>
              </div>

              <div className='flex items-center gap-3 pt-2'>
                <button
                  type='submit'
                  className='rounded-lg bg-emerald-500 text-slate-950 font-semibold px-4 py-2 text-sm hover:bg-emerald-400 transition cursor-pointer'
                >
                  {t.buttons.saveChanges}
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
