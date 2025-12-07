'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuthRedirect } from 'src/hooks/useAuthRedirect'
import UserDropdown from '@/components/UserDropdown'

const LOGO_URL =
  'https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/logo/logo.png'

type TopNavProps = {
  isLoggedIn: boolean
}

export default function TopNav ({ isLoggedIn }: TopNavProps) {
  const pathname = usePathname()
  const { goTo } = useAuthRedirect(isLoggedIn)

  const isHome = pathname === '/'

  const handleLogoClick = () => {
    if (isLoggedIn) {
      // si está logueado lo mando al dashboard
      goTo('/dashboard')
    } else {
      // si no está logueado lo mando al home público
      goTo('/')
    }
  }

  return (
    <header className='sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur'>
      <div className='max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3'>
        <button
          type='button'
          onClick={handleLogoClick}
          className='flex items-center gap-2 focus:outline-none'
        >
          <div className='flex items-center gap-2'>
            <Image
              src={LOGO_URL}
              alt='ArenaPress'
              width={120}
              height={32}
              className='h-8 w-auto'
              priority
            />
          </div>
        </button>

        {/* En el home ("/") solo mostramos el logo.
            En /dashboard, /restaurantes, /bares, /galeria, etc. mostramos también el UserDropdown */}
        {!isHome && <UserDropdown />}
      </div>
    </header>
  )
}
