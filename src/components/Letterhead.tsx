import type { ReactNode } from 'react'

/**
 * Hlavičkový papír 4Bros (Brand 2026) ve dvou variantách:
 *  - 'grid'   — tenká 4sloupcová mřížka (smlouvy)
 *  - 'stairs' — jemné levandulové čtverce do schodů (směrnice)
 * Bílá plocha, logo vlevo nahoře, slogan vpravo,
 * dva kontaktní bloky, velký navy nadpis ve Funnel Display, barva jen v akcentech.
 * Stejný vzhled tiskne src/lib/letterhead.ts (PDF / tisk).
 */

export const LETTERHEAD_SLOGAN = ['4 kroky k marketingu,', 'který dává smysl.']
export const LETTERHEAD_GRID = '#ebe7f8'
export const LETTERHEAD_STAIR = '#f4f2fc'
export type LetterheadVariant = 'grid' | 'stairs'

/** Schody: 4 čtverce (22 % šířky) sestupují zprava nahoře doleva dolů — pozice v % A4 stránky. */
export const LETTERHEAD_STAIRS = [
  { left: 74.8, top: 30.3 },
  { left: 52.9, top: 46.5 },
  { left: 30.9, top: 62.9 },
  { left: 8.9, top: 79.1 },
]

export function LetterheadSheet({ variant = 'grid', left, right, title, subtitle, children, footer }: {
  variant?: LetterheadVariant
  left: ReactNode[]
  right: ReactNode[]
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative bg-white border border-[rgba(13,33,79,0.14)] text-navy overflow-hidden" style={{ minHeight: 900 }}>
      {variant === 'grid' ? (
        /* tenká mřížka — 4 sloupce, vodorovné linky v rytmu stránky */
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(to right, ${LETTERHEAD_GRID} 1px, transparent 1px), linear-gradient(to bottom, ${LETTERHEAD_GRID} 1px, transparent 1px)`,
            backgroundSize: '25% 100%, 100% 300px',
            backgroundPosition: '0 0, 0 190px',
          }}
        />
      ) : (
        /* schody — A4 box přes první stránku, čtverce v % jeho rozměrů */
        <div className="absolute left-0 right-0 top-0 pointer-events-none" aria-hidden="true" style={{ aspectRatio: '210 / 297' }}>
          {LETTERHEAD_STAIRS.map((sq, i) => (
            <div key={i} className="absolute" style={{ left: `${sq.left}%`, top: `${sq.top}%`, width: '22.2%', aspectRatio: '1', background: LETTERHEAD_STAIR }} />
          ))}
        </div>
      )}

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
