// C:\Users\salvaCastro\Desktop\arenaapp-front\src\components\UploadAvatar.tsx
'use client'

import React, { useRef, ChangeEvent } from 'react'

type UploadAvatarProps = {
  avatarUrl: string | null
  initials: string
  onFileSelected: (file: File | null, previewUrl: string | null) => void
  onError?: (msg: string | null) => void
}

export default function UploadAvatar ({
  avatarUrl,
  initials,
  onFileSelected,
  onError
}: UploadAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleClickChange () {
    fileInputRef.current?.click()
  }

  function handleRemove () {
    // limpiamos en el padre
    onFileSelected(null, null)
    onError?.(null)
  }

  function handleAvatarChange (e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      onError?.('La imagen no puede superar los 2 MB.')
      // limpiamos el input para permitir volver a seleccionar
      e.target.value = ''
      return
    }

    // Limpiamos errores anteriores
    onError?.(null)

    const previewUrl = URL.createObjectURL(file)
    onFileSelected(file, previewUrl)

    // NO reseteamos el input acá, por si el usuario abre el diálogo de nuevo
    // y el navegador no dispara change si el archivo es el mismo
  }

  return (
    <div className='flex items-center gap-4 mb-4'>
      <div className='h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700'>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt='Avatar'
            className='h-full w-full object-cover'
          />
        ) : (
          <span className='text-lg font-semibold text-slate-300'>
            {initials || '👤'}
          </span>
        )}
      </div>
      <div>
        <p className='text-sm font-medium'>Foto de perfil</p>
        <p className='text-xs text-slate-400 mb-2'>PNG o JPG, máximo 2 MB.</p>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleClickChange}
            className='rounded-lg bg-slate-800 text-slate-100 font-semibold px-3 py-1.5 text-xs hover:bg-slate-700 transition cursor-pointer'
          >
            Cambiar foto
          </button>
          {avatarUrl && (
            <button
              type='button'
              onClick={handleRemove}
              className='text-[11px] text-slate-400 hover:text-red-400'
            >
              Quitar foto
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  )
}
