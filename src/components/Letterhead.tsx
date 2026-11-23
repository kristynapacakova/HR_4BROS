import type { ReactNode } from 'react'

/**
 * Hlavičkový papír 4Bros (Brand 2026, varianta s tenkou mřížkou):
 * bílá plocha, jemná 4sloupcová mřížka, logo vlevo nahoře, slogan vpravo,
 * dva kontaktní bloky, velký navy nadpis ve Funnel Display, barva jen v akcentech.
 * Stejný vzhled tiskne src/lib/letterhead.ts (PDF / tisk).
 */

export const LETTERHEAD_SLOGAN = ['4 kroky k marketingu,', 'který dává smysl.']
export const LETTERHEAD_GRID = '#ebe7f8'

export function LetterheadSheet({ left, right, title, subtitle, children, footer }: {
  left: ReactNode[]
  right: ReactNode[]
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative bg-white border border-[rgba(13,33,79,0.14)] text-navy overflow-hidden" style={{ minHeight: 900 }}>
      {/* tenká mřížka — 4 sloupce, vodorovné linky v rytmu stránky */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(to right, ${LETTERHEAD_GRID} 1px, transparent 1px), linear-gradient(to bottom, ${LETTERHEAD_GRID} 1px, transparent 1px)`,
          backgroundSize: '25% 100%, 100% 300px',
          backgroundPosition: '0 0, 0 190px',
        }}
      />

      <div className="relative px-10 sm:px-14 pt-12 pb-10 flex flex-col" style={{ minHeight: 900 }}>
        <div className="flex items-start justify-between gap-6 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="4BROS" className="h-7 w-auto" />
          <p className="text-[11px] font-bold leading-snug text-right">
            {LETTERHEAD_SLOGAN[0]}
            <br />
            {LETTERHEAD_SLOGAN[1]}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-[11px] leading-snug mb-12">
          <div>{left.map((l, i) => <p key={i}>{l}</p>)}</div>
          <div>{right.map((l, i) => <p key={i}>{l}</p>)}</div>
        </div>

        <h1 className="font-headline text-[32px] leading-[1.1] max-w-[75%] mb-5" style={{ fontWeight: 600 }}>{title}</h1>
        {subtitle && (
          <p className="font-headline text-[18px] leading-tight max-w-[75%] mb-8" style={{ fontWeight: 600 }}>{subtitle}</p>
        )}

        <div className="flex-1 max-w-[75%] min-w-[280px] letterhead-body text-[12.5px] leading-[1.6]">{children}</div>

        {footer && (
          <div className="mt-10 pt-4 border-t border-[rgba(13,33,79,0.14)] text-[10px] text-navy/55">{footer}</div>
        )}
      </div>
    </div>
  )
}
