'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { VersionWatcher } from './VersionWatcher'
import { DEMO_TEAM } from '@/lib/mock-data'

const COLLAPSED_KEY = 'fb-sidebar-collapsed'

interface AppShellProps {
  children: React.ReactNode
  title: string
  isAdmin: boolean
  isTL?: boolean
  userName?: string | null
  userEmail?: string | null
  employmentType?: string | null
}

export function AppShell({ children, title, isAdmin, isTL, userName, userEmail, employmentType }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1') } catch { /* noop */ }
  }, [])

  const teamMemberId = userEmail
    ? DEMO_TEAM.find((m) => m.email.toLowerCase() === userEmail.toLowerCase())?.id
    : undefined

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c
      try { localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0') } catch { /* noop */ }
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F4FB]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${collapsed ? 'lg:w-[72px]' : 'lg:w-56'} w-56 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          isAdmin={isAdmin}
          isTL={isTL}
          userName={userName}
          userEmail={userEmail}
          employmentType={employmentType}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          teamMemberId={teamMemberId}
        />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
        <VersionWatcher />
      </div>
    </div>
  )
}
