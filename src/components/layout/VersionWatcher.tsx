'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const POLL_MS = 30_000

/**
 * Polls /api/version and shows a reload prompt when a new deployment is live —
 * no more logging out just to see fresh changes.
 */
export function VersionWatcher() {
  const initial = useRef<string | null>(null)
  const [newVersion, setNewVersion] = useState(false)

  useEffect(() => {
    let stopped = false

    const check = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const { version } = (await res.json()) as { version: string }
        if (stopped || version === 'dev') return
        if (initial.current === null) {
          initial.current = version
        } else if (version !== initial.current) {
          setNewVersion(true)
        }
      } catch {
        // offline / transient error — try again next tick
      }
    }

    check()
    const t = setInterval(check, POLL_MS)
    return () => { stopped = true; clearInterval(t) }
  }, [])

  if (!newVersion) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80]">
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl transition-transform hover:scale-[1.03]"
        style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)' }}
      >
        <RefreshCw className="w-4 h-4" />
        K dispozici je nová verze — načíst
      </button>
    </div>
  )
}
