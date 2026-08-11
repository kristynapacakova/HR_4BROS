'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  LogOut,
  Users,
  Users2,
  CheckSquare,
  Laptop,
  BarChart2,
  CalendarRange,
  MessageSquareHeart,
  BookOpen,
  Coins,
  FilePen,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const staticNavItemsBefore = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Můj účet', href: '/profile', icon: User },
]

const staticNavItemsAfter = [
  { label: 'Schránka důvěry', href: '/feedback', icon: MessageSquareHeart },
  { label: 'Interní směrnice', href: '/smernice', icon: BookOpen },
  { label: 'Tým Four Bros', href: '/team', icon: Users2 },
]

const adminItems = [
  { label: 'Admin panel', href: '/admin', icon: ShieldCheck },
  { label: 'Uživatelé', href: '/admin/employees', icon: Users },
  { label: 'Přehled docházky', href: '/admin/leave-calendar', icon: CalendarRange },
  { label: 'Žádosti o dovolenou', href: '/admin/leave-requests', icon: CheckSquare },
  { label: 'Přehled odměn', href: '/admin/odmeny', icon: Coins },
  { label: 'Smlouvy', href: '/admin/smlouvy', icon: FilePen },
  { label: 'Majetek', href: '/admin/assets', icon: Laptop },
  { label: 'Analytika', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Schránka důvěry', href: '/admin/feedback', icon: MessageSquareHeart },
  { label: 'Interní směrnice', href: '/admin/smernice', icon: BookOpen },
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
          'flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-violet/10 text-violet'
            : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-violet' : 'text-slate-400')} />
        <span className="flex-1">{label}</span>
        {extra}
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet flex-shrink-0" />}
      </Link>
    )
  }

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-slate-100 overflow-hidden">
      {/* Soft violet glow accent */}
      <div
        className="absolute -top-24 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.08), transparent 70%)', filter: 'blur(40px)' }}
      />

      {/* Logo header */}
      <div className="relative flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Four Bros" className="h-7 w-auto flex-shrink-0" />
          <p className="text-slate-400 text-[11px] tracking-wide border-l border-slate-200 pl-3">HR Portál</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-navy p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 mt-1">Navigace</p>

        {navItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}

        {isAdmin && (
          <>
            <div className="pt-5 pb-2">
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Administrace</p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </>
        )}

        {isTL && !isAdmin && (
          <>
            <div className="pt-5 pb-2">
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tým</p>
            </div>
            {navLink('/admin/leave-requests', 'Žádosti o dovolenou', CheckSquare)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5">
          <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-violet/15">
            <span className="text-white text-xs font-semibold">
              {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy truncate leading-tight">{userName || 'Uživatel'}</p>
            <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-full text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-navy transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Odhlásit se</span>
        </button>
      </div>
    </div>
  )
}
