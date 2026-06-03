'use client'

import { Menu, Bell, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  userName?: string | null
}

export function Header({ title, onMenuClick, userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 px-6 py-3.5 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-navy p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-headline font-semibold text-navy tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/pravidla"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-500 hover:text-navy hover:bg-slate-100 transition-all duration-150"
        >
          <BookOpen className="w-4 h-4" />
          Pravidla
        </Link>
        <button className="relative p-2 text-slate-400 hover:text-navy rounded-xl hover:bg-slate-100 transition-all duration-150">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
          <span className="text-white text-xs font-semibold">
            {userName?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  )
}
