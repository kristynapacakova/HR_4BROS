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
  GraduationCap,
  Dumbbell,
  X,
  ChevronLeft,
  ChevronRight,
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
  { label: 'Vzdělávací budget', href: '/admin/vzdelavani', icon: GraduationCap },
  { label: 'Sportovní benefit', href: '/admin/benefity', icon: Dumbbell },
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
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export function Sidebar({ isAdmin, isTL, userName, userEmail, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [...staticNavItemsBefore, ...staticNavItemsAfter]

  const navLink = (href: string, label: string, Icon: React.ComponentType<{ className?: string }>, extra?: React.ReactNode) => {
    const isActive = pathname === href
    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        title={collapsed ? label : undefined}
        className={cn(
          'flex items-center rounded-full text-sm font-medium transition-all duration-150',
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3.5 py-2.5',
          isActive
            ? 'bg-violet/10 text-violet'
            : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0 transition-colors', isActive ? 'text-violet' : 'text-slate-400')} />
        {!collapsed && <span className="flex-1">{label}</span>}
        {!collapsed && extra}
        {!collapsed && isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet flex-shrink-0" />}
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
      <div className={cn('relative flex items-center border-b border-slate-100', collapsed ? 'justify-center px-2 py-5' : 'justify-between px-5 py-5')}>
        <div className={cn('flex items-center', collapsed ? '' : 'gap-3')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Four Bros" className="h-7 w-auto flex-shrink-0" />
          {!collapsed && <p className="text-slate-400 text-[11px] tracking-wide border-l border-slate-200 pl-3">HR Portál</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-navy p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      {onToggleCollapsed && (
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Rozbalit menu' : 'Zúžit na ikonky'}
          className={cn(
            'hidden lg:flex items-center text-slate-400 hover:text-navy hover:bg-slate-50 transition-colors relative',
            collapsed ? 'justify-center py-2 border-b border-slate-100' : 'justify-end px-3 py-1.5 border-b border-slate-100'
          )}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Nav */}
      <nav className={cn('flex-1 py-4 space-y-0.5 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        {!collapsed && <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 mt-1">Navigace</p>}

        {navItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}

        {isAdmin && (
          <>
            <div className={cn('pt-5 pb-2', collapsed && 'border-t border-slate-100 mt-3')}>
              {!collapsed && <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Administrace</p>}
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </>
        )}

        {isTL && !isAdmin && (
          <>
            <div className={cn('pt-5 pb-2', collapsed && 'border-t border-slate-100 mt-3')}>
              {!collapsed && <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tým</p>}
            </div>
            {navLink('/admin/leave-requests', 'Žádosti o dovolenou', CheckSquare)}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className={cn('py-3 border-t border-slate-100', collapsed ? 'px-2' : 'px-3')}>
        <div className={cn('flex items-center mb-0.5', collapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2.5 rounded-xl')} title={collapsed ? (userName || userEmail || '') : undefined}>
          <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-violet/15">
            <span className="text-white text-xs font-semibold">
              {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy truncate leading-tight">{userName || 'Uživatel'}</p>
              <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title={collapsed ? 'Odhlásit se' : undefined}
          className={cn(
            'flex items-center w-full rounded-full text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-navy transition-all duration-150',
            collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Odhlásit se</span>}
        </button>
      </div>
    </div>
  )
}
