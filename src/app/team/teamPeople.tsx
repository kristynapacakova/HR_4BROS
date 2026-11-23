'use client'

import { useEffect, useState } from 'react'
import type { PersonRecord } from '@/lib/mock-data'
import { loadTeamProfiles, TEAM_PROFILE_CHANGED_EVENT, type TeamProfileOverride } from '@/lib/team-profile-client'
import { departmentColor, departmentInk } from '@/lib/team-colors'

/** Výchozí záliby pro demo (přebíjí je to, co si člověk uloží v medailonku). Schválně se překrývají. */
export const DEMO_INTERESTS: Record<string, string[]> = {
  t1: ['Jóga', 'Kafe', 'Hory'],
  t2: ['Lezení', 'Deskovky', 'Kafe'],
  t3: ['Fotografie', 'Běh', 'Film'],
  t4: ['Golf', 'Vaření', 'Hory'],
  t5: ['Keramika', 'Fotografie', 'Film'],
  t6: ['Běh', 'Deskovky', 'Lezení'],
  t7: ['Knihy', 'Film', 'Kafe'],
  t8: ['Tenis', 'Vaření', 'Golf'],
  t9: ['Jóga', 'Hory', 'Knihy'],
  t10: ['Film', 'Lezení', 'Fotografie'],
  t11: ['Běh', 'Knihy', 'Jóga'],
  t12: ['Skate', 'Deskovky', 'Film'],
  t13: ['Vaření', 'Zahrada', 'Kafe'],
  t14: ['Tenis', 'Hory', 'Běh'],
  t15: ['Keramika', 'Knihy', 'Jóga'],
  t16: ['Lezení', 'Hory', 'Deskovky'],
}

/** S čím ti pomůže — výchozí věta podle pozice. */
export const DEMO_HELP_WITH: Record<string, string> = {
  t1: 'Smlouvy, benefity a cokoliv kolem lidí',
  t2: 'React, TypeScript a vychytávky na webu',
  t3: 'Obsah na sítě, který lidi zastaví',
  t4: 'Jak mluvit s klientem, když to hoří',
  t5: 'Vizuál, který dává smysl',
  t6: 'PPC kampaně a čísla za nimi',
  t7: 'Texty, které se dobře čtou',
  t8: 'Obchodní nabídky a vyjednávání',
  t9: 'Plán projektu a hlídání termínů',
  t10: 'Video, animace a After Effects',
  t11: 'SEO a obsah pro vyhledávače',
  t12: 'Grafika, Figma a rychlé návrhy',
  t13: 'Kancelář, objednávky a provoz',
  t14: 'Nové příležitosti a partnerství',
  t15: 'E-mailing a automatizace',
  t16: 'Vývoj, architektura a code review',
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Record<string, TeamProfileOverride>>({})
  useEffect(() => {
    const refresh = () => setProfiles(loadTeamProfiles())
    refresh()
    window.addEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TEAM_PROFILE_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  return profiles
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches) }, [])
  return reduced
}

export const initials = (name: string) => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

export function daysUntil(raw: string | null | undefined): number | null {
  if (!raw) return null
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const [, m, d] = raw.split('-').map(Number)
  const next = new Date(now.getFullYear(), m - 1, d)
  if (next < now) next.setFullYear(now.getFullYear() + 1)
  return Math.round((next.getTime() - now.getTime()) / 86400000)
}

export function tenureMonths(start: Date): number {
  const now = new Date()
  return Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - new Date(start).getMonth())
}

export function tenureLabel(start: Date): string {
  const m = tenureMonths(start)
  const y = Math.floor(m / 12), r = m % 12
  const yl = y === 0 ? '' : y === 1 ? '1 rok' : y < 5 ? `${y} roky` : `${y} let`
  const ml = r === 0 ? '' : r === 1 ? '1 měsíc' : r < 5 ? `${r} měsíce` : `${r} měsíců`
  return [yl, ml].filter(Boolean).join(' ') || 'první dny'
}

export function plural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many
}

/** Data člověka po zohlednění toho, co si uložil v medailonku. */
export function personView(m: PersonRecord, o?: TeamProfileOverride) {
  return {
    ...m,
    photo: o?.photo ?? null,
    photoPos: o?.photoPos,
    bio: o?.bio ?? m.bio,
    interests: o?.interests && o.interests.length ? o.interests : DEMO_INTERESTS[m.id] ?? [],
    helpWith: o?.helpWith ?? DEMO_HELP_WITH[m.id] ?? '',
    birthdayEff: o?.birthday !== undefined ? o.birthday : m.birthday,
    color: departmentColor(m.department),
    ink: departmentInk(m.department),
  }
}
export type PersonView = ReturnType<typeof personView>

/** Fotka nebo iniciály na barvě týmu. */
export function Avatar({ p, size, fontSize }: { p: PersonView; size: number | string; fontSize?: number }) {
  return (
    <div className="relative overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: p.color, outline: p.color === '#FFFFFF' ? '1px solid rgba(13,33,79,0.25)' : undefined, outlineOffset: -1 }}>
      {p.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.photo}
          alt={p.name}
          className="w-full h-full object-cover"
          style={{ objectPosition: `${p.photoPos?.x ?? 50}% ${p.photoPos?.y ?? 50}%`, transform: `scale(${(p.photoPos?.zoom ?? 100) / 100})` }}
        />
      ) : (
        <span className="font-headline leading-none" style={{ color: p.ink, fontWeight: 600, fontSize: fontSize ?? 16 }}>{initials(p.name)}</span>
      )}
    </div>
  )
}

/** Fotka člověka (s pozicí z medailonku), jinak jemná silueta v barvě týmu. Vyplní rodiče. */
export function PhotoFill({ p, tone = 0.22 }: { p: PersonView; tone?: number }) {
  const sil = p.color.toUpperCase() === '#FFFFFF' || p.color === '#F0E100' || p.color === '#b9cbf3' ? '#0d214f' : p.color
  if (p.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.photo}
        alt={p.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: `${p.photoPos?.x ?? 50}% ${p.photoPos?.y ?? 50}%`, transform: `scale(${(p.photoPos?.zoom ?? 100) / 100})` }}
      />
    )
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 mx-auto h-[78%]" aria-hidden="true">
      <circle cx="50" cy="40" r="19" fill={sil} opacity={tone} />
      <path d="M14 100 V92 Q14 66 40 64 H60 Q86 66 86 92 V100 Z" fill={sil} opacity={tone} />
    </svg>
  )
}

/** Světlý odstín barvy týmu. */
export function tintOf(hex: string, amount = 0.22): string {
  if (hex.toUpperCase() === '#FFFFFF') return '#f3f0fd'
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(255 - (255 - c) * amount)
  return `rgb(${mix((n >> 16) & 255)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`
}
