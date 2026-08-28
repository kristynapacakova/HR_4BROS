'use client'

import { Menu, Bell, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { HeaderAvatar } from '@/components/AvatarUpload'
import { RoleSwitcher } from './RoleSwitcher'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  userName?: string | null
  userEmail?: string | null
  teamMemberId?: string
}

export function Header({ title, onMenuClick, userName, userEmail, teamMemberId }: HeaderProps) {
  return (
    <header className="relative sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 px-6 py-3.5 flex items-center gap-4">
      <div
        className="absolute -top-16 right-12 w-48 h-48 rounded-full pointer-events-none -z-10 overflow-hidden"
        style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.10), transparent 70%)', filter: 'blur(30px)' }}
      />
      <button
        onClick={onMenuClick}
        className="lg:hidden text-navy p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-headline font-semibold text-navy tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <RoleSwitcher currentEmail={userEmail} />
        <Link
          href="/pravidla"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-500 hover:text-navy hover:bg-slate-100 transition-all duration-150"
        >
          <BookOpen className="w-4 h-4" />
          Pravidla
        </Link>
        <button className="relative p-2 text-slate-400 hover:text-navy rounded-full hover:bg-slate-100 transition-all duration-150">
          <Bell className="w-5 h-5" />
        </button>
        <HeaderAvatar initial={userName?.[0]?.toUpperCase() || 'U'} teamMemberId={teamMemberId} />
      </div>
    </header>
  )
}
