/**
 * Malé geometrické znaky pro medailonek — čtverce z 4B palety místo emoji.
 * Ploché, bez zaoblení; barvy přes Tailwind tokeny (navy, gold, violet, mint).
 */
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = (p: P) => ({ width: 14, height: 14, viewBox: '0 0 16 16', 'aria-hidden': true, ...p })

/** Příběh — řádky textu. */
export function IconStory(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="0" y="1" width="16" height="3" className="fill-navy" />
      <rect x="0" y="6.5" width="11" height="3" className="fill-violet" />
      <rect x="0" y="12" width="7" height="3" className="fill-navy" />
    </svg>
  )
}

/** Co mě baví — 2×2 mřížka s jedním zlatým polem. */
export function IconLikes(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="0" y="0" width="7" height="7" className="fill-gold" />
      <rect x="9" y="0" width="7" height="7" className="fill-navy" />
      <rect x="0" y="9" width="7" height="7" className="fill-navy" />
      <rect x="9" y="9" width="7" height="7" className="fill-violet" />
    </svg>
  )
}

/** S čím pomůžu — dva překrývající se čtverce. */
export function IconHelp(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="0" y="0" width="10" height="10" className="fill-mint" />
      <rect x="6" y="6" width="10" height="10" className="fill-navy" />
    </svg>
  )
}

/** Galerie — rámeček s menším čtvercem. */
export function IconGallery(p: P) {
  return (
    <svg {...base(p)}>
      <rect x="1" y="1" width="14" height="14" fill="none" className="stroke-navy" strokeWidth="2" />
      <rect x="8" y="8" width="5" height="5" className="fill-violet" />
    </svg>
  )
}

/* Čipy v navy hlavičce — jednobarevné, berou currentColor. */
const chip = (p: P) => ({ width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': true, ...p })

/** Tým — plný čtverec. */
export function IconTeamMark(p: P) {
  return (
    <svg {...chip(p)}>
      <rect x="0" y="0" width="10" height="10" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

/** Seniorita — schody. */
export function IconSeniority(p: P) {
  return (
    <svg {...chip(p)}>
      <rect x="0" y="7" width="3" height="3" fill="currentColor" />
      <rect x="3.5" y="4" width="3" height="6" fill="currentColor" />
      <rect x="7" y="0" width="3" height="10" className="fill-gold" />
    </svg>
  )
}

/** Narozeniny — „dárek“ ze čtverců. */
export function IconBirthday(p: P) {
  return (
    <svg {...chip(p)}>
      <rect x="0" y="3" width="10" height="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="0" width="2" height="10" className="fill-gold" />
    </svg>
  )
}

/** Osobnost — kosočtverec. */
export function IconPersonality(p: P) {
  return (
    <svg {...chip(p)}>
      <rect x="2" y="2" width="6" height="6" fill="currentColor" transform="rotate(45 5 5)" />
    </svg>
  )
}
