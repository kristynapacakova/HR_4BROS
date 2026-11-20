'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  IconDashboard, IconUser, IconHeart, IconBook, IconTeam,
  IconShield, IconContract, IconBanknote, IconCalendar, IconChart, IconLogOut,
} from '@/components/BrandIcons'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const staticNavItemsBefore = [
  { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
  { label: 'Můj účet', href: '/profile', icon: IconUser },
]

const staticNavItemsAfter = [
  { label: 'Schránka důvěry', href: '/feedback', icon: IconHeart },
  { label: 'Interní směrnice', href: '/smernice', icon: IconBook },
  { label: 'Tým Four Bros', href: '/team', icon: IconTeam },
]

const adminItems = [
  { label: 'Admin panel', href: '/admin', icon: IconShield },
  { label: 'Smlouvy', href: '/admin/smlouvy', icon: IconContract },
  { label: 'Schránka důvěry', href: '/admin/feedback', icon: IconHeart },
  { label: 'Přehled odměn', href: '/admin/odmeny', icon: IconBanknote },
]

interface SidebarProps {
  isAdmin: boolean
  isTL?: boolean
  userName?: string | null
  userEmail?: string | null
  employmentType?: string | null
  onClose?: () => void
}

export function Sidebar({ isAdmin, isTL, userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [...staticNavItemsBefore, ...staticNavItemsAfter]

  const navLink = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, extra?: React.ReactNode) => {
    const isActive = pathname === href
    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-navy text-white'
            : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
        )}
      >
        <Icon className={cn('w-[18px] h-[18px] flex-shrink-0 transition-colors', isActive ? 'text-white' : 'text-navy/50')} />
        <span className="flex-1">{label}</span>
        {extra}
      </Link>
    )
  }

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-[rgba(13,33,79,0.14)]">
      {/* Logo header */}
      <div className="relative flex items-center justify-between border-b border-[rgba(13,33,79,0.14)] px-5 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/symbol.svg" alt="4B" className="h-6 w-auto flex-shrink-0" />
          <p className="text-navy/50 text-[11px] tracking-wide border-l border-[rgba(13,33,79,0.14)] pl-3">HR Portál</p>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-navy/50 hover:text-navy p-1.5 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-3">
        <p className="kicker px-3 mb-2 mt-1">Navigace</p>

        {navItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}

        {isAdmin && (
          <>
            <div className="pt-5 pb-2 border-t border-[rgba(13,33,79,0.14)] mt-3">
              <p className="kicker px-3 pt-3">Administrace</p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </>
        )}

        {isTL && !isAdmin && (
          <>
            <div className="pt-5 pb-2 border-t border-[rgba(13,33,79,0.14)] mt-3">
              <p className="kicker px-3 pt-3">Tým</p>
            </div>
            {navLink('/admin/leave-calendar', 'Docházka firmy', IconCalendar)}
            {navLink('/admin/tym-fakturace', 'Fakturace týmu', IconChart)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="py-3 border-t border-[rgba(13,33,79,0.14)] px-3">
        <div className="flex items-center mb-0.5 gap-3 px-3 py-2.5">
          <div className="w-8 h-8 bg-violet flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy truncate leading-tight">{userName || 'Uživatel'}</p>
            <p className="text-[11px] text-navy/40 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-navy/50 hover:bg-slate-50 hover:text-navy transition-all duration-150"
        >
          <IconLogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Odhlásit se</span>
        </button>
      </div>
    </div>
  )
}
