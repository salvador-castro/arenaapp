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
  Languages,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import React, { useState, useEffect } from 'react'
import { useLocale } from '@/context/LocaleContext'

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

type Translations = {
  guest: {
    home: string
    search: string
    login: string
  }
  logged: {
    home: string
    dashboard: string
    favorites: string
    search: string
    menu: string
    profile: string
  }
  admin: {
    users: string
    restaurants: string
    bars: string
    hotels: string
    gallery: string
    shopping: string
    events: string
  }
  languagesMenu: {
    title: string
    es: string
    en: string
    pt: string
  }
}

const translationsByLocale: Record<'es' | 'en' | 'pt', Translations> = {
  es: {
    guest: {
      home: 'Inicio',
      search: 'Buscar',
      login: 'Iniciar sesión',
    },
    logged: {
      home: 'Inicio',
      dashboard: 'Dashboard',
      favorites: 'Favoritos',
      search: 'Buscar',
      menu: 'Menú',
      profile: 'Perfil',
    },
    admin: {
      users: 'Usuarios',
      restaurants: 'Restaurante',
      bars: 'Bares',
      hotels: 'Hoteles',
      gallery: 'Galería',
      shopping: 'Shopping',
      events: 'Eventos',
    },
    languagesMenu: {
      title: 'Idioma',
      es: 'Español',
      en: 'English',
      pt: 'Português',
    },
  },
  en: {
    guest: {
      home: 'Home',
      search: 'Search',
      login: 'Sign in',
    },
    logged: {
      home: 'Home',
      dashboard: 'Dashboard',
      favorites: 'Favorites',
      search: 'Search',
      menu: 'Menu',
      profile: 'Profile',
    },
    admin: {
      users: 'Users',
      restaurants: 'Restaurants',
      bars: 'Bars',
      hotels: 'Hotels',
      gallery: 'Gallery',
      shopping: 'Shopping',
      events: 'Events',
    },
    languagesMenu: {
      title: 'Language',
      es: 'Spanish',
      en: 'English',
      pt: 'Portuguese',
    },
  },
  pt: {
    guest: {
      home: 'Início',
      search: 'Buscar',
      login: 'Entrar',
    },
    logged: {
      home: 'Início',
      dashboard: 'Painel',
      favorites: 'Favoritos',
      search: 'Buscar',
      menu: 'Menu',
      profile: 'Perfil',
    },
    admin: {
      users: 'Usuários',
      restaurants: 'Restaurantes',
      bars: 'Bares',
      hotels: 'Hotéis',
      gallery: 'Galeria',
      shopping: 'Shopping',
      events: 'Eventos',
    },
    languagesMenu: {
      title: 'Idioma',
      es: 'Espanhol',
      en: 'Inglês',
      pt: 'Português',
    },
  },
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { locale, setLocale } = useLocale()

  const isLoggedIn = !isLoading && !!user
  const isAdmin = !!user && user.rol === 'ADMIN'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
    setIsLangMenuOpen(false)
  }, [pathname])

  const t = translationsByLocale[locale]

  // Ítems base invitados
  const guestItemsBase: Item[] = [
    { href: '/', label: t.guest.home, icon: <Home size={20} /> },
    { href: '/buscar', label: t.guest.search, icon: <Search size={20} /> },
    { href: '/login', label: t.guest.login, icon: <User size={20} /> },
  ]

  // Ítems base logueados
  const loggedItemsBase: Item[] = [
    { href: '/', label: t.logged.home, icon: <Home size={20} /> },
    {
      href: '/dashboard',
      label: t.logged.dashboard,
      icon: <LayoutDashboard size={20} />,
    },
    {
      href: '/favoritos',
      label: t.logged.favorites,
      icon: <Heart size={20} />,
    },
    { href: '/buscar', label: t.logged.search, icon: <Search size={20} /> },
    {
      href: '/menu',
      label: t.logged.menu,
      icon: <MenuIcon size={20} />,
      requiresAdmin: true,
    },
    { href: '/perfil', label: t.logged.profile, icon: <User size={20} /> },
  ]

  const loggedItemsFiltered = isLoggedIn
    ? loggedItemsBase.filter((item) => !(item.requiresAdmin && !isAdmin))
    : []

  const adminSubItems: AdminSubItem[] = [
    { href: '/usuarios', label: t.admin.users, icon: <Users size={16} /> },
    {
      href: '/admin-restaurantes',
      label: t.admin.restaurants,
      icon: <Utensils size={16} />,
    },
    { href: '/admin-bares', label: t.admin.bars, icon: <Wine size={16} /> },
    {
      href: '/admin-hoteles',
      label: t.admin.hotels,
      icon: <Hotel size={16} />,
    },
    {
      href: '/admin-galeria',
      label: t.admin.gallery,
      icon: <Image size={16} />,
    },
    {
      href: '/admin-shopping',
      label: t.admin.shopping,
      icon: <ShoppingBag size={16} />,
    },
    {
      href: '/admin-eventos',
      label: t.admin.events,
      icon: <PartyPopper size={16} />,
    },
  ]

  const handleChangeLocale = (newLocale: 'es' | 'en' | 'pt') => {
    setLocale(newLocale)
    setIsLangMenuOpen(false)
  }

  const closeAllMenus = () => {
    setIsMenuOpen(false)
    setIsLangMenuOpen(false)
  }

  const renderNavItem = (item: Item) => {
    const pathnameIsMenu = item.href === '/menu'
    const isActive = pathname === item.href || (pathnameIsMenu && isMenuOpen)

    return (
      <Link
        key={item.href + item.label}
        href={item.href}
        onClick={(e) => {
          if (pathnameIsMenu) {
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
  }

  const renderLanguageButton = () => (
    <div className="relative flex flex-col items-center gap-0.5 text-[11px]">
      <button
        type="button"
        onClick={() => setIsLangMenuOpen((prev) => !prev)}
        className="flex flex-col items-center gap-0.5 text-[11px] text-slate-300 hover:text-white transition"
      >
        <span className="flex items-center justify-center w-8 h-8">
          <Languages size={20} />
        </span>
        <span className="leading-none">{t.languagesMenu.title}</span>
      </button>

      {isLangMenuOpen && (
        <div className="absolute bottom-11 left-1/2 -translate-x-1/2 mb-1 w-40 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1 text-xs z-50">
          <div className="px-3 py-1 text-[11px] text-slate-400">
            {t.languagesMenu.title}
          </div>
          <button
            type="button"
            onClick={() => handleChangeLocale('es')}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${
              locale === 'es' ? 'text-white font-semibold' : 'text-slate-200'
            }`}
          >
            {t.languagesMenu.es}
          </button>
          <button
            type="button"
            onClick={() => handleChangeLocale('pt')}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${
              locale === 'pt' ? 'text-white font-semibold' : 'text-slate-200'
            }`}
          >
            {t.languagesMenu.pt}
          </button>
          <button
            type="button"
            onClick={() => handleChangeLocale('en')}
            className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 ${
              locale === 'en' ? 'text-white font-semibold' : 'text-slate-200'
            }`}
          >
            {t.languagesMenu.en}
          </button>
        </div>
      )}
    </div>
  )

  // Invitado: Inicio / Buscar / Idioma / Iniciar sesión
  const renderGuestNav = () => {
    const beforeLang = guestItemsBase.slice(0, 2) // Inicio, Buscar
    const afterLang = guestItemsBase.slice(2) // Iniciar sesión

    return (
      <>
        {beforeLang.map(renderNavItem)}
        {renderLanguageButton()}
        {afterLang.map(renderNavItem)}
      </>
    )
  }

  // Logueado:
  // sin admin: Inicio / Dashboard / Favoritos / Buscar / Idioma / Perfil
  // con admin: Inicio / Dashboard / Favoritos / Buscar / Menú / Idioma / Perfil
  const renderLoggedNav = () => {
    const perfilItem = loggedItemsFiltered.find((i) => i.href === '/perfil')
    const others = loggedItemsFiltered.filter((i) => i.href !== '/perfil')

    return (
      <>
        {others.map(renderNavItem)}
        {renderLanguageButton()}
        {perfilItem && renderNavItem(perfilItem)}
      </>
    )
  }

  return (
    <>
      {/* Overlay para cerrar cualquier menú haciendo click afuera */}
      {(isLangMenuOpen || (isLoggedIn && isAdmin && isMenuOpen)) && (
        <div className="fixed inset-0 z-40" onClick={closeAllMenus} />
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 h-16 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
        {/* SUBMENÚ ADMIN */}
        {isLoggedIn && isAdmin && isMenuOpen && (
          <div className="absolute bottom-16 inset-x-0 mb-2 z-50">
            <div className="mx-auto max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-xl p-2 grid grid-cols-2 gap-2 text-xs">
              {adminSubItems.map((sub) => {
                const isActive = pathname === sub.href
                return (
                  <button
                    key={sub.href}
                    type="button"
                    onClick={() => {
                      router.push(sub.href)
                      closeAllMenus()
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
        <div className="mx-auto max-w-md flex h-full items-center justify-between px-4 gap-1">
          {isLoggedIn ? renderLoggedNav() : renderGuestNav()}
        </div>
      </nav>
    </>
  )
}
