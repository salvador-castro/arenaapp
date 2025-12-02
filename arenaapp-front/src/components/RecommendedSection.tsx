// src/components/RecommendedSection.tsx
'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type Props = {
  isLoggedIn: boolean
}

export default function RecommendedSection ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)

  // Por ahora no hay info del admin → no mostrar cards
  const items: any[] = [] // esto después vendrá del backend

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Recomendados para vos</h2>

        <button
          type='button'
          className='text-xs font-medium text-emerald-400 underline underline-offset-4 cursor-pointer hover:text-emerald-300'
          onClick={() => goTo('/recomendados')}
        >
          Ver todos
        </button>
      </div>

      {items.length === 0 ? (
        <p className='text-xs text-slate-400'>
          Pronto vas a ver recomendaciones seleccionadas por el equipo de
          ArenaApp acá.
        </p>
      ) : (
        <div className='grid grid-cols-1 gap-3'>
          {/* acá irían las cards cuando el admin cargue info */}
        </div>
      )}
    </section>
  )
}
