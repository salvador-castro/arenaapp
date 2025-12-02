// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\(private)\usuarios\page.tsx
'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

// ojo: el back devuelve bigint como string, así que aceptamos string | number
interface AdminUser {
  id: number | string
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  ciudad?: string | null
  pais?: string | null
  rol: 'ADMIN' | 'USER'
  activo: 0 | 1
  avatar_url?: string | null
  last_login_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface FormValues {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: 'ADMIN' | 'USER'
  activo: boolean
}

// 🔧 Normalizador centralizado para que siempre tengamos tipos coherentes
function normalizeUser (u: any): AdminUser {
  return {
    ...u,
    id: typeof u.id === 'string' ? u.id : String(u.id),
    activo: Number(u.activo) === 1 ? 1 : 0
  }
}

export default function UsuariosPage () {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'USER',
    activo: true
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Proteger ruta: solo ADMIN
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login?redirect=/usuarios')
      return
    }

    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  // 🚀 Cargar usuarios
  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return

    const fetchUsers = async () => {
      try {
        setIsFetching(true)
        setError(null)

        const res = await fetch(`${API_BASE}/api/admin/users`, {
          method: 'GET',
          credentials: 'include'
        })

        if (!res.ok) {
          throw new Error(`Error al cargar usuarios (${res.status})`)
        }

        const data = await res.json()

        // normalizamos tipos (id y activo) SIEMPRE con normalizeUser
        const normalized: AdminUser[] = (data as any[]).map(normalizeUser)

        setUsers(normalized)
      } catch (err: any) {
        console.error(err)
        setError(err.message ?? 'Error al cargar usuarios')
      } finally {
        setIsFetching(false)
      }
    }

