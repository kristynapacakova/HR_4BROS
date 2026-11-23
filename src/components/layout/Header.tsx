'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { HeaderAvatar } from '@/components/AvatarUpload'
import { RoleSwitcher } from './RoleSwitcher'
import { NotificationBell } from './NotificationBell'
import { IconBook } from '@/components/BrandIcons'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  userName?: string | null
  userEmail?: string | null
  teamMemberId?: string
}

export function Header({ title, onMenuClick, userName, userEmail, teamMemberId }: HeaderProps) {
  return (
    <header className="relative sticky top-0 z-30 bg-white border-b border-[rgba(13,33,79,0.12)] px-6 py-2.5 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-navy p-2 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-[15px] font-headline text-navy" style={{ fontWeight: 600 }}>{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <RoleSwitcher currentEmail={userEmail} />
        <Link
          href="/pravidla"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 border border-[rgba(13,33,79,0.18)] text-[12px] font-semibold text-navy hover:border-navy transition-colors"
        >
          <IconBook className="w-3.5 h-3.5" />
          Pravidla
        </Link>
        <NotificationBell userEmail={userEmail} />
        <HeaderAvatar initial={userName?.[0]?.toUpperCase() || 'U'} teamMemberId={teamMemberId} />
      </div>
    </header>
  )
}
