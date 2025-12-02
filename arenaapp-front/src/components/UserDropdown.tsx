// C:\Users\salvaCastro\Desktop\arenaapp-front\src\components\UserDropdown.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/$/, '')

export default function UserDropdown () {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { user, logout } = useAuth()
  const router = useRouter()

  function toggleDropdown (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation()
    setIsOpen(prev => !prev)
  }

  function closeDropdown () {
    setIsOpen(false)
  }

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside (e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener('click', handleClickOutside)
    }

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const nombreCompleto = user
    ? `${user.nombre} ${user.apellido}`
    : 'Usuario invitado'

  const email = user?.email ?? 'sin-email@example.com'

  const initials = user
    ? `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`.toUpperCase()
    : 'U'

  // Normalizamos avatar_url por si viene relativa desde el back
  const avatarSrc = user?.avatar_url
    ? user.avatar_url.startsWith('http')
      ? user.avatar_url
      : `${API_BASE}${user.avatar_url}`
    : null

  return (
    <div ref={containerRef} className='relative'>
      {/* Botón */}
      <button
        onClick={toggleDropdown}
        className='flex items-center gap-2 rounded-full bg-slate-900/70 px-2 py-1 border border-slate-700 hover:bg-slate-800'
      >
        <span className='overflow-hidden rounded-full h-9 w-9 flex items-center justify-center bg-slate-800 text-slate-200 text-sm font-semibold'>
          {avatarSrc ? (
            <Image
              width={36}
              height={36}
              src={avatarSrc}
              alt={nombreCompleto}
              className='h-9 w-9 object-cover rounded-full'
              unoptimized
            />
          ) : (
            initials
          )}
        </span>

        <span className='hidden sm:block mr-1 text-sm font-medium text-slate-100'>
          {user ? user.nombre : 'Invitado'}
        </span>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox='0 0 18 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M4.3125 8.65625L9 13.3437L13.6875 8.65625'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute right-0 mt-3 w-64 rounded-2xl border border-slate-800 bg-slate-950 p-3 shadow-xl z-50'>
          {/* Info user */}
          <div className='flex items-center gap-3 mb-3'>
            <span className='overflow-hidden rounded-full h-10 w-10 flex items-center justify-center bg-slate-800 text-slate-200 text-sm font-semibold'>
              {avatarSrc ? (
                <Image
                  width={40}
                  height={40}
                  src={avatarSrc}
                  alt={nombreCompleto}
                  className='h-10 w-10 object-cover rounded-full'
                  unoptimized
                />
              ) : (
                initials
              )}
            </span>
            <div>
              <span className='block text-sm font-medium text-slate-100'>
                {nombreCompleto}
              </span>
              <span className='block text-xs text-slate-400'>{email}</span>
            </div>
          </div>

          <div className='h-px bg-slate-800 my-2' />

          {/* Items */}
          <ul className='flex flex-col gap-1 text-sm'>
            <li>
              <Link
                href='/perfil'
                onClick={closeDropdown}
                className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200'
              >
                Editar perfil
              </Link>
            </li>
            <li>
              <Link
                href='/settings'
                onClick={closeDropdown}
                className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200'
              >
                Configuración
              </Link>
            </li>
            <li>
              <Link
                href='/support'
                onClick={closeDropdown}
                className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200'
              >
                Soporte
              </Link>
            </li>
          </ul>

          <div className='h-px bg-slate-800 my-2' />

          {/* Logout */}
          <button
            onClick={() => {
              closeDropdown()
              logout()
              router.push('/login')
            }}
            className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/40'
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
