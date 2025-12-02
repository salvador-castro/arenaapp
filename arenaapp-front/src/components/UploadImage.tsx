'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

type Props = {
  onUploaded: (path: string) => void
}

// Base del backend admin (Vercel)
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'https://admin.arenapress.app'
).replace(/\/$/, '')

export default function UploadImage ({ onUploaded }: Props) {
  const pathname = usePathname()

  // Ejemplos:
  // /restaurantes                   -> ['restaurantes']
  // /bares                          -> ['bares']
  // /admin/restaurantes/nuevo       -> ['admin', 'restaurantes', 'nuevo']
  // /admin/bares/123/editar         -> ['admin', 'bares', '123', 'editar']
  const segments = pathname.split('/').filter(Boolean)

  let section = 'generico'
  if (segments.length > 0) {
    if (segments[0] === 'admin' && segments.length > 1) {
      section = segments[1]
    } else {
      section = segments[0]
    }
  }

  console.log('UploadImage pathname:', pathname)
  console.log('UploadImage segments:', segments)
  console.log('UploadImage section (folder):', section)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload (e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', section)

      const res = await fetch(`${API_BASE}/api/admin/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const rawText = await res.text()
      console.log('Respuesta upload-image raw:', rawText)

      if (!res.ok) {
        let msg = 'Error al subir imagen'
        try {
          const parsed = JSON.parse(rawText)
          msg = parsed.message || parsed.error || msg
        } catch {
          if (rawText) msg = rawText
        }
        throw new Error(msg)
      }

      const data = JSON.parse(rawText) as {
        path: string
        storagePath?: string
      }

      console.log('Imagen subida (URL pública):', data.path)
      console.log('Storage path interno:', data.storagePath)

      onUploaded(data.path)
    } catch (err: any) {
      console.error('Error en UploadImage:', err)
      setError(err?.message ?? 'Error al subir imagen')
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <input
        type='file'
        accept='image/*'
        onChange={handleUpload}
        className='w-full text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:text-slate-100 hover:file:bg-slate-700'
      />

      {uploading && (
        <p className='text-xs text-slate-400'>Subiendo imagen...</p>
      )}

      {error && <p className='text-xs text-red-400'>{error}</p>}
    </div>
  )
}
