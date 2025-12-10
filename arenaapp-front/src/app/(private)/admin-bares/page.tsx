'use client'

import React, { useEffect, useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import UserDropdown from '@/components/UserDropdown'
import BottomNav from '@/components/BottomNav'
import Zonas from '@/components/Zonas'
import TipoComidaBares from '@/components/TipoComidaBares'
import UploadImage from '@/components/UploadImage'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

const PAGE_SIZE = 10

// lo que devuelve la API admin de bares
interface AdminBar {
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
  instagram?: string | null
  sitio_web?: string | null
  url_imagen?: string | null
  es_destacado?: boolean | null
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
  instagram: string
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

export default function BaresPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [bares, setBares] = useState<AdminBar[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBar | null>(null)

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
    instagram: '',
    sitio_web: '',
    url_imagen: '',
    es_destacado: false,
    resena: '',
    estado: 'PUBLICADO',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminBar | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/bares')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  // Fetch a la API con paginación + búsqueda
  async function fetchBares(pageToLoad: number, searchTerm: string) {
    try {
      if (!user || user.rol !== 'ADMIN') return

      setIsFetching(true)
      setError(null)

      const params = new URLSearchParams({
        page: String(pageToLoad),
        pageSize: String(PAGE_SIZE),
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const res = await fetch(
        `${API_BASE}/api/admin/bares?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error(`Error al cargar bares (${res.status})`)
      }

      const json = await res.json()

      const data: AdminBar[] = (json.data as any[]).map((row) => ({
        ...row,
        rango_precios:
          row.rango_precios === null || row.rango_precios === undefined
            ? null
            : Number(row.rango_precios),
        estrellas:
          row.estrellas === null || row.estrellas === undefined
            ? null
            : Number(row.estrellas),
      }))

      setBares(data)
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar bares')
    } finally {
      setIsFetching(false)
    }
  }

  // Cargar cada vez que cambie page / search / user
  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchBares(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  // Helpers form
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
      instagram: '',
      sitio_web: '',
      url_imagen: '',
      es_destacado: false,
      resena: '',
      estado: 'PUBLICADO',
    })
    setIsFormOpen(true)
  }

  function openEditForm(b: AdminBar) {
    setEditing(b)
    setFormValues({
      nombre: b.nombre ?? '',
      tipo_comida: b.tipo_comida
        ? b.tipo_comida
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      rango_precios: b.rango_precios ?? '',
      estrellas: b.estrellas ?? '',
      zona: b.zona
        ? b.zona
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      direccion: b.direccion ?? '',
      ciudad: b.ciudad ?? '',
      provincia: b.provincia ?? '',
      pais: b.pais ?? '',
      url_maps: b.url_maps ?? '',
      horario_text: b.horario_text ?? '',
      url_reserva: b.url_reserva ?? '',
      instagram: b.instagram ?? '',
      sitio_web: b.sitio_web ?? '',
      url_imagen: b.url_imagen ?? '',
      es_destacado: !!b.es_destacado,
      resena: b.resena ?? '',
      estado: (b.estado as FormValues['estado']) ?? 'PUBLICADO',
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
      setFormValues((prev) => ({
        ...prev,
        [name]: target.checked,
      }))
      return
    }

    if (name === 'rango_precios' || name === 'estrellas') {
      setFormValues((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }))
      return
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
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
        es_destacado: formValues.es_destacado ? 1 : 0,
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/bares/${idForUrl}`
        : `${API_BASE}/api/admin/bares`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar bar (${res.status})`)
      }

      await res.json() // no lo usamos, solo aseguramos parseo OK

      await fetchBares(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar bar')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/bares/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar bar (${res.status})`)
      }

      setDeleteTarget(null)
      await fetchBares(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar bar')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !user || user.rol !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400">Cargando...</p>
      </div>
    )
  }

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const toItem =
    totalItems === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, totalItems)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">Gestión de bares</h1>
            <p className="text-xs text-slate-400">
              Crear, editar y eliminar bares de ArenaApp.
            </p>
          </div>
          <UserDropdown />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 pb-6">
        {/* Barra superior */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, tipo de comida, zona..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition"
          >
            + Nuevo bar
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        {isFetching && (
          <div className="mb-3 text-xs text-slate-400">Cargando bares...</div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900/90">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Nombre
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Tipo de comida
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Zona
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    $
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    ⭐
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Es destacado
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {bares.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-4 text-center text-xs text-slate-500"
                    >
                      No hay bares que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {bares.map((b) => (
                  <tr
                    key={String(b.id)}
                    className="border-t border-slate-800/80 hover:bg-slate-900/80"
                  >
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {String(b.id)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm">{b.nombre}</span>
                        <span className="text-[11px] text-slate-400">
                          {b.direccion}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {b.tipo_comida}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {b.zona || b.ciudad || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {priceTierToSymbols(b.rango_precios ?? null)}
                    </td>
                    <td className="px-3 py-2 text-xs text-yellow-300">
                      {b.estrellas ? '★'.repeat(Math.min(b.estrellas, 5)) : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {b.es_destacado ? 'Si' : 'No'}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(b)}
                          className="rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="rounded-lg border border-red-700 px-2 py-1 text-red-300 hover:bg-red-950/40"
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
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 text-[11px] text-slate-300">
                <span>
                  Mostrando {fromItem}-{toItem} de {totalItems}
                </span>
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
                  >
                    Anterior
                  </button>
                  <span className="px-2 py-1">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded-lg border border-slate-700 disabled:opacity-40 hover:bg-slate-800"
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
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl mx-auto my-8 rounded-3xl bg-slate-950 border border-slate-700 p-6 md:p-8 shadow-2xl max-h-[88vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">
                  {editing ? 'Editar bar' : 'Nuevo bar'}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-slate-400 hover:text-slate-200 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre del bar"
                      name="nombre"
                      value={formValues.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <Zonas
                      selected={formValues.zona}
                      onChange={(values) =>
                        setFormValues((prev) => ({ ...prev, zona: values }))
                      }
                    />
                  </div>
                </div>

                <TipoComidaBares
                  selected={formValues.tipo_comida}
                  onChange={(values) =>
                    setFormValues((prev) => ({ ...prev, tipo_comida: values }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Rango de precios *
                    </label>
                    <select
                      name="rango_precios"
                      value={formValues.rango_precios}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="">Sin definir</option>
                      <option value={1}>$</option>
                      <option value={2}>$$</option>
                      <option value={3}>$$$</option>
                      <option value={4}>$$$$</option>
                      <option value={5}>$$$$$</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Estrellas *
                    </label>
                    <select
                      name="estrellas"
                      value={formValues.estrellas}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="">Sin definir</option>
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        name="es_destacado"
                        checked={formValues.es_destacado}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                      Destacado
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formValues.direccion}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Reseña (texto largo) *
                  </label>
                  <textarea
                    name="resena"
                    value={formValues.resena}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Escribí una reseña descriptiva del bar..."
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Podés escribir un texto largo: ambiente, barra, coctelería,
                    recomendaciones, etc.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formValues.ciudad}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Provincia
                    </label>
                    <input
                      type="text"
                      name="provincia"
                      value={formValues.provincia}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      País
                    </label>
                    <input
                      type="text"
                      name="pais"
                      value={formValues.pais}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Horarios (texto) *
                  </label>
                  <input
                    type="text"
                    name="horario_text"
                    placeholder="Lun a jue de 18 a 01, vie y sáb hasta las 03..."
                    value={formValues.horario_text}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Link Google Maps *
                    </label>
                    <input
                      type="url"
                      name="url_maps"
                      value={formValues.url_maps}
                      onChange={handleChange}
                      required
                      placeholder="https://maps.google.com/..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      URL reservas
                    </label>
                    <input
                      type="url"
                      name="url_reserva"
                      value={formValues.url_reserva}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Instagram *
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formValues.instagram}
                      onChange={handleChange}
                      required
                      placeholder="https://instagram.com/..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Web
                    </label>
                    <input
                      type="url"
                      name="sitio_web"
                      value={formValues.sitio_web}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                </div>

                {/* Imagen con UploadImage */}
                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Imagen *
                  </label>
                  <UploadImage
                    onUploaded={(path) =>
                      setFormValues((prev) => ({ ...prev, url_imagen: path }))
                    }
                  />
                  {formValues.url_imagen && (
                    <p className="mt-1 text-[11px] text-emerald-400">
                      Imagen subida: {formValues.url_imagen}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-500">
                    Se guarda en <code>public/uploads/[sección]</code> y en la
                    base se almacena la ruta relativa (por ejemplo:{' '}
                    <code>uploads/bares/archivo.jpg</code>).
                  </p>
                </div>

                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formValues.estado}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="PUBLICADO">PUBLICADO</option>
                    <option value="BORRADOR">BORRADOR</option>
                    <option value="ARCHIVADO">ARCHIVADO</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {isSubmitting
                      ? 'Guardando...'
                      : editing
                        ? 'Guardar cambios'
                        : 'Crear bar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm delete */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-sm rounded-2xl bg-slate-950 border border-slate-700 p-4 shadow-2xl">
              <h2 className="text-sm font-semibold mb-2">Eliminar bar</h2>
              <p className="text-xs text-slate-300 mb-3">
                Estás por eliminar{' '}
                <span className="font-semibold">{deleteTarget.nombre}</span>.
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
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
