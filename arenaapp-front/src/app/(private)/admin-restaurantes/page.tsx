// C:\Users\sacastro\Documents\proyects\arenaapp\arenaapp-front\src\app\(private)\admin-restaurantes\page.tsx
'use client'

import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import UploadImage from '@/components/UploadImage'
import TipoComidaRestaurantes from '@/components/TipoComidaRestaurantes'
import ZonasLugares from '@/components/Zonas'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PAGE_SIZE = 10

interface AdminRestaurant {
  id: number | string
  nombre: string
  tipo_comida?: string | null
  rango_precios?: number | null
  estrellas?: number | null
  zona?: string | null
  direccion: string
  ciudad?: string | null
  provincia?: string | null
  pais?: string | null
  url_maps?: string | null
  horario_text?: string | null
  url_reserva?: string | null
  url_instagram?: string | null
  sitio_web?: string | null
  url_imagen?: string | null
  es_destacado?: 0 | 1 | boolean
  resena?: string | null
  estado?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface FormValues {
  nombre: string
  tipo_comida: string[]
  rango_precios: number | ''
  estrellas: number | ''
  zona: string[]
  direccion: string
  ciudad: string
  provincia: string
  pais: string
  url_maps: string
  horario_text: string
  url_reserva: string
  url_instagram: string
  sitio_web: string
  url_imagen: string
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO'
  es_destacado: boolean
  resena: string
}

function priceTierToSymbols(tier?: number | null) {
  if (!tier || tier < 1) return '-'
  return '$'.repeat(Math.min(tier, 5))
}

export default function AdminRestaurantesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminRestaurant | null>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    tipo_comida: [],
    rango_precios: '',
    estrellas: '',
    zona: [],
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    url_maps: '',
    horario_text: '',
    url_reserva: '',
    url_instagram: '',
    sitio_web: '',
    url_imagen: '',
    es_destacado: false,
    resena: '',
    estado: 'PUBLICADO'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminRestaurant | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/admin-restaurantes')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])


