'use client'

import { useState, useRef, useEffect } from 'react'

const TIPOS_COMIDA = [
  'Asiática',
  'Brunch',
  'Cafetería',
  'Café de especialidad',
  'Cantina',
  'Carnes',
  'De Mar',
  'De Mercado',
  'De autor',
  'Francesa',
  'Fusión',
  'Internacional',
  'Italiana',
  'Mediterránea',
  'Mínima Intervención',
  'Opción Vegana',
  'Parrilla',
  'Pastelería',
  'Peruana',
  'Pescados',
  'Pizza',
  'Sushi'
]

interface TipoComidaRestaurantesProps {
  selected: string[]
  onChange: (values: string[]) => void
}

export default function TipoComidaRestaurantes ({
  selected,
  onChange
}: TipoComidaRestaurantesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside (event: MouseEvent) {
      if (!wrapperRef.current) return
      const target = event.target
      if (target instanceof Node && !wrapperRef.current.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function toggleOption (tipo: string) {
    const isSelected = selected.includes(tipo)
    let newSelected = isSelected
      ? selected.filter(t => t !== tipo)
      : [...selected, tipo]

    newSelected = newSelected.sort((a, b) =>
      a.localeCompare(b, 'es', { sensitivity: 'base' })
    )

    onChange(newSelected)
    // si querés que se cierre al elegir:
    // setIsOpen(false)
  }

  const filtered = TIPOS_COMIDA.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  const sortedSelected = [...selected].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  )

  const label =
    sortedSelected.length === 0
      ? 'Buscar tipo de comida...'
      : sortedSelected.join(', ')

  return (
    <div className='mt-3' ref={wrapperRef}>
      <label className='block text-xs mb-1 text-slate-300'>
        Tipo de comida *
      </label>

      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(o => !o)}
          className='w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 flex items-center justify-between'
        >
          <span className='truncate text-left text-xs sm:text-sm'>{label}</span>
          <span className='ml-2 text-slate-400 text-xs'>▼</span>
        </button>

        {isOpen && (
          <div className='absolute z-50 mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 shadow-xl max-h-80 overflow-hidden'>
            <div className='p-2 border-b border-slate-700'>
              <input
                type='text'
                className='w-full rounded-md bg-slate-800 border border-slate-600 px-2 py-1 text-sm text-slate-100'
                placeholder={
                  selected.length === 0
                    ? 'Buscar tipo de comida...'
                    : 'Buscar dentro de la lista...'
                }
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className='max-h-56 overflow-y-auto text-sm'>
              {filtered.length === 0 && (
                <div className='px-3 py-2 text-xs text-slate-500'>
                  No se encontraron resultados.
                </div>
              )}
              {filtered.map(tipo => {
                const isSelected = selected.includes(tipo)
                return (
                  <button
                    key={tipo}
                    type='button'
                    onClick={() => toggleOption(tipo)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800 ${
                      isSelected
                        ? 'bg-slate-800/80 text-emerald-300'
                        : 'text-slate-100'
                    }`}
                  >
                    <span>{tipo}</span>
                    {isSelected && <span className='text-xs'>✓</span>}
                  </button>
                )
              })}
            </div>
            <div className='flex justify-between items-center px-3 py-2 border-t border-slate-700 text-[11px] text-slate-400'>
              <button
                type='button'
                onClick={() => {
                  onChange([])
                  setSearch('')
                }}
                className='hover:text-emerald-400'
              >
                Limpiar selección
              </button>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='hover:text-emerald-400'
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
