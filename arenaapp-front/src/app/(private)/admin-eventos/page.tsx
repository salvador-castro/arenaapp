// C:\Users\salvaCastro\Desktop\arenaapp-front\src\app\(private)\admin-eventos\page.tsx
'use client'

import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import UploadImage from '@/components/UploadImage'
import ZonasLugares from '@/components/Zonas'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PAGE_SIZE = 10

interface AdminEvento {
  id: number | string
  titulo: string
  slug?: string
  categoria: string
  es_destacado: boolean
  fecha_inicio: string
  fecha_fin: string | null
  es_todo_el_dia: boolean
  zona: string | null
  direccion: string | null
  es_gratuito: boolean
  precio_desde: number | null
  moneda: string | null
  url_entradas: string | null
  estado: string
  visibilidad?: string
  resena: string | null
  imagen_principal: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface FormValuesEvento {
  titulo: string
  categoria: string
  zona: string[]
  direccion: string
  es_gratuito: boolean
  precio_desde: number | ''
  moneda: string
  url_entradas: string
  estado: 'DRAFT' | 'PUBLICADO' | 'ARCHIVADO'
  fecha_inicio: string
  fecha_fin: string
  es_todo_el_dia: boolean
  es_destacado: boolean
  resena: string
  imagen_principal: string
}

const CATEGORIAS_EVENTO = [
  'MUSICA',
  'TEATRO',
  'GASTRONOMIA',
  'DEPORTES',
  'FIESTA',
  'OTROS'
]

export default function AdminEventosPage () {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [eventos, setEventos] = useState<AdminEvento[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminEvento | null>(null)

  const [formValues, setFormValues] = useState<FormValuesEvento>({
    titulo: '',
    categoria: 'OTROS',
    zona: [],
    direccion: '',
    es_gratuito: false,
    precio_desde: '',
    moneda: 'URU',
    url_entradas: '',
    estado: 'PUBLICADO',
    fecha_inicio: '',
    fecha_fin: '',
    es_todo_el_dia: false,
    es_destacado: false,
    resena: '',
    imagen_principal: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminEvento | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/admin-eventos')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  async function fetchEventos (pageToLoad: number, searchTerm: string) {
    try {
      if (!user || user.rol !== 'ADMIN') return

      setIsFetching(true)
      setError(null)

      const params = new URLSearchParams({
        page: String(pageToLoad),
        pageSize: String(PAGE_SIZE)
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const res = await fetch(
        `${API_BASE}/api/admin/eventos?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error(`Error al cargar eventos (${res.status})`)
      }

      const json = await res.json()

      setEventos(json.data as AdminEvento[])
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar eventos')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchEventos(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  function openCreateForm () {
    setEditing(null)
    setFormValues({
      titulo: '',
      categoria: 'OTROS',
      zona: [],
      direccion: '',
      es_gratuito: false,
      precio_desde: '',
      moneda: 'URU',
      url_entradas: '',
      estado: 'PUBLICADO',
      fecha_inicio: '',
      fecha_fin: '',
      es_todo_el_dia: false,
      es_destacado: false,
      resena: '',
      imagen_principal: ''
    })
    setIsFormOpen(true)
  }

  function openEditForm (e: AdminEvento) {
    setEditing(e)
    setFormValues({
      titulo: e.titulo ?? '',
      categoria: e.categoria ?? 'OTROS',
      zona: e.zona
        ? e.zona
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [],
      direccion: e.direccion ?? '',
      es_gratuito: !!e.es_gratuito,
      precio_desde: typeof e.precio_desde === 'number' ? e.precio_desde : '',
      moneda: e.moneda ?? 'URU',
      url_entradas: e.url_entradas ?? '',
      estado: (e.estado as FormValuesEvento['estado']) ?? 'PUBLICADO',
      fecha_inicio: e.fecha_inicio ? e.fecha_inicio.substring(0, 16) : '',
      fecha_fin: e.fecha_fin ? e.fecha_fin.substring(0, 16) : '',
      es_todo_el_dia: !!e.es_todo_el_dia,
      es_destacado: !!e.es_destacado,
      resena: e.resena ?? '',
      imagen_principal: e.imagen_principal ?? ''
    })
    setIsFormOpen(true)
  }

  function closeForm () {
    setIsFormOpen(false)
    setEditing(null)
  }

  function handleChange (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const target = e.target
    const { name, value } = target

    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormValues(prev => ({
        ...prev,
        [name]: target.checked
      }))
      return
    }

    if (name === 'precio_desde') {
      setFormValues(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }))
      return
    }

    setFormValues(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit (e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formValues.fecha_inicio) {
      setIsSubmitting(false)
      setError('La fecha de inicio es obligatoria.')
      return
    }

    if (!formValues.url_entradas.trim()) {
      setIsSubmitting(false)
      setError('La URL de entradas es obligatoria.')
      return
    }

    if (!formValues.direccion.trim()) {
      setIsSubmitting(false)
      setError('La dirección es obligatoria.')
      return
    }

    try {
      const payload: any = {
        ...formValues,
        zona: formValues.zona.length > 0 ? formValues.zona : [],
        precio_desde: formValues.es_gratuito ? null : formValues.precio_desde,
        moneda: formValues.moneda || 'URU',
        fecha_inicio: formValues.fecha_inicio,
        fecha_fin: formValues.fecha_fin || null
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/eventos/${idForUrl}`
        : `${API_BASE}/api/admin/eventos`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar evento (${res.status})`)
      }

      await res.json()
      await fetchEventos(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete () {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/eventos/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar evento (${res.status})`)
      }

      setDeleteTarget(null)
      await fetchEventos(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar evento')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !user || user.rol !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center'>
        <p className='text-sm text-slate-400'>Cargando...</p>
      </div>
    )
  }

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const toItem =
    totalItems === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalItems)

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 pb-20'>
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Gestión de eventos</h1>
            <p className='text-xs text-slate-400'>
              Crear, editar y eliminar eventos de ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Buscar por título, categoría, zona...'
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
            />
          </div>
          <button
            type='button'
            onClick={openCreateForm}
            className='inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition'
          >
            + Nuevo evento
          </button>
        </div>

        {error && (
          <div className='mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}
        {isFetching && (
          <div className='mb-3 text-xs text-slate-400'>Cargando eventos...</div>
        )}

        <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm'>
              <thead className='bg-slate-900/90'>
                <tr>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    ID
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Título
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Categoría
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Zona
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Fecha
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Gratuito
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Destacado
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-slate-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {eventos.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-3 py-4 text-center text-xs text-slate-500'
                    >
                      No hay eventos que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {eventos.map(ev => (
                  <tr
                    key={String(ev.id)}
                    className='border-t border-slate-800/80 hover:bg-slate-900/80'
                  >
                    <td className='px-3 py-2 text-xs text-slate-400'>
                      {String(ev.id)}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{ev.titulo}</span>
                        <span className='text-[11px] text-slate-400'>
                          {ev.direccion}
                        </span>
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {ev.categoria}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {ev.zona || '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {ev.fecha_inicio
                        ? new Date(ev.fecha_inicio).toLocaleString()
                        : '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {ev.es_gratuito ? 'Sí' : 'No'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {ev.es_destacado ? 'Sí' : 'No'}
                    </td>
                    <td className='px-3 py-2 text-xs text-right'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openEditForm(ev)}
                          className='rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800'
                        >
                          Editar
                        </button>
                        <button
                          type='button'
                          onClick={() => setDeleteTarget(ev)}
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

            {totalItems > 0 && (
              <div className='flex items-center justify-between px-4 py-2 border-t border-slate-800 text-[11px] text-slate-300'>
                <span>
                  Mostrando {fromItem}-{toItem} de {totalItems}
                </span>
                <div className='inline-flex gap-1'>
                  <button
                    type='button'
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='px-2 py-1 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800'
                  >
                    Anterior
                  </button>
                  <span className='px-2 py-1'>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type='button'
                    onClick={() =>
                      setCurrentPage(p => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='px-2 py-1 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800'
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal formulario */}
        {isFormOpen && (
          <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4'>
            <div className='w-full max-w-2xl mx-auto my-8 rounded-3xl bg-slate-950 border border-slate-700 p-6 md:p-8 shadow-2xl max-h-[88vh] overflow-y-auto'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold'>
                  {editing ? 'Editar evento' : 'Nuevo evento'}
                </h2>
                <button
                  type='button'
                  onClick={closeForm}
                  className='text-slate-400 hover:text-slate-200 text-sm'
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className='space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Título *
                    </label>
                    <input
                      type='text'
                      name='titulo'
                      value={formValues.titulo}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Categoría *
                    </label>
                    <select
                      name='categoria'
                      value={formValues.categoria}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    >
                      {CATEGORIAS_EVENTO.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <ZonasLugares
                  selected={formValues.zona}
                  onChange={values =>
                    setFormValues(prev => ({ ...prev, zona: values }))
                  }
                />

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Dirección *
                  </label>
                  <input
                    type='text'
                    name='direccion'
                    value={formValues.direccion}
                    onChange={handleChange}
                    required
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Fecha inicio *
                    </label>
                    <input
                      type='datetime-local'
                      name='fecha_inicio'
                      value={formValues.fecha_inicio}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Fecha fin
                    </label>
                    <input
                      type='datetime-local'
                      name='fecha_fin'
                      value={formValues.fecha_fin}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div className='flex items-end'>
                    <label className='inline-flex items-center gap-2 text-xs text-slate-200'>
                      <input
                        type='checkbox'
                        name='es_todo_el_dia'
                        checked={formValues.es_todo_el_dia}
                        onChange={handleChange}
                        className='h-4 w-4 rounded border-slate-600 bg-slate-900'
                      />
                      Todo el día
                    </label>
                  </div>

                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      ¿Es gratuito? *
                    </label>
                    <label className='inline-flex items-center gap-2 text-xs text-slate-200'>
                      <input
                        type='checkbox'
                        name='es_gratuito'
                        checked={formValues.es_gratuito}
                        onChange={e =>
                          setFormValues(prev => ({
                            ...prev,
                            es_gratuito: e.target.checked,
                            precio_desde: e.target.checked
                              ? ''
                              : prev.precio_desde
                          }))
                        }
                        className='h-4 w-4 rounded border-slate-600 bg-slate-900'
                      />
                      Gratuito
                    </label>
                  </div>

                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Precio desde{' '}
                      {formValues.es_gratuito ? '(no aplica)' : '*'}
                    </label>
                    <input
                      type='number'
                      name='precio_desde'
                      value={formValues.precio_desde}
                      onChange={handleChange}
                      disabled={formValues.es_gratuito}
                      required={!formValues.es_gratuito}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 disabled:opacity-50'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Moneda *
                    </label>
                    <select
                      name='moneda'
                      value={formValues.moneda}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    >
                      <option value='URU'>URU</option>
                      <option value='ARS'>ARS</option>
                      <option value='USD'>USD</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      URL entradas *
                    </label>
                    <input
                      type='url'
                      name='url_entradas'
                      value={formValues.url_entradas}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Reseña
                  </label>
                  <textarea
                    name='resena'
                    value={formValues.resena}
                    onChange={handleChange}
                    rows={4}
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    placeholder='Descripción del evento, artistas, ambiente, etc.'
                  />
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Imagen principal
                  </label>
                  <UploadImage
                    onUploaded={path =>
                      setFormValues(prev => ({
                        ...prev,
                        imagen_principal: path
                      }))
                    }
                  />
                  {formValues.imagen_principal && (
                    <p className='mt-1 text-[11px] text-emerald-400'>
                      Imagen subida: {formValues.imagen_principal}
                    </p>
                  )}
                  <p className='mt-1 text-[10px] text-slate-500'>
                    Se guarda en <code>public/uploads/[sección]</code> y en la
                    base se almacena la ruta relativa (por ejemplo:{' '}
                    <code>uploads/eventos/archivo.jpg</code>).
                  </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Estado
                    </label>
                    <select
                      name='estado'
                      value={formValues.estado}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    >
                      <option value='PUBLICADO'>PUBLICADO</option>
                      <option value='DRAFT'>BORRADOR</option>
                      <option value='ARCHIVADO'>ARCHIVADO</option>
                    </select>
                  </div>
                  <div className='flex items-end'>
                    <label className='inline-flex items-center gap-2 text-xs text-slate-200'>
                      <input
                        type='checkbox'
                        name='es_destacado'
                        checked={formValues.es_destacado}
                        onChange={handleChange}
                        className='h-4 w-4 rounded border-slate-600 bg-slate-900'
                      />
                      Destacado (aparece en inicio)
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
                      : editing
                      ? 'Guardar cambios'
                      : 'Crear evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm delete */}
        {deleteTarget && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
            <div className='w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-700 p-4 shadow-2xl'>
              <h2 className='text-sm font-semibold mb-2'>Eliminar evento</h2>
              <p className='text-xs text-slate-300 mb-3'>
                Estás por eliminar{' '}
                <span className='font-semibold'>{deleteTarget.titulo}</span>.
                Esta acción no se puede deshacer.
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
