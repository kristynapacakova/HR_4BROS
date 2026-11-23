'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { IntroAnimation } from './IntroAnimation'

const DEMO_ACCOUNTS = [
  { email: 'admin@fourbros.cz', name: 'Admin & HR' },
  { email: 'eva.horakova@fourbros.cz', name: 'Eva Horáková', role: 'Team Lead' },
  { email: 'tomas.dvorak@fourbros.cz', name: 'Tomáš Dvořák', role: 'OSVČ' },
  { email: 'jan.novak@fourbros.cz', name: 'Jan Novák', role: 'Zaměstnanec' },
]

function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [showOther, setShowOther] = useState(false)
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

  const loginAs = async (accountEmail: string) => {
    setLoading(true)
    await signIn('credentials', { email: accountEmail, callbackUrl: '/dashboard' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-alice text-navy">
      {showIntro && <IntroAnimation onDone={dismissIntro} />}

      {/* Levá polovina — navy, claim + 4B schody (podle Report Hub reference) */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy text-white px-10 xl:px-11 pt-11 pb-6 overflow-hidden">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.svg" alt="4BROS" className="h-7 w-auto mb-10" />
          <p className="kicker text-gold text-[11px] mb-4">HR Portál</p>
          <h1
            className="font-headline leading-[1.08] tracking-[-0.015em] mb-7 max-w-[460px]"
            style={{ fontSize: 'clamp(2.5rem, 3.4vw, 3.25rem)', fontWeight: 600 }}
          >
            Makáme naplno.
            <br />
            Ale umíme i&nbsp;vypnout.
          </h1>
          <p className="text-white/75 text-[15px] leading-relaxed max-w-[420px]">
            Docházka, dovolené, smlouvy i&nbsp;odměny na jednom místě. Jasně, na rovinu a&nbsp;bez zbytečného papírování.
          </p>
        </div>

        {/* 4B schody — 01 Business / 02 Behavior / 03 Branding / 04 Boost */}
        <div className="relative flex items-end" aria-hidden="true">
          {[
            { n: '01', label: 'BUSINESS', cls: 'border border-white/80 text-white' },
            { n: '02', label: 'BEHAVIOR', cls: 'bg-gold text-navy' },
            { n: '03', label: 'BRANDING', cls: 'bg-violet text-white' },
            { n: '04', label: 'BOOST', cls: 'bg-mint text-navy' },
          ].map((s, i) => (
            <div
              key={s.n}
              className={`px-2 py-1.5 ${s.cls}`}
              style={{ width: 95, height: 47, marginBottom: i * 47 }}
            >
              <p className="text-[10px] font-bold leading-tight">{s.n}</p>
              <p className="text-[11px] font-bold leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Rožky — pravý dolní roh */}
        <div className="absolute right-0 bottom-0" style={{ width: 88, height: 70 }} aria-hidden="true">
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 44, height: 44 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 44, height: 26 }} />
        </div>
      </div>

      {/* Pravá polovina — světlá, přihlášení bez rámečku */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[332px]">
          <div className="lg:hidden mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.svg" alt="4BROS" className="h-7 w-auto" />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-navy flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/symbol.svg" alt="4B" className="w-7 h-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <p className="text-navy/70 text-[10px] font-semibold uppercase tracking-[0.14em] leading-snug">HR Portál</p>
              <p className="text-navy/70 text-[10px] font-semibold uppercase tracking-[0.14em] leading-snug">Interní HR Portál</p>
            </div>
          </div>

          <h2 className="font-headline text-navy text-[26px] leading-[1.2] mb-4" style={{ fontWeight: 600 }}>
            Přihlášení do HR&nbsp;Portálu
          </h2>
          <p className="text-navy/75 text-[13px] leading-relaxed mb-5">
            Pokračujte pomocí firemního e-mailu. Přístup je povolen pouze zaměstnancům Four&nbsp;Bros.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-[rgba(220,38,38,0.3)]">
              <p className="text-red-700 text-sm">Nastala chyba při přihlášení. Zkuste to prosím znovu.</p>
            </div>
          )}

          {!showPicker ? (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="btn-pill w-full flex items-center justify-center gap-2.5 bg-gold hover:bg-navy hover:text-white text-navy text-[12px] font-bold uppercase tracking-[0.06em] py-3 px-5 transition-colors"
              >
                <span className="btn-pill w-[18px] h-[18px] bg-white flex items-center justify-center flex-shrink-0">
                  <GoogleG className="w-2.5 h-2.5" />
                </span>
                Přihlásit přes Google
              </button>
              <p className="text-[11px] text-navy/45 mt-3 leading-relaxed">
                Simulace Google Workspace přihlášení — skutečné napojení v&nbsp;tomto demu není zapojené.
              </p>
            </>
          ) : (
            <div className="bg-white border border-[#E2DCF7]">
              <div className="px-4 py-3 border-b border-[#E2DCF7] flex items-center gap-2">
                <GoogleG className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm font-semibold text-navy">Vybrat účet</p>
              </div>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  disabled={loading}
                  onClick={() => loginAs(acc.email)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E2DCF7] hover:bg-alice transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">{acc.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{acc.name}</p>
                    <p className="text-xs text-navy/55 truncate">{acc.email}{acc.role ? ` · ${acc.role}` : ''}</p>
                  </div>
                </button>
              ))}

              {!showOther ? (
                <button
                  onClick={() => setShowOther(true)}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-violet hover:bg-alice transition-colors"
                >
                  + Použít jiný účet
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@fourbros.cz"
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 border border-[#D9D2F7] text-sm focus:outline-none focus:border-navy transition-all"
                  />
                  <p className="text-xs text-navy/50">Libovolný jiný e-mail se přihlásí jako zaměstnanec.</p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-pill w-full bg-gold hover:bg-navy hover:text-white text-navy text-[12px] font-bold uppercase tracking-[0.06em] py-3 px-4 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Přihlašování...' : 'Pokračovat'}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="mt-5 pt-5 border-t border-[#E2DCF7] text-[11px] text-navy/60 leading-relaxed">
            Po přihlášení zůstane relace aktivní 12&nbsp;hodin. Odhlásit se můžete kdykoliv přímo v&nbsp;aplikaci.
          </p>

          <p className="mt-10 text-[11px] text-navy/40">
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
