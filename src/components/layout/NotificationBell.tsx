'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { DEMO_NOTIFICATIONS } from '@/lib/mock-data'
import {
  loadNotifications, markRead, markAllRead,
  NOTIFICATIONS_CHANGED_EVENT, type AppNotification,
} from '@/lib/notifications-client'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days <= 0) return 'dnes'
  if (days === 1) return 'včera'
  if (days < 7) return `před ${days} dny`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `před ${weeks} ${weeks === 1 ? 'týdnem' : 'týdny'}`
  return new Date(iso).toLocaleDateString('cs-CZ')
}

export function NotificationBell({ userEmail }: { userEmail?: string | null }) {
  const [open, setOpen] = useState(false)
  const [all, setAll] = useState<AppNotification[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const refresh = () => setAll(loadNotifications(DEMO_NOTIFICATIONS))
    refresh()
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const mine = all
    .filter((n) => n.recipientEmail.toLowerCase() === userEmail?.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const unreadCount = mine.filter((n) => !n.read).length

  const openItem = (n: AppNotification) => {
    if (!n.read) markRead(n.id)
    setOpen(false)
    if (n.href) router.push(n.href)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-slate-400 hover:text-navy rounded-full hover:bg-slate-100 transition-all duration-150"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-violet rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-xl border border-slate-100 shadow-lg z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-navy">Notifikace</p>
            {unreadCount > 0 && (
              <button
                onClick={() => userEmail && markAllRead(userEmail)}
                className="text-xs font-medium text-violet hover:text-violet-dark transition-colors"
              >
                Označit vše jako přečtené
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {mine.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Zatím žádné notifikace.</p>
            ) : (
              mine.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-violet/[0.03]' : ''}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-violet' : 'bg-transparent'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-navy">{n.title}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{n.body}</span>
                    <span className="block text-[11px] text-slate-300 mt-1">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