  async function fetchRestaurants(pageToLoad: number, searchTerm: string) {
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
        `${API_BASE}/api/admin/restaurantes?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error(`Error al cargar restaurantes (${res.status})`)
      }

      const json = await res.json()

      setRestaurants(json.data as AdminRestaurant[])
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar restaurantes')
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchRestaurants(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  function openCreateForm() {
    setEditing(null)
    setFormValues({
      nombre: '',
      tipo_comida: [],
      rango_precios: '',
      estrellas: '',
      zona: [],
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: '',
      url_maps: '',
      horario_text: '',
      url_reserva: '',
      url_instagram: '',
      sitio_web: '',
      url_imagen: '',
      es_destacado: false,
      resena: '',
      estado: 'PUBLICADO'
    })
    setIsFormOpen(true)
  }

  function openEditForm(r: AdminRestaurant) {
    setEditing(r)
    setFormValues({
      nombre: r.nombre ?? '',
      tipo_comida: r.tipo_comida
        ? r.tipo_comida
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        : [],
      rango_precios: typeof r.rango_precios === 'number' ? r.rango_precios : '',
      estrellas: typeof r.estrellas === 'number' ? r.estrellas : '',
      zona: r.zona
        ? r.zona
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
        : [],
      direccion: r.direccion ?? '',
      ciudad: r.ciudad ?? '',
      provincia: r.provincia ?? '',
      pais: r.pais ?? '',
      url_maps: r.url_maps ?? '',
      horario_text: r.horario_text ?? '',
      url_reserva: r.url_reserva ?? '',
      url_instagram: r.url_instagram ?? '',
      sitio_web: r.sitio_web ?? '',
      url_imagen: r.url_imagen ?? '',
      es_destacado: (r.es_destacado as any) === true || (r.es_destacado ?? 0) === 1,
      resena: r.resena ?? '',
      estado: (r.estado as FormValues['estado']) ?? 'PUBLICADO'
    })
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditing(null)
  }

  function handleChange(
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

    if (name === 'rango_precios' || name === 'estrellas') {
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formValues.url_imagen.trim()) {
      setIsSubmitting(false)
      setError('Subí una imagen antes de guardar.')
      return
    }

    try {
      const payload: any = {
        ...formValues,
        tipo_comida:
          formValues.tipo_comida.length > 0
            ? formValues.tipo_comida.join(', ')
            : null,
        zona: formValues.zona.length > 0 ? formValues.zona.join(', ') : null,
        rango_precios:
          formValues.rango_precios === '' ? null : formValues.rango_precios,
        estrellas: formValues.estrellas === '' ? null : formValues.estrellas,
        es_destacado: formValues.es_destacado ? 1 : 0
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/restaurantes/${idForUrl}`
        : `${API_BASE}/api/admin/restaurantes`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar restaurante (${res.status})`)
      }

      await res.json()
      await fetchRestaurants(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar restaurante')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/restaurantes/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar restaurante (${res.status})`)
      }

      setDeleteTarget(null)
      await fetchRestaurants(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar restaurante')
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
            <h1 className='text-lg font-semibold'>Gestión de restaurantes</h1>
            <p className='text-xs text-slate-400'>
              Crear, editar y eliminar restaurantes de ArenaApp.
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
              placeholder='Buscar por nombre, tipo de comida, zona...'
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
            + Nuevo restaurante
          </button>
        </div>

        {error && (
          <div className='mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}
        {isFetching && (
          <div className='mb-3 text-xs text-slate-400'>
            Cargando restaurantes...
          </div>
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
                    Nombre
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Zona
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    $
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    ⭐
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Es destacado
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-slate-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {restaurants.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-3 py-4 text-center text-xs text-slate-500'
                    >
                      No hay restaurantes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {restaurants.map(r => (
                  <tr
                    key={String(r.id)}
                    className='border-t border-slate-800/80 hover:bg-slate-900/80'
                  >
                    <td className='px-3 py-2 text-xs text-slate-400'>
                      {String(r.id)}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{r.nombre}</span>
                        <span className='text-[11px] text-slate-400'>
                          {r.direccion}
                        </span>
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {r.zona || r.ciudad || '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {priceTierToSymbols(r.rango_precios ?? null)}
                    </td>
                    <td className='px-3 py-2 text-xs text-yellow-300'>
                      {r.estrellas
                        ? '★'.repeat(Math.min(r.estrellas, 5))
                        : '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {r.es_destacado ? 'Sí' : 'No'}
                    </td>
                    <td className='px-3 py-2 text-xs text-right'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openEditForm(r)}
                          className='rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800'
                        >
                          Editar
                        </button>
                        <button
                          type='button'
                          onClick={() => setDeleteTarget(r)}
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
                  {editing ? 'Editar restaurante' : 'Nuevo restaurante'}
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
                      Nombre *
                    </label>
                    <input
                      type='text'
                      placeholder='Nombre del lugar'
                      name='nombre'
                      value={formValues.nombre}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    />
                  </div>
                  <div>
                    <ZonasLugares
                      selected={formValues.zona}
                      onChange={values =>
                        setFormValues(prev => ({ ...prev, zona: values }))
                      }
                    />
                  </div>
                </div>

                <TipoComidaRestaurantes
                  selected={formValues.tipo_comida}
                  onChange={values =>
                    setFormValues(prev => ({ ...prev, tipo_comida: values }))
                  }
                />

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Rango de precios *
                    </label>
                    <select
                      name='rango_precios'
                      value={formValues.rango_precios}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    >
                      <option value=''>Sin definir</option>
                      <option value={1}>$</option>
                      <option value={2}>$$</option>
                      <option value={3}>$$$</option>
                      <option value={4}>$$$$</option>
                      <option value={5}>$$$$$</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Estrellas *
                    </label>
                    <select
                      name='estrellas'
                      value={formValues.estrellas}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    >
                      <option value=''>Sin definir</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
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
                      Destacado
                    </label>
                  </div>
                </div>

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

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Reseña (texto largo) *
                  </label>
                  <textarea
                    name='resena'
                    value={formValues.resena}
                    onChange={handleChange}
                    rows={5}
                    required
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    placeholder='Escribí una reseña descriptiva del restaurante...'
                  />
                  <p className='mt-1 text-[11px] text-slate-500'>
                    Podés escribir un texto largo: historia del lugar, ambiente,
                    recomendaciones, etc.
                  </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Ciudad
                    </label>
                    <input
                      type='text'
                      name='ciudad'
                      value={formValues.ciudad}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Provincia
                    </label>
                    <input
                      type='text'
                      name='provincia'
                      value={formValues.provincia}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      País
                    </label>
                    <input
                      type='text'
                      name='pais'
                      value={formValues.pais}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Horarios (texto) *
                  </label>
                  <input
                    type='text'
                    name='horario_text'
                    placeholder='Lun a vie de 10 a 18'
                    value={formValues.horario_text}
                    onChange={handleChange}
                    required
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Link Google Maps *
                    </label>
                    <input
                      type='url'
                      name='url_maps'
                      value={formValues.url_maps}
                      onChange={handleChange}
                      required
                      placeholder='https://maps.google.com/...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      URL reservas
                    </label>
                    <input
                      type='url'
                      name='url_reserva'
                      value={formValues.url_reserva}
                      onChange={handleChange}
                      placeholder='https://...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Instagram *
                    </label>
                    <input
                      type='url'
                      name='url_instagram'
                      value={formValues.url_instagram}
                      onChange={handleChange}
                      required
                      placeholder='https://instagram.com/...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Web
                    </label>
                    <input
                      type='url'
                      name='sitio_web'
                      value={formValues.sitio_web}
                      onChange={handleChange}
                      placeholder='https://...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Imagen *
                  </label>
                  <UploadImage
                    onUploaded={path =>
                      setFormValues(prev => ({ ...prev, url_imagen: path }))
                    }
                  />
                  {formValues.url_imagen && (
                    <p className='mt-1 text-[11px] text-emerald-400'>
                      Imagen subida: {formValues.url_imagen}
                    </p>
                  )}
                  <p className='mt-1 text-[10px] text-slate-500'>
                    Se guarda en <code>public/uploads/[sección]</code> y en la
                    base se almacena la ruta relativa (por ejemplo:{' '}
                    <code>uploads/restaurantes/archivo.jpg</code>).
                  </p>
                </div>

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
                    <option value='BORRADOR'>BORRADOR</option>
                    <option value='ARCHIVADO'>ARCHIVADO</option>
                  </select>
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
                        : 'Crear restaurante'}
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
              <h2 className='text-sm font-semibold mb-2'>
                Eliminar restaurante
              </h2>
              <p className='text-xs text-slate-300 mb-3'>
                Estás por eliminar{' '}
                <span className='font-semibold'>{deleteTarget.nombre}</span>.
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