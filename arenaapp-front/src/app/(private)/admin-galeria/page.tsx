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

// lo que devuelve la API admin
interface AdminGallery {
  id: number | string
  nombre: string
  direccion: string
  ciudad?: string | null
  provincia?: string | null
  pais?: string | null
  zona?: string | null
  instagram?: string | null
  sitio_web?: string | null
  anio_fundacion?: number | null
  tiene_entrada_gratuita?: boolean | null
  requiere_reserva?: boolean | null
  es_destacado?: boolean | null
  estado?: string | null
  created_at?: string | null
  updated_at?: string | null

  descripcion_corta?: string | null
  resena?: string | null
  telefono?: string | null
  email_contacto?: string | null
  facebook?: string | null
  horario_desde?: string | null
  horario_hasta?: string | null
  url_imagen?: string | null
  meta_title?: string | null
  meta_description?: string | null

  lat?: number | null
  lng?: number | null
}

interface FormValues {
  nombre: string
  direccion: string
  zona: string[]
  instagram: string
  sitio_web: string
  horario_desde: string
  horario_hasta: string
  tiene_entrada_gratuita: boolean
  es_destacado: boolean
  resena: string
  url_imagen: string
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO'
}

export default function GaleriasPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [galerias, setGalerias] = useState<AdminGallery[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminGallery | null>(null)

  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    direccion: '',
    zona: [],
    instagram: '',
    sitio_web: '',
    horario_desde: '',
    horario_hasta: '',
    tiene_entrada_gratuita: false,
    es_destacado: false,
    resena: '',
    url_imagen: '',
    estado: 'PUBLICADO',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminGallery | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔐 Solo ADMIN
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/login?redirect=/galerias')
      return
    }
    if (user.rol !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [user, isLoading, router])

  // Fetch a la API con paginación + búsqueda
  async function fetchGalerias(pageToLoad: number, searchTerm: string) {
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
        `${API_BASE}/api/admin/galerias?${params.toString()}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error(`Error al cargar galerías (${res.status})`)
      }

      const json = await res.json()

      setGalerias(json.data as AdminGallery[])
      setCurrentPage(json.page ?? pageToLoad)
      setTotalPages(json.totalPages ?? 1)
      setTotalItems(json.total ?? 0)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar galerías')
    } finally {
      setIsFetching(false)
    }
  }

  // Cargar cada vez que cambie page / search / user
  useEffect(() => {
    if (!user || user.rol !== 'ADMIN') return
    fetchGalerias(currentPage, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, search])

  function openCreateForm() {
    setEditing(null)
    setFormValues({
      nombre: '',
      direccion: '',
      zona: [],
      instagram: '',
      sitio_web: '',
      horario_desde: '',
      horario_hasta: '',
      tiene_entrada_gratuita: false,
      es_destacado: false,
      resena: '',
      url_imagen: '',
      estado: 'PUBLICADO',
    })
    setIsFormOpen(true)
  }

  async function loadDetailAndOpenEdit(g: AdminGallery) {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/galerias/${String(g.id)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
      if (!res.ok) {
        throw new Error(`Error al cargar detalle de galería (${res.status})`)
      }
      const full = (await res.json()) as AdminGallery

      console.log('DETALLE GALERIA FULL ===>', full) // 👈 revisar en consola

      openEditForm(full)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al cargar galería')
    }
  }

  function openEditForm(g: AdminGallery) {
    setEditing(g)
    setFormValues({
      nombre: g.nombre ?? '',
      direccion: g.direccion ?? '',
      zona: g.zona
        ? g.zona
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      instagram: g.instagram ?? '',
      sitio_web: g.sitio_web ?? '',
      horario_desde: g.horario_desde ? g.horario_desde.slice(0, 5) : '',
      horario_hasta: g.horario_hasta ? g.horario_hasta.slice(0, 5) : '',
      tiene_entrada_gratuita: !!g.tiene_entrada_gratuita,
      es_destacado: !!g.es_destacado,
      resena: g.resena ?? '',
      url_imagen: g.url_imagen ?? '', // 👈 importante
      estado: (g.estado as FormValues['estado']) ?? 'PUBLICADO',
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

    if (!formValues.resena.trim()) {
      setIsSubmitting(false)
      setError('La reseña es obligatoria.')
      return
    }

    if (!formValues.nombre.trim() || !formValues.direccion.trim()) {
      setIsSubmitting(false)
      setError('Nombre y dirección son obligatorios.')
      return
    }

    try {
      const payload: any = {
        ...formValues,
        zona: formValues.zona.length > 0 ? formValues.zona.join(', ') : null,
      }

      const isEdit = !!editing && editing.id != null
      const idForUrl = editing?.id != null ? String(editing.id) : undefined

      const url = isEdit
        ? `${API_BASE}/api/admin/galerias/${idForUrl}`
        : `${API_BASE}/api/admin/galerias`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al guardar galería (${res.status})`)
      }

      await res.json()

      await fetchGalerias(currentPage, search)
      closeForm()
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al guardar galería')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    setError(null)

    try {
      const url = `${API_BASE}/api/admin/galerias/${String(deleteTarget.id)}`

      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || `Error al eliminar galería (${res.status})`)
      }

      setDeleteTarget(null)
      await fetchGalerias(currentPage, search)
    } catch (err: any) {
      console.error(err)
      setError(err.message ?? 'Error al eliminar galería')
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
            <h1 className="text-lg font-semibold">Gestión de galerías</h1>
            <p className="text-xs text-slate-400">
              Crear, editar y eliminar galerías de ArenaApp.
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
              placeholder="Buscar por nombre, ciudad, provincia o zona..."
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
            + Nueva galería
          </button>
        </div>
        {/* Mensajes */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-700 bg-red-950/50 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}
        {isFetching && (
          <div className="mb-3 text-xs text-slate-400">
            Cargando galerías...
          </div>
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
                    Zona
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Dirección
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Entrada gratis
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Destacado
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">
                    Estado
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {galerias.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-4 text-center text-xs text-slate-500"
                    >
                      No hay galerías que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {galerias.map((g) => (
                  <tr
                    key={String(g.id)}
                    className="border-t border-slate-800/80 hover:bg-slate-900/80"
                  >
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {String(g.id)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.nombre}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.zona || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.direccion ?? '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.tiene_entrada_gratuita ? 'Sí' : 'No'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.es_destacado ? 'Sí' : 'No'}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-300">
                      {g.estado || '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadDetailAndOpenEdit(g)}
                          className="rounded-lg border border-slate-600 px-2 py-1 hover:bg-slate-800"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(g)}
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
                  {editing ? 'Editar galería' : 'Nueva galería'}
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
                {/* Nombre + Dirección */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre de la galería"
                      name="nombre"
                      value={formValues.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
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
                </div>

                {/* Zonas */}
                <ZonasLugares
                  selected={formValues.zona}
                  onChange={(values) =>
                    setFormValues((prev) => ({ ...prev, zona: values }))
                  }
                />

                {/* Instagram + Web */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formValues.instagram}
                      onChange={handleChange}
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

                {/* Horarios + checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Hora desde
                    </label>
                    <input
                      type="time"
                      name="horario_desde"
                      value={formValues.horario_desde}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-slate-300">
                      Hora hasta
                    </label>
                    <input
                      type="time"
                      name="horario_hasta"
                      value={formValues.horario_hasta}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        name="tiene_entrada_gratuita"
                        checked={formValues.tiene_entrada_gratuita}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                      Entrada gratuita
                    </label>
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
                      Es destacado
                    </label>
                  </div>
                </div>

                {/* Reseña */}
                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Reseña *
                  </label>
                  <textarea
                    name="resena"
                    value={formValues.resena}
                    onChange={handleChange}
                    rows={4}
                    required
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Texto más largo sobre la galería, historia, colecciones, etc."
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-xs mb-1 text-slate-300">
                    Imagen *
                  </label>

                  {/* Uploader */}
                  <UploadImage
                    onUploaded={(path) =>
                      setFormValues((prev) => ({
                        ...prev,
                        url_imagen: path,
                      }))
                    }
                  />

                  {/* Info y preview de imagen guardada */}
                  {formValues.url_imagen && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-[11px] text-emerald-400 break-all">
                        Imagen actual: {formValues.url_imagen}
                      </div>
                      <div className="shrink-0">
                        <img
                          src={
                            formValues.url_imagen.startsWith('http')
                              ? formValues.url_imagen
                              : `/${formValues.url_imagen}`
                          }
                          alt="Imagen de la galería"
                          className="h-16 w-16 rounded-lg object-cover border border-slate-700"
                        />
                      </div>
                    </div>
                  )}

                  <p className="mt-1 text-[10px] text-slate-500">
                    Se guarda en <code>public/uploads/[sección]</code> y en la
                    base se almacena la ruta relativa (por ejemplo:{' '}
                    <code>uploads/galerias/archivo.jpg</code>).
                  </p>
                </div>

                {/* Estado */}
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
                        : 'Crear galería'}
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
              <h2 className="text-sm font-semibold mb-2">Eliminar galería</h2>
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
