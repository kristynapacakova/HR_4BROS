'use client'

import { useState } from 'react'
import type { DirectiveTheme } from '@/lib/mock-data'

const THEME_COLOR: Record<DirectiveTheme, string> = {
  WELCOME: '#4DE791',
  STANDARD: '#834DFB',
  BOZP: '#F0E100',
  GDPR: '#b9cbf3',
  BENEFIT: '#4DE791',
  IMPORTANT: '#F0E100',
}

/**
 * Animace pro Interní směrnice: štos stránek (jedna za každou směrnici, s barvou kategorie)
 * přiletí zprava, na horní stránce se „přečtou“ řádky a dopadne razítko — buď kolik zbývá,
 * nebo mint ✓, když je všechno odsouhlasené. Kliknutím se přehraje znovu.
 */
export function DirectivesStack({ themes, remaining }: { themes: DirectiveTheme[]; remaining: number }) {
  const [run, setRun] = useState(0)
  const pages = themes.slice(0, 4)
  const n = pages.length
  const done = remaining === 0
  const stampDelay = 0.35 + n * 0.18 + 0.55

  return (
    <button
      type="button"
      onClick={() => setRun(r => r + 1)}
      className="block w-40 focus:outline-none"
      aria-label="Přehrát animaci směrnic"
      title={done ? 'Všechno odsouhlaseno' : `Zbývá odsouhlasit: ${remaining}`}
    >
      <svg key={run} viewBox="0 0 160 120" className="w-full h-auto dir-anim" aria-hidden="true">
        {pages.map((t, i) => {
          const top = i === n - 1
          const rot = (i - (n - 1)) * 5 // spodní stránky natočené víc
          return (
            <g
              key={i}
              className="dir-page"
              style={{
                animationDelay: `${0.15 + i * 0.18}s`,
                transformBox: 'view-box',
                transformOrigin: '70px 110px',
                ['--rot' as string]: `${rot}deg`,
              }}
            >
              <rect x="38" y="14" width="64" height="86" fill="#FFFFFF" />
              <rect x="38" y="14" width="64" height="86" fill="none" stroke="#0D214F" strokeOpacity="0.15" />
              <rect x="46" y="22" width="12" height="12" fill={THEME_COLOR[t]} />
              {[44, 52, 60, 68, 76].map((y, k) => (
                <rect
                  key={y}
                  className={top ? 'dir-line' : undefined}
                  style={top ? { animationDelay: `${0.35 + n * 0.18 + k * 0.08}s`, transformBox: 'fill-box', transformOrigin: 'left center' } : undefined}
                  x="46" y={y} width={k === 4 ? 26 : 48} height="3.5"
                  fill="#0D214F" opacity={top ? 0.35 : 0.15}
                />
              ))}
            </g>
          )
        })}

        {/* razítko */}
        <g className="dir-stamp" style={{ animationDelay: `${stampDelay}s`, transformBox: 'view-box', transformOrigin: '112px 84px' }}>
          <rect x="94" y="66" width="36" height="36" fill={done ? '#4DE791' : '#F0E100'} />
          <rect x="94" y="66" width="36" height="36" fill="none" stroke="#0D214F" strokeWidth="2" />
          {done ? (
            <path d="M103 84L110 91L122 76" stroke="#0D214F" strokeWidth="4" fill="none" strokeLinecap="square" />
          ) : (
            <text x="112" y="92" textAnchor="middle" fontFamily="Funnel Display, sans-serif" fontWeight="600" fontSize="22" fill="#0D214F">{remaining}</text>
          )}
        </g>
        <rect className="dir-spark" style={{ animationDelay: `${stampDelay + 0.25}s` }} x="136" y="58" width="6" height="6" fill="#834DFB" />
        <rect className="dir-spark" style={{ animationDelay: `${stampDelay + 0.33}s` }} x="86" y="104" width="4" height="4" fill="#4DE791" />
      </svg>
    </button>
  )
}
