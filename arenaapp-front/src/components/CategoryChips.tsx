// src/components/CategoryChips.tsx

const categories = [
  { id: 'restaurantes', emoji: '🥘', label: 'Restaurantes' },
  { id: 'cafes', emoji: '☕', label: 'Cafés' },
  { id: 'bares', emoji: '🍺', label: 'Bares' },
  { id: 'pizza', emoji: '🍕', label: 'Pizza' },
  { id: 'sushi', emoji: '🍣', label: 'Sushi' },
  { id: 'parrilla', emoji: '🥩', label: 'Parrilla' },
  { id: 'eventos', emoji: '🎉', label: 'Eventos' },
  { id: 'cerca', emoji: '📍', label: 'Cerca tuyo' }
]

export default function CategoryChips () {
  return (
    <div className='overflow-x-auto scrollbar-none'>
      <div className='flex gap-2 min-w-max'>
        {categories.map(cat => (
          <button
            key={cat.id}
            className='inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700 active:scale-[0.97] transition'
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
