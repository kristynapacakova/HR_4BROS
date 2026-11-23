'use client'

import { useState } from 'react'

/**
 * Ilustrace pro Schránku důvěry — obálka se zámkem a krátký příběh:
 * dopis vjede do obálky, chlopeň se zavře, spadne odemčený zámek, přijede ruka s klíčem,
 * otočí jím, oko cvakne dolů (záblesk), ruka odjede a vyskočí brandové čtverečky.
 * Přehraje se při načtení a znovu po kliknutí. Respektuje prefers-reduced-motion (globals.css).
 */
export function SafeEnvelope({ className }: { className?: string }) {
  const [run, setRun] = useState(0)
  const origin = (x: number, y: number) => ({ transformBox: 'view-box' as const, transformOrigin: `${x}px ${y}px` })

  return (
    <button
      type="button"
      onClick={() => setRun(r => r + 1)}
      className={`block focus:outline-none ${className ?? ''}`}
      aria-label="Přehrát animaci obálky"
      title="Zpráva je zamčená"
    >
      <svg key={run} viewBox="0 -40 176 144" fill="none" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-auto env-anim" aria-hidden="true">
        {/* dopis — vjede do obálky (za tělo obálky) */}
        <g className="env-letter">
          <rect x="24" y="26" width="64" height="44" fill="#FFFFFF" />
          <rect x="32" y="34" width="36" height="4" fill="#0D214F" opacity="0.5" />
          <rect x="32" y="42" width="48" height="4" fill="#0D214F" opacity="0.3" />
          <rect x="32" y="50" width="28" height="4" fill="#834DFB" />
        </g>

        {/* tělo obálky — navy výplň schová dopis */}
        <rect x="12" y="24" width="88" height="60" fill="#0D214F" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M12 84L44 52M100 84L68 52" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" />

        {/* chlopeň — otevřená nahoru, pak se sklopí */}
        <path className="env-flap" style={origin(56, 24)} d="M12 24L56 58L100 24" stroke="#FFFFFF" strokeWidth="4" fill="none" />

        {/* zámek — spadne odemčený, oko cvakne až po otočení klíčem */}
        <g className="env-lock">
          <path className="env-shackle" d="M90 66V54H112V66" stroke="#834DFB" strokeWidth="4" />
          <rect x="82" y="66" width="38" height="30" fill="#F0E100" />
          <rect x="99" y="73" width="4" height="6" fill="#0D214F" />
          <rect x="100" y="79" width="2" height="8" fill="#0D214F" />
          <rect x="82" y="66" width="38" height="30" stroke="#0D214F" strokeWidth="2" />
        </g>

        {/* záblesk při zamčení */}
        <rect className="env-flash" style={origin(101, 81)} x="76" y="50" width="50" height="52" stroke="#F0E100" strokeWidth="2" />

        {/* ruka s klíčem — přijede zprava, otočí klíčem v zámku a odjede */}
        <g className="env-hand" style={origin(101, 81)}>
          {/* klíč: dřík v zámku, zuby, hranaté oko */}
          <rect x="101" y="79" width="34" height="4" fill="#F0E100" />
          <rect x="106" y="83" width="4" height="5" fill="#F0E100" />
          <rect x="113" y="83" width="4" height="3" fill="#F0E100" />
          <rect x="133" y="72" width="16" height="18" fill="#F0E100" />
          <rect x="138" y="78" width="6" height="6" fill="#0D214F" />
          {/* prsty kolem oka klíče */}
          <rect x="140" y="68" width="10" height="7" fill="#FFFFFF" />
          <rect x="143" y="75" width="10" height="7" fill="#FFFFFF" />
          <rect x="143" y="82" width="10" height="7" fill="#FFFFFF" />
          <rect x="140" y="89" width="10" height="6" fill="#FFFFFF" />
          {/* palec */}
          <rect x="128" y="66" width="12" height="6" fill="#FFFFFF" />
          {/* dlaň */}
          <rect x="150" y="66" width="16" height="30" fill="#FFFFFF" />
          <path d="M150 75H153M150 82H153M150 89H153" stroke="#0D214F" strokeOpacity="0.25" strokeWidth="1.5" />
          {/* rukáv */}
          <rect x="166" y="62" width="12" height="38" fill="#834DFB" />
        </g>

        {/* akcentní čtverečky — vyskočí na konci */}
        <rect className="env-spark" style={{ animationDelay: '3.35s' }} x="4" y="6" width="8" height="8" fill="#834DFB" />
        <rect className="env-spark" style={{ animationDelay: '3.45s' }} x="16" y="0" width="4" height="4" fill="#4DE791" />
        <rect className="env-spark" style={{ animationDelay: '3.55s' }} x="114" y="10" width="6" height="6" fill="#F0E100" />
        <rect className="env-spark" style={{ animationDelay: '3.65s' }} x="128" y="40" width="4" height="4" fill="#4DE791" />
      </svg>
    </button>
  )
}
