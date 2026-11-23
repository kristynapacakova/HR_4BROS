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
  { label: 'Správa směrnic', href: '/admin/smernice', icon: IconBook },
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
          'flex items-center gap-3 px-2.5 py-2 text-[13px] font-semibold transition-colors duration-150',
          isActive
            ? 'bg-gold text-navy'
            : 'text-white/85 hover:bg-white/10 hover:text-white'
        )}
      >
        <span className={cn('w-6 h-6 flex items-center justify-center flex-shrink-0', isActive ? 'bg-navy text-white' : 'text-white/70')}>
          <Icon className="w-[15px] h-[15px]" />
        </span>
        <span className="flex-1">{label}</span>
        {extra}
      </Link>
    )
  }

  return (
    <div className="relative flex flex-col h-full bg-navy text-white">
      {/* Logo — jako v Report Hubu */}
      <div className="relative flex items-start justify-between px-5 pt-6 pb-5">
        <Link href="/dashboard" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.svg" alt="4BROS" className="h-[22px] w-auto" />
          <p className="font-headline text-white/80 text-[15px] mt-1.5" style={{ fontWeight: 500 }}>HR Portál</p>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white p-1.5 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 pb-4 space-y-0.5 overflow-y-auto px-2.5 scrollbar-none">
        <p className="px-2.5 mb-2 mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">Navigace</p>

        {navItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}

        {isAdmin && (
          <>
            <p className="px-2.5 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">Administrace</p>
            {adminItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </>
        )}

        {isTL && !isAdmin && (
          <>
            <p className="px-2.5 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">Tým</p>
            {navLink('/admin/leave-calendar', 'Docházka firmy', IconCalendar)}
            {navLink('/admin/tym-fakturace', 'Fakturace týmu', IconChart)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="py-3 border-t border-white/10 mx-2.5">
        <div className="flex items-center mb-0.5 gap-3 px-2.5 py-2.5">
          <div className="w-8 h-8 bg-violet flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{userName || 'Uživatel'}</p>
            <p className="text-[11px] text-white/50 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full gap-3 px-2.5 py-2 text-[13px] font-semibold text-white/65 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <span className="w-6 h-6 flex items-center justify-center flex-shrink-0"><IconLogOut className="w-[15px] h-[15px]" /></span>
          <span>Odhlásit se</span>
        </button>
      </div>
    </div>
  )
}
