'use client'

import { HotelDetalle } from '@/types/hotel'

const SERVICIOS_SECCIONES: {
  titulo: string
  items: { key: keyof HotelDetalle; label: string }[]
}[] = [
  {
    titulo: 'Principales',
    items: [
      { key: 'wifi', label: 'Wifi' },
      { key: 'desayuno', label: 'Desayuno' },
      { key: 'piscina', label: 'Piscina' },
      { key: 'estacionamiento', label: 'Estacionamiento' },
      { key: 'aire_acondicionado', label: 'Aire acondicionado' },
      { key: 'calefaccion', label: 'Calefacción' }
    ]
  },
  {
    titulo: 'Bienestar y spa',
    items: [
      { key: 'spa', label: 'Spa' },
      { key: 'sauna', label: 'Sauna' },
      { key: 'jacuzzi', label: 'Jacuzzi' },
      { key: 'hammam', label: 'Hammam' },
      { key: 'masajes', label: 'Masajes' },
      { key: 'tratamientos_belleza', label: 'Tratamientos de belleza' }
    ]
  },
  {
    titulo: 'Familias y niños',
    items: [
      { key: 'habitaciones_familiares', label: 'Habitaciones familiares' },
      { key: 'entretenimiento_ninos', label: 'Entretenimiento para niños' },
      { key: 'juegos_ninos', label: 'Juegos para niños' },
      { key: 'cuidado_ninos', label: 'Cuidado de niños' }
    ]
  },
  {
    titulo: 'Negocios y trabajo',
    items: [
      { key: 'business_center', label: 'Business center' },
      { key: 'salon', label: 'Club nocturno' } as any, // puedes ajustar si luego agregás un campo específico
      { key: 'lockers', label: 'Lockers' }
    ]
  },
  {
    titulo: 'Comodidades en la habitación',
    items: [
      { key: 'tv', label: 'TV' },
      { key: 'refrigerador', label: 'Refrigerador' },
      { key: 'microondas', label: 'Microondas' },
      { key: 'minibar', label: 'Minibar' },
      { key: 'caja_fuerte', label: 'Caja fuerte' },
      { key: 'secador_pelo', label: 'Secador de pelo' }
    ]
  },
  {
    titulo: 'Servicios y accesibilidad',
    items: [
      { key: 'room_service', label: 'Room service' },
      { key: 'concierge', label: 'Concierge' },
      { key: 'lavanderia', label: 'Lavandería' },
      { key: 'servicio_planchado', label: 'Servicio de planchado' },
      { key: 'accesible', label: 'Accesible' },
      { key: 'mascotas_permitidas', label: 'Mascotas permitidas' }
    ]
  },
  {
    titulo: 'Entretenimiento y actividades',
    items: [
      { key: 'casino', label: 'Casino' },
      { key: 'golf', label: 'Golf' },
      { key: 'cancha_tenis', label: 'Cancha de tenis' },
      { key: 'actividades_acuaticas', label: 'Actividades acuáticas' },
      { key: 'ping_pong', label: 'Ping pong' },
      { key: 'karaoke', label: 'Karaoke' },
      { key: 'club_nocturno', label: 'Club nocturno' },
      { key: 'entretenimiento', label: 'Entretenimiento' }
    ]
  },
  {
    titulo: 'Transporte',
    items: [
      { key: 'servicio_transfer', label: 'Servicio de transfer' },
      { key: 'traslado_aeropuerto', label: 'Traslado al aeropuerto' },
      { key: 'alquiler_autos', label: 'Alquiler de autos' },
      { key: 'alquiler_bicicletas', label: 'Alquiler de bicicletas' }
    ]
  },
  {
    titulo: 'Espacios exteriores',
    items: [
      { key: 'jardin', label: 'Jardín' },
      { key: 'terraza', label: 'Terraza' }
    ]
  },
  {
    titulo: 'Otros',
    items: [
      { key: 'happy_hour', label: 'Happy hour' },
      { key: 'pub_crawls', label: 'Pub crawls' },
      { key: 'recepcion_24hs', label: 'Recepción 24hs' }
    ]
  }
]

interface HotelServiciosSelectorProps {
  value: Partial<HotelDetalle>
  onChange: (value: Partial<HotelDetalle>) => void
  className?: string
}

export default function HotelServiciosSelector ({
  value,
  onChange,
  className
}: HotelServiciosSelectorProps) {
  function toggleServicio (key: keyof HotelDetalle) {
    const current = Boolean(value[key])
    onChange({
      ...value,
      [key]: !current
    })
  }

  return (
    <div className={className}>
      <p className='text-xs font-semibold mb-2'>Servicios del hotel</p>

      <div className='space-y-3 max-h-80 overflow-auto pr-1'>
        {SERVICIOS_SECCIONES.map(section => (
          <div key={section.titulo}>
            <p className='text-[11px] font-semibold text-slate-600 mb-1'>
              {section.titulo}
            </p>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {section.items.map(item => (
                <label
                  key={item.key as string}
                  className='flex items-center gap-1 text-[11px] cursor-pointer'
                >
                  <input
                    type='checkbox'
                    className='h-3 w-3'
                    checked={Boolean(value[item.key])}
                    onChange={() => toggleServicio(item.key)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
