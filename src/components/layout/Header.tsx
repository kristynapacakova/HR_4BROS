'use client'

import { Menu, Bell } from 'lucide-react'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  userName?: string | null
}

export function Header({ title, onMenuClick, userName }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-navy hover:text-navy-600 p-1 rounded-md hover:bg-slate-100"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-xl font-headline font-semibold text-navy">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-navy rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-semibold">
            {userName?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
