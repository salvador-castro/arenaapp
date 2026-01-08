// src/components/PromoBanner.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

export default function PromoBanner() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useLocale()

  // 🔥 Diccionario de traducciones
  const t = {
    es: {
      tag: 'Nuevo en ArenaApp',
      title: 'Guardá tus lugares favoritos en un solo tap ❤️',
      desc: 'Iniciá sesión para guardar bares, cafés y restaurantes que te gusten y volver a encontrarlos cuando quieras.',
      button: 'Iniciar sesión',
    },
    en: {
      tag: 'New on ArenaApp',
      title: 'Save your favorite places with just one tap ❤️',
      desc: 'Sign in to save bars, cafés and restaurants you like and find them again whenever you want.',
      button: 'Sign in',
    },
    pt: {
      tag: 'Novo no ArenaApp',
      title: 'Salve seus lugares favoritos com um único toque ❤️',
      desc: 'Faça login para salvar bares, cafés e restaurantes que você gosta e encontrá-los sempre que quiser.',
      button: 'Entrar',
    },
  }[locale]

  const goToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
  }

  return (
    <div className="rounded-2xl bg-linear-to-r from-indigo-500 via-violet-500 to-fuchsia-500 p-px shadow-lg">
      <div className="flex flex-col gap-2 rounded-2xl bg-slate-950/95 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-300">
          {t.tag}
        </p>

        <h3 className="text-sm font-semibold">{t.title}</h3>

        <p className="text-[11px] text-slate-300">{t.desc}</p>

        <div className="flex justify-end">
          <button
            className="mt-1 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-slate-200 active:scale-[0.97] transition cursor-pointer"
            onClick={goToLogin}
          >
            {t.button}
          </button>
        </div>
      </div>
    </div>
  )
}
