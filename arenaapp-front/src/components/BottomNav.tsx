// C:\Users\salvaCastro\Desktop\arenaapp-front\src\components\BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Search,
  User,
  Heart,
  Menu as MenuIcon,
  LayoutDashboard,
  Users,
  Utensils,
  Wine,
  Hotel,
  Image,
  PartyPopper,
  ShoppingBag,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import React, { useState, useEffect } from 'react'

type Item = {
  href: string
  label: string
  icon: React.ReactNode
  requiresAdmin?: boolean
}

type AdminSubItem = {
  href: string
  label: string
  icon: React.ReactNode
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const isLoggedIn = !isLoading && !!user
  const isAdmin = !!user && user.rol === 'ADMIN'

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const guestItems: Item[] = [
    { href: '/', label: 'Inicio', icon: <Home size={20} /> },
    { href: '/buscar', label: 'Buscar', icon: <Search size={20} /> },
    { href: '/login', label: 'Iniciar sesión', icon: <User size={20} /> },
  ]

  const loggedItems: Item[] = [
    { href: '/', label: 'Inicio', icon: <Home size={20} /> },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    { href: '/favoritos', label: 'Favoritos', icon: <Heart size={20} /> },
    { href: '/buscar', label: 'Buscar', icon: <Search size={20} /> },
    {
      href: '/menu',
      label: 'Menú',
      icon: <MenuIcon size={20} />,
      requiresAdmin: true,
    },
    { href: '/perfil', label: 'Perfil', icon: <User size={20} /> },
  ]

  const adminSubItems: AdminSubItem[] = [
    { href: '/usuarios', label: 'Usuarios', icon: <Users size={16} /> },
    {
      href: '/admin-restaurantes',
      label: 'Restaurante',
      icon: <Utensils size={16} />,
    },
    { href: '/admin-bares', label: 'Bares', icon: <Wine size={16} /> },
    { href: '/admin-hoteles', label: 'Hoteles', icon: <Hotel size={16} /> },
    { href: '/admin-galeria', label: 'Galería', icon: <Image size={16} /> },
    /* { href: '/salidas', label: 'Salidas', icon: <PartyPopper size={16} /> }, */
    {
      href: '/admin-shopping',
      label: 'Shopping',
      icon: <ShoppingBag size={16} />,
    },
    {
      href: '/admin-eventos',
      label: 'Eventos',
      icon: <PartyPopper size={16} />,
    },
  ]

  const items = isLoggedIn
    ? loggedItems.filter((item) => !(item.requiresAdmin && !isAdmin))
    : guestItems

  return (
    <>
      {/* 🔹 Overlay para cerrar el menú al clickear fuera del BottomNav */}
      {isLoggedIn && isAdmin && isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 h-16 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
        {/* SUBMENÚ ADMIN */}
        {isLoggedIn && isAdmin && isMenuOpen && (
          <div className="absolute bottom-16 inset-x-0 mb-2">
            <div className="mx-auto max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-2 grid grid-cols-2 gap-2 text-xs">
              {adminSubItems.map((sub) => {
                const isActive = pathname === sub.href
                return (
                  <button
                    key={sub.href}
                    type="button"
                    onClick={() => {
                      router.push(sub.href)
                      setIsMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 w-full transition
                      ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-200 hover:bg-slate-800/70 hover:text-white'
                      }
                    `}
                  >
                    <span className="flex items-center justify-center w-6 h-6">
                      {sub.icon}
                    </span>
                    <span className="truncate">{sub.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* BARRA PRINCIPAL */}
        <div className="mx-auto max-w-md flex h-full items-center justify-between px-4">
          {items.map((item) => {
            const isMenuItem = item.href === '/menu'
            const isActive =
              pathname === item.href || (isMenuItem && isMenuOpen)

            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={(e) => {
                  if (isMenuItem) {
                    e.preventDefault()
                    if (isAdmin) setIsMenuOpen((prev) => !prev)
                  }
                }}
                className={`flex flex-col items-center gap-0.5 text-[11px] transition
                  ${
                    isActive
                      ? 'text-white underline underline-offset-4'
                      : 'text-slate-300 hover:text-white'
                  }
                `}
              >
                <span className="flex items-center justify-center w-8 h-8">
                  {item.icon}
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
