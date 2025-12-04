// C:\Users\salvaCastro\Desktop\arenaapp\arenaapp-front\src\app\(private)\hoteles\page.tsx
'use client'

import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import UploadImage from '@/components/UploadImage'
import ZonasLugares from '@/components/Zonas'
import HotelServiciosSelector from '@/components/HotelServiciosSelector'
import { AdminHotel, AdminHotelPayload, HotelDetalle } from '@/types/hotel'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PAGE_SIZE = 10

type EstadoPublicacion = 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO'

interface FormValues {
  nombre: string
  estrellas: number | ''
  rango_precio: number | ''
  zona: string[]
  direccion: string
  ciudad: string
  provincia: string
  pais: string
  url_maps: string
  horario_text: string
  url_reservas: string
  url_instagram: string
  sitio_web: string
  url_imagen: string
  precio_noche_desde: number | ''
  checkin_desde: string
  checkout_hasta: string
  es_destacado: boolean
  resena: string
  estado: EstadoPublicacion
}

function priceTierToSymbols (tier?: number | null) {
  if (!tier || tier < 1) return '-'
  return '$'.repeat(Math.min(tier, 5))
}

export default function HotelesPage () {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [hoteles, setHoteles] = useState<AdminHotel[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminHotel | null>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    estrellas: '',
    rango_precio: '',
    zona: [],
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    url_maps: '',
    horario_text: '',
    url_reservas: '',
    url_instagram: '',
    sitio_web: '',
    url_imagen: '',
    precio_noche_desde: '',
    checkin_desde: '',
    checkout_hasta: '',
    es_destacado: false,
    resena: '',
    estado: 'PUBLICADO'
  })

  const [detalleServicios, setDetalleServicios] = useState<
    Partial<HotelDetalle>
  >({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminHotel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/hoteles')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  // Fetch con paginación + búsqueda
  async function fetchHotels (pageToLoad: number, searchTerm: string) {
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
        `${API_BASE}/api/admin/hoteles?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al cargar hoteles (${res.status})`)
      }

      const json = await res.json()

      setHoteles(json.data as AdminHotel[])
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar hoteles')
    } finally {
      setIsFetching(false)
    }
  }

  // Cargar cuando cambia page / search / user
  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchHotels(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  // Helpers form
  function openCreateForm () {
    setEditing(null)
    setFormValues({
      nombre: '',
      estrellas: '',
      rango_precio: '',
      zona: [],
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: '',
      url_maps: '',
      horario_text: '',
      url_reservas: '',
      url_instagram: '',
      sitio_web: '',
      url_imagen: '',
      precio_noche_desde: '',
      checkin_desde: '',
      checkout_hasta: '',
      es_destacado: false,
      resena: '',
      estado: 'PUBLICADO'
    })
    setDetalleServicios({})
    setIsFormOpen(true)
  }

  function openEditForm (h: AdminHotel) {
    setEditing(h)

    const zonaArr = (h as any).zona
      ? String((h as any).zona)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : []

    setFormValues({
      nombre: h.nombre ?? '',
      estrellas: typeof h.estrellas === 'number' ? h.estrellas : '',
      rango_precio:
        typeof (h as any).rango_precio === 'number'
          ? (h as any).rango_precio
          : '',
      zona: zonaArr,
      direccion: h.direccion ?? '',
      ciudad: h.ciudad ?? '',
      provincia: h.provincia ?? '',
      pais: h.pais ?? '',
      url_maps: (h as any).url_maps ?? '',
      horario_text: (h as any).horario_text ?? '',
      url_reservas: (h as any).url_reservas ?? '',
      url_instagram: h.instagram ?? '',
      sitio_web: h.sitio_web ?? '',
      url_imagen: (h as any).url_imagen ?? '',
      precio_noche_desde:
        typeof h.precio_noche_desde === 'number' ? h.precio_noche_desde : '',
      checkin_desde: h.checkin_desde ?? '',
      checkout_hasta: h.checkout_hasta ?? '',
      es_destacado: !!h.es_destacado,
      resena: (h as any).resena ?? '',
      estado: (h.estado as EstadoPublicacion) ?? 'PUBLICADO'
    })

    setDetalleServicios(h.detalle || {})
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

    if (
      name === 'rango_precio' ||
      name === 'estrellas' ||
      name === 'precio_noche_desde'
    ) {
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

    if (!formValues.url_imagen.trim()) {
      setIsSubmitting(false)
      setError('Subí una imagen antes de guardar.')
      return
    }

    try {
      const payload: AdminHotelPayload = {
        hotel: {
          nombre: formValues.nombre,
          estrellas:
            formValues.estrellas === '' ? null : Number(formValues.estrellas),
          precio_noche_desde:
            formValues.precio_noche_desde === ''
              ? null
              : Number(formValues.precio_noche_desde),
          rango_precio:
            formValues.rango_precio === ''
              ? null
              : Number(formValues.rango_precio),
          direccion: formValues.direccion || null,
          ciudad: formValues.ciudad || null,
          provincia: formValues.provincia || null,
          pais: formValues.pais || 'Argentina',
          checkin_desde: (formValues.checkin_desde as any) || null,
          checkout_hasta: (formValues.checkout_hasta as any) || null,
          sitio_web: formValues.sitio_web || null,
          instagram: formValues.url_instagram || null,
          imagen_principal: null,
          url_imagen: formValues.url_imagen || null,
          url_maps: formValues.url_maps || null,
          url_reservas: formValues.url_reservas || null,
          horario_text: formValues.horario_text || null,
          es_destacado: formValues.es_destacado ? 1 : 0,
          resena: formValues.resena || null,
          estado: formValues.estado,
          // zona como string (igual que restaurantes)
          ...(formValues.zona.length > 0
            ? { zona: formValues.zona.join(', ') }
            : { zona: null })
        } as any,
        detalle: detalleServicios as HotelDetalle
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/hoteles/${idForUrl}`
        : `${API_BASE}/api/admin/hoteles`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar hotel (${res.status})`)
      }

      await res.json() // solo para asegurar parseo

      await fetchHotels(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar hotel')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete () {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/hoteles/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok && res.status !== 204) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar hotel (${res.status})`)
      }

      setDeleteTarget(null)
      await fetchHotels(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar hotel')
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
      {/* Header */}
      <header className='sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800'>
        <div className='max-w-4xl mx-auto flex items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-lg font-semibold'>Gestión de hoteles</h1>
            <p className='text-xs text-slate-400'>
              Crear, editar y eliminar hoteles de ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pt-4 pb-6'>
        {/* Barra superior */}
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-4'>
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Buscar por nombre, zona, ciudad...'
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
            + Nuevo hotel
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className='mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}
        {isFetching && (
          <div className='mb-3 text-xs text-slate-400'>Cargando hoteles...</div>
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
                    Zona
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Ciudad
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
                {hoteles.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-3 py-4 text-center text-xs text-slate-500'
                    >
                      No hay hoteles cargados.
                    </td>
                  </tr>
                )}

                {hoteles.map(h => (
                  <tr
                    key={String(h.id)}
                    className='border-t border-slate-800/80 hover:bg-slate-900/80'
                  >
                    <td className='px-3 py-2 text-xs text-slate-400'>
                      {String(h.id)}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{h.nombre}</span>
                        <span className='text-[11px] text-slate-400'>
                          {h.direccion}
                        </span>
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {(h as any).zona || h.ciudad || '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {h.ciudad || '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {priceTierToSymbols((h as any).rango_precio ?? null)}
                    </td>
                    <td className='px-3 py-2 text-xs text-yellow-300'>
                      {h.estrellas ? '★'.repeat(Math.min(h.estrellas, 5)) : '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {h.es_destacado ? 'Sí' : 'No'}
                    </td>
                    <td className='px-3 py-2 text-xs text-right'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openEditForm(h)}
                          className='rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800'
                        >
                          Editar
                        </button>
                        <button
                          type='button'
                          onClick={() => setDeleteTarget(h)}
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
            <div className='w-full max-w-3xl mx-auto my-8 rounded-3xl bg-slate-950 border border-slate-700 p-6 md:p-8 shadow-2xl max-h-[88vh] overflow-y-auto'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold'>
                  {editing ? 'Editar hotel' : 'Nuevo hotel'}
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
                      Nombre *
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
                    <ZonasLugares
                      selected={formValues.zona}
                      onChange={values =>
                        setFormValues(prev => ({
                          ...prev,
                          zona: values
                        }))
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Rango de precios *
                    </label>
                    <select
                      name='rango_precio'
                      value={formValues.rango_precio}
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

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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
                      Horarios / info check-in *
                    </label>
                    <input
                      type='text'
                      name='horario_text'
                      placeholder='Check-in 15hs / Check-out 11hs'
                      value={formValues.horario_text}
                      onChange={handleChange}
                      required
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
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
                      name='url_reservas'
                      value={formValues.url_reservas}
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

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Precio por noche desde
                    </label>
                    <input
                      type='number'
                      name='precio_noche_desde'
                      min={0}
                      step='0.01'
                      value={formValues.precio_noche_desde}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
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
                </div>

                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Reseña (texto largo)
                  </label>
                  <textarea
                    name='resena'
                    value={formValues.resena}
                    onChange={handleChange}
                    rows={4}
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'
                    placeholder='Escribí una reseña descriptiva del hotel...'
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className='block text-xs mb-1 text-slate-300'>
                    Imagen *
                  </label>
                  <UploadImage
                    onUploaded={path =>
                      setFormValues(prev => ({
                        ...prev,
                        url_imagen: path
                      }))
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
                    <code>uploads/hoteles/archivo.jpg</code>).
                  </p>
                </div>

                {/* Servicios / amenities */}
                <div className='border-t border-slate-800 pt-3 mt-2'>
                  <HotelServiciosSelector
                    value={detalleServicios}
                    onChange={setDetalleServicios}
                    className='mt-1'
                  />
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
                      : 'Crear hotel'}
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
              <h2 className='text-sm font-semibold mb-2'>Eliminar hotel</h2>
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
