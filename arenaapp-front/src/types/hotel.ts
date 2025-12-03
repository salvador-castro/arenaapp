// src/types/hotel.ts

export type EstadoPublicacion = 'PUBLICADO' | 'BORRADOR' | 'OCULTO' | string

export interface Hotel {
  id: number
  nombre: string
  slug: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  zona: string | null
  pais: string | null
  lat: number | null
  lng: number | null
  telefono: string | null
  email_contacto: string | null
  sitio_web: string | null
  instagram: string | null
  facebook: string | null
  estrellas: number | null
  checkin_desde: string | null
  checkout_hasta: string | null
  precio_noche_desde: number | null
  rango_precio: number | null
  moneda: string | null
  es_destacado: boolean
  imagen_principal: string | null
  url_imagen: string | null
  url_maps: string | null
  url_reservas: string | null
  horario_text: string | null
  meta_title: string | null
  meta_description: string | null
  resena: string | null
  created_by: number | null
  updated_by: number | null
  estado: EstadoPublicacion
  created_at: string
  updated_at: string
}

export interface HotelDetalle {
  id: number
  hotel_id: number
  cant_habitaciones: number | null
  capacidad_max_adultos: number | null
  capacidad_max_ninos: number | null
  hora_checkin: string | null
  hora_checkout: string | null
  tipo_hotel: string | null
  tipo_recepcion: string | null
  wifi: boolean
  desayuno: boolean
  piscina: boolean
  bar: boolean
  ascensor: boolean
  servicio_limpieza: boolean
  restaurant: boolean
  estacionamiento: boolean
  gimnasio: boolean
  aire_acondicionado: boolean
  spa: boolean
  tv: boolean
  cocina: boolean
  business_center: boolean
  cuidado_ninos: boolean
  solo_adultos: boolean
  actividades_acuaticas: boolean
  refrigerador: boolean
  microondas: boolean
  minibar: boolean
  caja_fuerte: boolean
  sauna: boolean
  casino: boolean
  golf: boolean
  servicio_transfer: boolean
  room_service: boolean
  concierge: boolean
  lavanderia: boolean
  accesible: boolean
  secador_pelo: boolean
  mascotas_permitidas: boolean
  cancha_tenis: boolean
  jardin: boolean
  terraza: boolean
  traslado_aeropuerto: boolean
  servicio_planchado: boolean
  masajes: boolean
  juegos_ninos: boolean
  ping_pong: boolean
  karaoke: boolean
  jacuzzi: boolean
  hammam: boolean
  tratamientos_belleza: boolean
  alquiler_autos: boolean
  alquiler_bicicletas: boolean
  habitaciones_familiares: boolean
  entretenimiento_ninos: boolean
  club_nocturno: boolean
  entretenimiento: boolean
  lockers: boolean
  calefaccion: boolean
  pub_crawls: boolean
  happy_hour: boolean
  recepcion_24hs: boolean
}

export type AdminHotel = Hotel & {
  detalle: HotelDetalle | null
}

// payload que se envía desde el front
export interface AdminHotelPayload {
  hotel: Partial<Hotel> & {
    nombre: string
  }
  detalle: Partial<HotelDetalle>
}
