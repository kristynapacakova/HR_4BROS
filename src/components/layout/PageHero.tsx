import type { ReactNode } from 'react'

/**
 * Jednotná navy hlavička stránky (bez mřížky): žlutý kicker, velký nadpis, popis,
 * volitelný obsah vpravo a rožky v rohu. Používají ji všechny záložky, ať přechody neskáčou.
 */
export function PageHero({ kicker, title, children, aside, className = '' }: {
  kicker?: string
  title: ReactNode
  children?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <section className={`relative bg-navy text-white overflow-hidden mb-6 ${className}`}>
      <div className="relative flex flex-col md:flex-row md:items-end gap-6 px-7 sm:px-9 py-8">
        <div className="flex-1 min-w-0">
          {kicker && <p className="kicker text-gold text-[11px] mb-2">{kicker}</p>}
          <h1 className="font-headline text-[32px] sm:text-[38px] leading-[1.05]" style={{ fontWeight: 600 }}>{title}</h1>
          {children && <div className="text-white/70 text-[15px] leading-relaxed mt-3 max-w-2xl">{children}</div>}
        </div>
        {aside && <div className="flex-shrink-0">{aside}</div>}
      </div>
      <div className="absolute right-0 bottom-0" style={{ width: 36, height: 36 }} aria-hidden="true">
        <div className="absolute top-0 right-0 bg-gold" style={{ width: 18, height: 18 }} />
        <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 18, height: 18 }} />
      </div>
    </section>
  )
}
