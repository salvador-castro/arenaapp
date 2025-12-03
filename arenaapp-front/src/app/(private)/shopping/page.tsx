'use client'

import React, {
  useEffect,
  useState,
  FormEvent,
  ChangeEvent,
  useRef
} from 'react'
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

// lo que devuelve la API admin
interface AdminShopping {
  id: number | string
  nombre: string
  rango_precios?: number | null
  estrellas?: number | null
  zona?: string | null
  direccion: string
  ciudad?: string | null
  provincia?: string | null
  pais?: string | null
  horario_text?: string | null
  sitio_web?: string | null
  url_imagen?: string | null
  cantidad_locales?: number | null
  tiene_estacionamiento?: boolean | null
  tiene_patio_comidas?: boolean | null
  tiene_cine?: boolean | null
  es_outlet?: boolean | null
  telefono?: string | null
  instagram?: string | null
  facebook?: string | null
  resena?: string | null
  estado?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface FormValues {
  nombre: string
  rango_precios: number | ''
  estrellas: number | ''
  zona: string[]
  direccion: string
  ciudad: string
  provincia: string
  pais: string
  horario_text: string
  sitio_web: string
  url_imagen: string
  cantidad_locales: number | ''
  telefono: string
  instagram: string
  facebook: string
  caracteristicas: string[]
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO'
  resena: string
}

function priceTierToSymbols (tier?: number | null) {
  if (!tier || tier < 1) return '-'
  return '$'.repeat(Math.min(tier, 5))
}

const opcionesShopping = [
  'Estacionamiento',
  'Patio de comidas',
  'Cines',
  'Outlet'
] as const

interface CaracteristicasMultiSelectProps {
  selected: string[]
  onChange: (values: string[]) => void
}

function CaracteristicasShoppingMultiSelect ({
  selected,
  onChange
}: CaracteristicasMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const label =
    selected.length === 0 ? 'Seleccioná características' : selected.join(', ')

  // 🔹 Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div ref={containerRef} className='flex flex-col gap-1'>
      <label className='block text-xs mb-1 text-slate-300'>
        Características
      </label>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-left text-sm text-slate-100 flex items-center justify-between'
      >
        <span className={selected.length === 0 ? 'text-slate-500' : ''}>
          {label}
        </span>
        <span className='text-xs text-slate-500'>▼</span>
      </button>
      {open && (
        <div className='mt-1 rounded-xl border border-slate-700 bg-slate-900 p-2 text-xs text-slate-100 shadow-lg'>
          {opcionesShopping.map(op => (
            <label
              key={op}
              className='flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer'
            >
              <input
                type='checkbox'
                checked={selected.includes(op)}
                onChange={() => toggleValue(op)}
                className='h-4 w-4 rounded border-slate-600 bg-slate-900'
              />
              <span>{op}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ShoppingPage () {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [items, setItems] = useState<AdminShopping[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminShopping | null>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    rango_precios: '',
    estrellas: '',
    zona: [],
    direccion: '',
    ciudad: '',
    provincia: '',
    pais: '',
    horario_text: '',
    sitio_web: '',
    url_imagen: '',
    cantidad_locales: '',
    telefono: '',
    instagram: '',
    facebook: '',
    caracteristicas: [],
    resena: '',
    estado: 'PUBLICADO'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminShopping | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/shopping')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  // Fetch a la API con paginación + búsqueda
  async function fetchShopping (pageToLoad: number, searchTerm: string) {
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
        `${API_BASE}/api/admin/shopping?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (!res.ok) {
        throw new Error(`Error al cargar shoppings (${res.status})`)
      }

      const json = await res.json()

      setItems(json.data as AdminShopping[])
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar shoppings')
    } finally {
      setIsFetching(false)
    }
  }

  // Cargar cada vez que cambie page / search / user
  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchShopping(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  // Helpers form
  function openCreateForm () {
    setEditing(null)
    setFormValues({
      nombre: '',
      rango_precios: '',
      estrellas: '',
      zona: [],
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: '',
      horario_text: '',
      sitio_web: '',
      url_imagen: '',
      cantidad_locales: '',
      telefono: '',
      instagram: '',
      facebook: '',
      caracteristicas: [],
      resena: '',
      estado: 'PUBLICADO'
    })
    setIsFormOpen(true)
  }

  function openEditForm (s: AdminShopping) {
    const caracteristicas: string[] = []
    if (s.tiene_estacionamiento) caracteristicas.push('Estacionamiento')
    if (s.tiene_patio_comidas) caracteristicas.push('Patio de comidas')
    if (s.tiene_cine) caracteristicas.push('Cines')
    if (s.es_outlet) caracteristicas.push('Outlet')

    setEditing(s)
    setFormValues({
      nombre: s.nombre ?? '',
      rango_precios: typeof s.rango_precios === 'number' ? s.rango_precios : '',
      estrellas: typeof s.estrellas === 'number' ? s.estrellas : '',
      zona: s.zona
        ? s.zona
            .split(',')
            .map(str => str.trim())
            .filter(Boolean)
        : [],
      direccion: s.direccion ?? '',
      ciudad: s.ciudad ?? '',
      provincia: s.provincia ?? '',
      pais: s.pais ?? '',
      horario_text: s.horario_text ?? '',
      sitio_web: s.sitio_web ?? '',
      url_imagen: s.url_imagen ?? '',
      cantidad_locales:
        typeof s.cantidad_locales === 'number' ? s.cantidad_locales : '',
      telefono: s.telefono ?? '',
      instagram: s.instagram ?? '',
      facebook: s.facebook ?? '',
      caracteristicas, // 🔽 NUEVO
      resena: s.resena ?? '',
      estado: (s.estado as FormValues['estado']) ?? 'PUBLICADO'
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

    if (
      name === 'rango_precios' ||
      name === 'estrellas' ||
      name === 'cantidad_locales'
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
      const payload: any = {
        ...formValues,
        zona: formValues.zona.length > 0 ? formValues.zona.join(', ') : null,
        rango_precios:
          formValues.rango_precios === '' ? null : formValues.rango_precios,
        estrellas: formValues.estrellas === '' ? null : formValues.estrellas,
        cantidad_locales:
          formValues.cantidad_locales === ''
            ? null
            : formValues.cantidad_locales,
        // 🔽 estos 4 se calculan desde el multiselect:
        tiene_estacionamiento:
          formValues.caracteristicas.includes('Estacionamiento'),
        tiene_patio_comidas:
          formValues.caracteristicas.includes('Patio de comidas'),
        tiene_cine: formValues.caracteristicas.includes('Cines'),
        es_outlet: formValues.caracteristicas.includes('Outlet')
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/shopping/${idForUrl}`
        : `${API_BASE}/api/admin/shopping`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar shopping (${res.status})`)
      }

      await res.json()
      await fetchShopping(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar shopping')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete () {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/shopping/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar shopping (${res.status})`)
      }

      setDeleteTarget(null)

      await fetchShopping(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar shopping')
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
            <h1 className='text-lg font-semibold'>Gestión de shoppings</h1>
            <p className='text-xs text-slate-400'>
              Crear, editar y eliminar shoppings de ArenaApp.
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
            + Nuevo shopping
          </button>
        </div>
        {/* Mensajes */}
        {error && (
          <div className='mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200'>
            {error}
          </div>
        )}
        {isFetching && (
          <div className='mb-3 text-xs text-slate-400'>
            Cargando shoppings...
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
                    Zona / Ciudad
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    $
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    ⭐
                  </th>
                  <th className='px-3 py-2 text-left text-xs font-medium text-slate-400'>
                    Outlet
                  </th>
                  <th className='px-3 py-2 text-center text-xs font-medium text-slate-400'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-3 py-4 text-center text-xs text-slate-500'
                    >
                      No hay shoppings que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {items.map(s => (
                  <tr
                    key={String(s.id)}
                    className='border-t border-slate-800/80 hover:bg-slate-900/80'
                  >
                    <td className='px-3 py-2 text-xs text-slate-400'>
                      {String(s.id)}
                    </td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-col'>
                        <span className='text-sm'>{s.nombre}</span>
                        <span className='text-[11px] text-slate-400'>
                          {s.direccion}
                        </span>
                      </div>
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {s.zona || s.ciudad || '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {priceTierToSymbols(s.rango_precios ?? null)}
                    </td>
                    <td className='px-3 py-2 text-xs text-yellow-300'>
                      {s.estrellas ? '★'.repeat(Math.min(s.estrellas, 5)) : '-'}
                    </td>
                    <td className='px-3 py-2 text-xs text-slate-300'>
                      {s.es_outlet ? 'Sí' : 'No'}
                    </td>
                    <td className='px-3 py-2 text-xs text-right'>
                      <div className='inline-flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => openEditForm(s)}
                          className='rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800'
                        >
                          Editar
                        </button>
                        <button
                          type='button'
                          onClick={() => setDeleteTarget(s)}
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
                  {editing ? 'Editar shopping' : 'Nuevo shopping'}
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
                      placeholder='Nombre del shopping'
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
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Cantidad de locales
                    </label>
                    <input
                      type='number'
                      name='cantidad_locales'
                      value={formValues.cantidad_locales}
                      onChange={handleChange}
                      min={0}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <CaracteristicasShoppingMultiSelect
                      selected={formValues.caracteristicas}
                      onChange={values =>
                        setFormValues(prev => ({
                          ...prev,
                          caracteristicas: values
                        }))
                      }
                    />
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
                    placeholder='Escribí una reseña descriptiva del shopping...'
                  />
                  <p className='mt-1 text-[11px] text-slate-500'>
                    Podés escribir un texto largo: historia del lugar, ambiente,
                    tipos de locales, servicios, etc.
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
                    placeholder='Lun a dom de 10 a 22'
                    value={formValues.horario_text}
                    onChange={handleChange}
                    required
                    className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
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
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Teléfono
                    </label>
                    <input
                      type='text'
                      name='telefono'
                      value={formValues.telefono}
                      onChange={handleChange}
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Instagram
                    </label>
                    <input
                      type='url'
                      name='instagram'
                      value={formValues.instagram}
                      onChange={handleChange}
                      placeholder='https://instagram.com/...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                  <div>
                    <label className='block text-xs mb-1 text-slate-300'>
                      Facebook
                    </label>
                    <input
                      type='url'
                      name='facebook'
                      value={formValues.facebook}
                      onChange={handleChange}
                      placeholder='https://facebook.com/...'
                      className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100'
                    />
                  </div>
                </div>

                {/* Imagen con UploadImage */}
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
                    <code>uploads/shopping/archivo.jpg</code>).
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
                      : 'Crear shopping'}
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
              <h2 className='text-sm font-semibold mb-2'>Eliminar shopping</h2>
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
