// src/components/NearbySection.tsx
'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type Props = {
  isLoggedIn: boolean
}

export default function NearbySection ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)

  const places: any[] = [] // datos del admin más adelante

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Lugares cerca tuyo</h2>

        <button
          type='button'
          className='text-xs font-medium text-emerald-400 underline underline-offset-4 cursor-pointer hover:text-emerald-300'
          onClick={() => goTo('/lugares')}
        >
          Explorar lugares
        </button>
      </div>

      {places.length === 0 ? (
        <p className='text-xs text-slate-400'>
          Cuando el admin cargue lugares, los vas a ver listados acá.
        </p>
      ) : (
        <div className='grid grid-cols-1 gap-3'>{/* cards de lugares */}</div>
      )}
    </section>
  )
}
