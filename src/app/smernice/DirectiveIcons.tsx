/**
 * Kategoriové ikony směrnic — geometrický styl brandových ikon (24×24, tlustý ostrý tah,
 * jeden vyplněný čtvereček). Kreslí se navy na barevné dlaždici podle kategorie.
 */
import type { DirectiveTheme } from '@/lib/mock-data'

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
}

/** Obecné / ostatní — dokument s řádky */
function IconDoc({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M8 8H16M8 12H16M8 16H11" />
      <rect x="14" y="15" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Důležité — výstražný čtverec */
function IconAlert({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M12 7V13" />
      <rect x="10.5" y="15.5" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** GDPR — hranatý štít s klíčovou dírkou */
function IconShield({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 3H20V13L12 21L4 13V3Z" />
      <rect x="10.5" y="8" width="3" height="5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** BOZP — schodovitá helma */
function IconHelmet({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 16V11H8V7H16V11H19V16" />
      <path d="M2 16H22V19H2V16Z" />
      <rect x="11" y="9" width="2" height="7" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Odměňování / benefity — dárková krabice */
function IconGift({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="10" width="16" height="11" />
      <path d="M2 6H22V10H2V6Z" />
      <path d="M12 6V21" />
      <rect x="7" y="2" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Onboarding / uvítání — vlajka na startu */
function IconFlag({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 21V3" />
      <path d="M5 4H19L16 8L19 12H5" />
      <rect x="9" y="6" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export interface CategoryStyle {
  icon: (p: IconProps) => JSX.Element
  label: string
  /** dlaždice ikony: pozadí + okraj */
  tile: string
}

/**
 * Kategorie → brandová barva. Odvozeno z témat v datech:
 * Onboarding (WELCOME) mint, Obecné (STANDARD) violet, BOZP gold, GDPR alice,
 * Odměňování (BENEFIT) mint-tint, Důležitá (IMPORTANT) gold-tint.
 */
export const CATEGORY_STYLES: Record<DirectiveTheme, CategoryStyle> = {
  WELCOME: { icon: IconFlag, label: 'Uvítání', tile: 'bg-mint border-mint' },
  STANDARD: { icon: IconDoc, label: 'Obecná', tile: 'bg-violet border-violet' },
  BOZP: { icon: IconHelmet, label: 'BOZP', tile: 'bg-gold border-gold' },
  GDPR: { icon: IconShield, label: 'GDPR', tile: 'bg-alice border-navy/20' },
  BENEFIT: { icon: IconGift, label: 'Benefity', tile: 'bg-mint-tint border-mint' },
  IMPORTANT: { icon: IconAlert, label: 'Důležitá', tile: 'bg-gold-tint border-gold' },
}

export function CategoryTile({ theme, size = 'md' }: { theme: DirectiveTheme; size?: 'md' | 'sm' }) {
  const s = CATEGORY_STYLES[theme]
  const Icon = s.icon
  const box = size === 'md' ? 'w-12 h-12' : 'w-9 h-9'
  const ico = size === 'md' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <div className={`${box} ${s.tile} border flex items-center justify-center flex-shrink-0 text-navy`}>
      <Icon className={ico} />
    </div>
  )
}