    fetchUsers()
  }, [user])

  // Helpers de formulario
  function openCreateForm () {
    setEditingUser(null)
    setFormValues({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'USER',
      activo: true
    })
    setIsFormOpen(true)
  }

  function openEditForm (u: AdminUser) {
    setEditingUser(u)
    setFormValues({
      nombre: u.nombre ?? '',
      apellido: u.apellido ?? '',
      email: u.email ?? '',
      password: '',
      rol: u.rol ?? 'USER',
      activo: u.activo === 1
    })
    setIsFormOpen(true)
  }

  function closeForm () {
    setIsFormOpen(false)
    setEditingUser(null)
    setFormValues({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      rol: 'USER',
      activo: true
    })
  }

  // 🔧 TypeScript: chequear si es checkbox con type guard
  function handleChange (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target
    const { name, value } = target

    // si es un input checkbox
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const checked = target.checked
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  async function handleSubmit (e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: any = {
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        email: formValues.email,
        rol: formValues.rol,
        activo: formValues.activo ? 1 : 0
      }

      if (formValues.password.trim().length > 0) {
        payload.password = formValues.password
      }

      const isEdit = !!editingUser && !!editingUser.id

      // 🔧 aseguramos que el id vaya como string y no undefined
      const idForUrl =
        editingUser && editingUser.id != null
          ? String(editingUser.id)
          : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/users/${idForUrl}`
        : `${API_BASE}/api/admin/users`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar usuario (${res.status})`)
      }

      // 🔧 normalizamos también la respuesta del back
      const savedRaw = await res.json()
      const saved = normalizeUser(savedRaw)

      setUsers(prev => {
        if (isEdit) {
          return prev.map(u => (String(u.id) === String(saved.id) ? saved : u))
        }
        return [saved, ...prev]
      })

      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete () {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/users/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar usuario (${res.status})`)
      }

      setUsers(prev =>
        prev.filter(u => String(u.id) !== String(deleteTarget.id))
      )
      setDeleteTarget(null)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase()
    return (
      u.nombre?.toLowerCase().includes(term) ||
      u.apellido?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    )
  })

  if (isLoading || !user || user.rol !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center'>
        <p className='text-sm text-slate-400'>Cargando...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      {/* Header */}
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Gestión de usuarios</h1>
            <p className='text-xs text-slate-400'>
              Crear, editar y desactivar usuarios de ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6'>
        {/* Barra superior: búsqueda + nuevo */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Buscar por nombre, apellido o email...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
            />
          </div>
          <button
            type='button'
            onClick={openCreateForm}
            className='inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition'
          >
            + Nuevo usuario
          </button>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className='mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}

        {isFetching && (
          <div className='mb-3 text-xs text-slate-400'>
            Cargando usuarios...
          </div>
        )}

        {/* Tabla */}
        <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead className='bg-slate-900/90'>
                <tr>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    ID
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Nombre
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Apellido
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Email
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Rol
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Estado
                  </th>
                  <th className='px-3 py-2 text-right text-xs font-medium text-slate-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-3 py-4 text-center text-xs text-slate-500'
                    >
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {filteredUsers.map(u => (
                  <tr
                    key={String(u.id)}
                    className='border-t border-slate-800/80 hover:bg-slate-900/80'
                  >
                    <td className='px-3 py-2 text-xs text-slate-400'>
                      {String(u.id)}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{u.nombre}</span>
                      </div>
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{u.apellido}</span>
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {u.email}
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium
                          ${
                            u.rol === 'ADMIN'
                              ? 'bg-purple-900/40 text-purple-200 border border-purple-700/60'
                              : 'bg-slate-800/60 text-slate-200 border border-slate-700/60'
                          }
                        `}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-xs'>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium
                          ${
                            u.activo === 1
                              ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-700/60'
                              : 'bg-red-900/40 text-red-200 border border-red-700/60'
                          }
                        `}
                      >
                        {u.activo === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className='px-3 py-2 text-xs text-right'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openEditForm(u)}
                          className='rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800'
                        >
                          Editar
                        </button>
                        <button
                          type='button'
                          onClick={() => setDeleteTarget(u)}
                          className='rounded-lg border border-red-700 px-2 py-1 text-red-300 hover:bg-red-950/40'
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formulario (modal simple) */}
        {isFormOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
            <div className='w-full max-w-md rounded-2xl bg-slate-950 border border-slate-700 p-4 shadow-2xl'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold'>
                  {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
                </h2>
                <button
                  type='button'
                  onClick={closeForm}
                  className='text-slate-400 hover:text-slate-200 text-sm'
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Nombre
                    </label>
                    <input
                      type='text'
                      name='nombre'
                      value={formValues.nombre}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Apellido
                    </label>
                    <input
                      type='text'
                      name='apellido'
                      value={formValues.apellido}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formValues.email}
                    onChange={handleChange}
                    required
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                  />
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Contraseña{' '}
                    {editingUser && (
                      <span className='text-[10px] text-slate-500'>
                        (dejá vacío para no cambiarla)
                      </span>
                    )}
                  </label>
                  <input
                    type='password'
                    name='password'
                    value={formValues.password}
                    onChange={handleChange}
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Rol
                    </label>
                    <select
                      name='rol'
                      value={formValues.rol}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    >
                      <option value='USER'>USER</option>
                      <option value='ADMIN'>ADMIN</option>
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <label className='inline-flex items-center gap-2 text-xs text-slate-200'>
                      <input
                        type='checkbox'
                        name='activo'
                        checked={formValues.activo}
                        onChange={handleChange}
                        className='h-4 w-4 rounded border-slate-600 bg-slate-900'
                      />
                      Usuario activo
                    </label>
                  </div>
                </div>

                <div className='flex justify-end gap-2 pt-2'>
                  <button
                    type='button'
                    onClick={closeForm}
                    className='rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60'
                  >
                    {isSubmitting
                      ? 'Guardando...'
                      : editingUser
                      ? 'Guardar cambios'
                      : 'Crear usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmación de eliminación */}
        {deleteTarget && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
            <div className='w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-700 p-4 shadow-2xl'>
              <h2 className='text-sm font-semibold mb-2'>Eliminar usuario</h2>
              <p className='text-xs text-slate-300 mb-3'>
                Estás por eliminar al usuario{' '}
                <span className='font-semibold'>
                  {deleteTarget.nombre} {deleteTarget.apellido}
                </span>{' '}
                ({deleteTarget.email}). Esta acción no se puede deshacer.
              </p>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() => setDeleteTarget(null)}
                  className='rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800'
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className='rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60'
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
