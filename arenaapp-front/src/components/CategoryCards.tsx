'use client'

import Link from 'next/link'
import { 
  UtensilsCrossed, 
  Coffee, 
  Wine, 
  Calendar, 
  Image as ImageIcon, 
  Hotel, 
  ShoppingBag 
} from 'lucide-react'

interface Category {
  title: string
  icon: React.ReactNode
  href: string
  gradient: string
  description: string
  image: string
}

const categories: Category[] = [
  {
    title: 'Restaurantes',
    icon: <UtensilsCrossed className="w-8 h-8" />,
    href: '/restaurantes',
    gradient: 'from-orange-500 to-red-600',
    description: 'Descubre los mejores lugares para comer',
    image: '/categories/restaurant.png'
  },
  {
    title: 'Cafés',
    icon: <Coffee className="w-8 h-8" />,
    href: '/cafes',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Los cafés más acogedores de la ciudad',
    image: '/categories/cafe.png'
  },/*
  {
    title: 'Bares',
    icon: <Wine className="w-8 h-8" />,
    href: '/bares',
    gradient: 'from-purple-500 to-pink-600',
    description: 'La mejor vida nocturna y cócteles',
    image: '/categories/bar.png'
  },
  {
    title: 'Eventos',
    icon: <Calendar className="w-8 h-8" />,
    href: '/eventos',
    gradient: 'from-blue-500 to-cyan-600',
    description: 'No te pierdas los mejores eventos',
    image: '/categories/event.png'
  },*/
  {
    title: 'Galerías',
    icon: <ImageIcon className="w-8 h-8" />,
    href: '/galerias-museos',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Arte y cultura en tu ciudad',
    image: '/categories/gallery.png'
  },/*
  {
    title: 'Hoteles',
    icon: <Hotel className="w-8 h-8" />,
    href: '/hoteles',
    gradient: 'from-teal-500 to-emerald-600',
    description: 'Los mejores lugares para hospedarte',
    image: '/categories/hotel.png'
  },
  {
    title: 'Shopping',
    icon: <ShoppingBag className="w-8 h-8" />,
    href: '/shopping',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Las mejores tiendas y centros comerciales',
    image: '/categories/shopping.png'
  }*/
]

export default function CategoryCards() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Explora por categoría
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="group relative overflow-hidden rounded-2xl h-48 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ 
                backgroundImage: `url(${category.image})`,
              }}
            />
            
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
            
            {/* Gradient overlay for extra pop */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300 mix-blend-overlay`} />
            
            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300 shadow-lg">
                  {category.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                  {category.title}
                </h3>
                <p className="text-white/95 text-sm mb-3 drop-shadow-md">
                  {category.description}
                </p>
                
                <div className="flex items-center text-white font-medium group-hover:translate-x-1 transition-transform duration-300 drop-shadow-md">
                  Explorar
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
