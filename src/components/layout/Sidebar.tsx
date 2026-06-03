'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  ClipboardList,
  FileText,
  CalendarDays,
  Banknote,
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
  Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const staticNavItemsBefore = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Můj účet', href: '/profile', icon: User },
]

const staticNavItemsMid = [
  { label: 'Moje docházka', href: '/time-off', icon: CalendarDays },
]

const staticNavItemsAfter = [
  { label: 'Schránka důvěry', href: '/feedback', icon: MessageSquareHeart },
  { label: 'Dokumenty a smlouvy', href: '/documents', icon: FileText },
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
]

interface SidebarProps {
  isAdmin: boolean
  userName?: string | null
  userEmail?: string | null
  employmentType?: string | null
  offboardingUnlocked?: boolean
  onClose?: () => void
}

export function Sidebar({ isAdmin, userName, userEmail, employmentType, offboardingUnlocked, onClose }: SidebarProps) {
  const pathname = usePathname()

  const payslipItem = {
    label: employmentType === 'ICO' ? 'Moje fakturace' : 'Moje výplata',
    href: '/payslips',
    icon: Banknote,
  }

  const navItems = [...staticNavItemsBefore, payslipItem, ...staticNavItemsMid, ...staticNavItemsAfter]

  return (
    <div className="flex flex-col h-full bg-navy text-white">
      {/* Logo header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-headline font-bold text-sm">4B</span>
          </div>
          <div>
            <p className="font-headline font-semibold text-white text-base leading-tight">Four Bros</p>
            <p className="text-navy-200 text-xs">HR Portál</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-navy-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Navigace</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-navy-800 text-white border-l-4 border-violet pl-2'
                  : 'text-navy-200 hover:bg-navy-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Onboarding | Offboarding */}
        <div>
          <Link
            href="/onboarding"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === '/onboarding'
                ? 'bg-navy-800 text-white border-l-4 border-violet pl-2'
                : 'text-navy-200 hover:bg-navy-800 hover:text-white'
            )}
          >
            <ClipboardList className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">Onboarding</span>
            <span className="text-navy-400 text-xs font-normal">|</span>
            <span className={cn(
              'flex items-center gap-1 text-xs',
              offboardingUnlocked ? 'text-green-400' : 'text-navy-400'
            )}>
              {offboardingUnlocked ? 'Offboarding' : (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Offboarding</span>
                </>
              )}
            </span>
          </Link>
        </div>

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-navy-400 uppercase tracking-wider">Administrace</p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-navy-800 text-white border-l-4 border-violet pl-2'
                      : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-navy-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">
              {userName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName || 'Uživatel'}</p>
            <p className="text-xs text-navy-300 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:bg-navy-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Odhlásit se</span>
        </button>
      </div>
    </div>
  )
}
