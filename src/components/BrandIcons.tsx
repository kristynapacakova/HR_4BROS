/**
 * 4Bros brandové ikony — nahrazují tenké outline ikony (Lucide) v navigaci a klíčových
 * akcích. Konstrukce: 24×24 grid, tlustý ostrý tah (stroke-width 2, square/miter),
 * každá ikona má 1 vyplněný akcentní čtvereček (violet/gold/mint).
 */
import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 2,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
}

export function IconDashboard({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="3" width="8" height="8" stroke="currentColor" />
      <rect x="13" y="3" width="8" height="8" stroke="currentColor" />
      <rect x="3" y="13" width="8" height="8" stroke="currentColor" />
      <rect x="14" y="14" width="6" height="6" fill="#834DFB" />
    </svg>
  )
}

export function IconUser({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="6" y="3" width="12" height="9" stroke="currentColor" />
      <rect x="3" y="15" width="18" height="6" stroke="currentColor" />
      <rect x="15" y="17" width="3" height="3" fill="#F0E100" />
    </svg>
  )
}

export function IconHeart({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <path d="M12 20V11M12 11H5V4H12V11ZM12 11H19V4H12" stroke="currentColor" />
      <rect x="16" y="15" width="4" height="4" fill="#4DE791" />
    </svg>
  )
}

export function IconBook({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="4" width="18" height="16" stroke="currentColor" />
      <path d="M12 4V20" stroke="currentColor" />
      <rect x="14" y="7" width="3" height="3" fill="#834DFB" />
    </svg>
  )
}

export function IconTeam({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="4" width="8" height="8" stroke="currentColor" />
      <rect x="13" y="4" width="8" height="8" stroke="currentColor" />
      <path d="M3 20V16H11V20M13 20V16H21V20" stroke="currentColor" />
      <rect x="15" y="6" width="3" height="3" fill="#F0E100" />
    </svg>
  )
}

export function IconShield({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <path d="M12 3L20 6V12C20 17 16.5 20 12 21C7.5 20 4 17 4 12V6L12 3Z" stroke="currentColor" />
      <rect x="9.5" y="10.5" width="4" height="4" fill="#4DE791" />
    </svg>
  )
}

export function IconContract({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="5" y="3" width="14" height="18" stroke="currentColor" />
      <path d="M8 8H16M8 12H16" stroke="currentColor" />
      <rect x="8" y="15" width="4" height="4" fill="#834DFB" />
    </svg>
  )
}

export function IconBanknote({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="2" y="6" width="20" height="12" stroke="currentColor" />
      <rect x="10" y="10" width="4" height="4" fill="#F0E100" />
    </svg>
  )
}

export function IconCalendar({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="5" width="18" height="16" stroke="currentColor" />
      <path d="M3 10H21M7 3V6M17 3V6" stroke="currentColor" />
      <rect x="14" y="13" width="4" height="4" fill="#834DFB" />
    </svg>
  )
}

export function IconBell({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <path d="M6 10C6 6 8.5 4 12 4C15.5 4 18 6 18 10V15L20 18H4L6 15V10Z" stroke="currentColor" />
      <path d="M10 20H14" stroke="currentColor" />
      <rect x="15.5" y="4" width="3.5" height="3.5" fill="#F0E100" />
    </svg>
  )
}

export function IconLogOut({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="3" width="10" height="18" stroke="currentColor" />
      <path d="M13 12H21M21 12L17.5 8.5M21 12L17.5 15.5" stroke="currentColor" />
    </svg>
  )
}

export function IconCheck({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="3" y="3" width="18" height="18" stroke="currentColor" />
      <path d="M7 12L10.5 15.5L17 8" stroke="currentColor" />
      <rect x="14" y="3" width="3" height="3" fill="#4DE791" />
    </svg>
  )
}

export function IconLaptop({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <rect x="4" y="4" width="16" height="11" stroke="currentColor" />
      <path d="M2 19H22" stroke="currentColor" />
      <rect x="15" y="7" width="3" height="3" fill="#F0E100" />
    </svg>
  )
}

export function IconReceipt({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <path d="M6 3H18V21L15 19L12 21L9 19L6 21V3Z" stroke="currentColor" />
      <path d="M9 8H15M9 12H15" stroke="currentColor" />
      <rect x="9" y="15" width="3" height="3" fill="#4DE791" />
    </svg>
  )
}

export function IconChart({ className, ...p }: IconProps) {
  return (
    <svg {...base} className={className} {...p}>
      <path d="M4 20V4M4 20H20" stroke="currentColor" />
      <rect x="7" y="13" width="3" height="7" fill="currentColor" />
      <rect x="12" y="9" width="3" height="11" fill="currentColor" />
      <rect x="17" y="5" width="3" height="4" fill="#834DFB" />
    </svg>
  )
}
