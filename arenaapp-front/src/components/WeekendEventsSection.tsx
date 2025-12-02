// src/components/WeekendEventsSection.tsx
'use client'

import { useAuthRedirect } from 'src/hooks/useAuthRedirect'

type Props = {
  isLoggedIn: boolean
}

export default function WeekendEventsSection ({ isLoggedIn }: Props) {
  const { goTo } = useAuthRedirect(isLoggedIn)

  const events: any[] = [] // eventos cargados por admin en el futuro

  return (
    <section className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Eventos del finde</h2>

        <button
          type='button'
          className='text-xs font-medium text-emerald-400 underline underline-offset-4 cursor-pointer hover:text-emerald-300'
          onClick={() => goTo('/agenda')}
        >
          Ver agenda
        </button>
      </div>

      {events.length === 0 ? (
        <p className='text-xs text-slate-400'>
          Todavía no hay eventos cargados. El admin va a ir sumando propuestas.
        </p>
      ) : (
        <div className='space-y-3'>{/* cards de eventos */}</div>
      )}
    </section>
  )
}
