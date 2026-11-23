'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { IntroAnimation } from './IntroAnimation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    try {
      if (!sessionStorage.getItem('fb-intro-seen')) setShowIntro(true)
    } catch { /* noop */ }
  }, [])

  const dismissIntro = () => {
    try { sessionStorage.setItem('fb-intro-seen', '1') } catch { /* noop */ }
    setShowIntro(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn('credentials', { email, callbackUrl: '/dashboard' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {showIntro && <IntroAnimation onDone={dismissIntro} />}

      {/* Levá polovina — navy, 4x4 mřížka, claim */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy text-white p-12 overflow-hidden">
        <div className="absolute inset-0 grid-4x4" />
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="Four Bros" className="h-7 w-auto brightness-0 invert mb-2" />
          <p className="kicker text-violet-light">HR Portál</p>
        </div>
        <div className="relative max-w-md">
          <h1 className="font-headline text-4xl font-semibold leading-tight mb-4">
            Pravda bez výmluv. I v docházce.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Všechno kolem týmu, dovolených, smluv a odměn na jednom místě. Přehledně a bez zbytečné administrativy.
          </p>
        </div>
        {/* 4B schody — velký architektonický prvek, zarovnaný na spodní okraj */}
        <div className="absolute left-0 bottom-0 flex items-end" style={{ width: 180, height: 180 }}>
          <div className="flex-1 h-[25%] bg-alice border border-white/30" />
          <div className="flex-1 h-[50%] bg-gold" />
          <div className="flex-1 h-[75%] bg-violet" />
          <div className="flex-1 h-full bg-mint" />
        </div>

        {/* Rožky — podpisová značka u dělicí čáry */}
        <div className="absolute right-0 bottom-0" style={{ width: 64, height: 64 }}>
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 32, height: 32 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 32, height: 32 }} />
        </div>
      </div>

      {/* Pravá polovina — off-white, karta s přihlášením */}
      <div className="flex items-center justify-center bg-alice p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.svg" alt="4BROS" className="h-9 mx-auto" />
          </div>

          <div className="rozky bg-white border border-[#0D214F] p-8">
            <div className="flex items-center gap-2 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/symbol.svg" alt="4B" className="h-5 w-auto" />
              <p className="kicker mb-0">Interní HR portál</p>
            </div>
            <h2 className="text-xl font-headline font-semibold text-navy mb-1">Přihlášení do HR Portálu</h2>
            <p className="text-navy/60 text-sm mb-6">
              Přístup pouze pro tým Four Bros přes firemní e-mail (@fourbros.cz).
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-[rgba(220,38,38,0.3)]">
                <p className="text-red-700 text-sm">Nastala chyba při přihlášení. Zkuste to prosím znovu.</p>
              </div>
            )}

            <div className="mb-5 p-3 bg-gold-tint border border-[rgba(240,225,0,0.4)]">
              <p className="text-navy text-xs font-bold mb-1">Demo verze</p>
              <p className="text-navy/70 text-xs leading-relaxed">
                <strong>admin@fourbros.cz</strong> — Admin &amp; HR,{' '}
                <strong>eva.horakova@fourbros.cz</strong> — Team Lead,{' '}
                <strong>tomas.dvorak@fourbros.cz</strong> — OSVČ,{' '}
                <strong>jan.novak@fourbros.cz</strong> — zaměstnanec.
                Libovolný jiný e-mail se přihlásí jako zaměstnanec. (Skutečné přihlášení přes Google účet vyžaduje
                napojení na Google Workspace, které v tomto demu není zapojené.)
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                  Firemní e-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@fourbros.cz"
                  required
                  className="w-full px-4 py-3 border border-[rgba(13,33,79,0.14)] text-sm focus:outline-none focus:border-[#0D214F] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-dark hover:text-white text-navy font-bold uppercase tracking-wide py-3 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se'}
              </button>
            </form>

            <div className="mt-6 pt-6 shadow-[inset_0_1px_0_rgba(13,33,79,0.14)]">
              <p className="text-xs text-navy/40 text-center leading-relaxed">
                Přístup mají pouze zaměstnanci společnosti Four Bros.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-navy/40 mt-6">
            © 2026 Four Bros — Všechna práva vyhrazena
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
