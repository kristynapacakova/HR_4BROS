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
          <svg role="img" aria-label="Four Bros" viewBox="0 0 320.856 63.608" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 32, width: 'auto' }} className="mb-2">
            <path d="M273.987 63.6082C266.011 63.6082 259.641 61.8777 254.875 58.4165C250.16 54.9052 247.577 50.0396 247.125 43.8196H257.96C258.261 47.4312 259.816 50.1901 262.625 52.0962C265.434 54.0023 269.347 54.9554 274.363 54.9554C278.777 54.9554 282.138 54.203 284.445 52.6981C286.753 51.1933 287.907 48.936 287.907 45.9264C287.907 43.6189 287.129 41.763 285.574 40.3585C284.019 38.9038 281.636 37.8504 278.426 37.1983L266.387 34.7906C260.92 33.687 256.781 31.7558 253.972 28.9969C251.214 26.2381 249.834 22.7268 249.834 18.4631C249.834 12.9955 251.891 8.70668 256.004 5.59669C260.117 2.43653 265.71 0.856445 272.783 0.856445C279.906 0.856445 285.674 2.51177 290.089 5.82241C294.553 9.0829 297.086 13.6476 297.688 19.5164H286.853C285.348 12.6945 280.458 9.28354 272.181 9.28354C268.419 9.28354 265.459 10.0109 263.302 11.4656C261.145 12.8701 260.067 14.9016 260.067 17.5602C260.067 21.7235 263.052 24.4072 269.021 25.611L281.586 28.1693C287.204 29.2728 291.368 31.2291 294.076 34.0381C296.785 36.8472 298.139 40.5591 298.139 45.1739C298.139 50.9927 296.008 55.5323 291.744 58.7927C287.53 62.0031 281.611 63.6082 273.987 63.6082Z" fill="white"/>
            <path d="M211.242 63.6082C205.072 63.6082 199.655 62.3291 194.99 59.7709C190.375 57.1625 186.788 53.5007 184.23 48.7856C181.672 44.0704 180.393 38.5527 180.393 32.2323C180.393 25.8618 181.672 20.3441 184.23 15.6791C186.788 10.9639 190.375 7.32725 194.99 4.76902C199.604 2.16064 205.022 0.856445 211.242 0.856445C217.462 0.856445 222.879 2.13556 227.494 4.69378C232.159 7.25201 235.746 10.8887 238.254 15.6039C240.812 20.2689 242.091 25.8117 242.091 32.2323C242.091 38.5527 240.812 44.0704 238.254 48.7856C235.695 53.5007 232.109 57.1625 227.494 59.7709C222.879 62.3291 217.462 63.6082 211.242 63.6082ZM211.242 54.5039C217.612 54.5039 222.578 52.4975 226.14 48.4846C229.751 44.4717 231.557 39.0543 231.557 32.2323C231.557 25.3602 229.776 19.9428 226.215 15.9801C222.653 11.9672 217.662 9.96072 211.242 9.96072C204.871 9.96072 199.88 11.9672 196.269 15.9801C192.707 19.9428 190.926 25.3602 190.926 32.2323C190.926 39.1044 192.707 44.5469 196.269 48.5598C199.88 52.5226 204.871 54.5039 211.242 54.5039Z" fill="white"/>
            <path d="M121.948 62.7047V1.75879H152.196C158.516 1.75879 163.482 3.21347 167.094 6.12282C170.705 9.03217 172.511 13.1203 172.511 18.3872C172.511 21.3969 171.834 24.0304 170.48 26.2877C169.125 28.4947 167.119 30.2002 164.46 31.4041V31.7051C167.018 31.7051 169 32.4073 170.404 33.8118C171.809 35.1662 172.511 37.1476 172.511 39.756V62.7047H162.128V38.5521H132.407V62.7047H121.948ZM132.407 29.6735H151.368C154.829 29.6735 157.488 28.8459 159.344 27.1906C161.25 25.5352 162.203 23.2027 162.203 20.1931C162.203 17.1332 161.25 14.8007 159.344 13.1956C157.488 11.5402 154.829 10.7126 151.368 10.7126H132.407V29.6735Z" fill="white"/>
            <path d="M50.5626 62.7043V1.7584H40.104V25.9111H10.3834L23.4629 7.3639H12.1453L3.05176e-05 24.7072C3.05176e-05 27.9737 0.977966 30.455 2.93384 32.1511C4.88971 33.91 7.64889 34.7895 11.2114 34.7895L21.143 34.7896H40.104L40.1035 62.7043H50.5626Z" fill="white"/>
            <path d="M62.1202 62.7047V1.75879H92.4428C96.0544 1.75879 99.1895 2.41089 101.848 3.71508C104.557 4.96911 106.663 6.77492 108.168 9.13249C109.673 11.4399 110.426 14.1737 110.426 17.3339C110.426 20.5442 109.498 23.2529 107.642 25.46C105.786 27.6169 103.478 29.1218 100.719 29.9745V30.2755C102.926 30.6768 104.983 31.5295 106.889 32.8337C108.846 34.1379 110.426 35.8434 111.629 37.9501C112.833 40.0569 113.435 42.565 113.435 45.4743C113.435 48.9355 112.608 51.9702 110.952 54.5786C109.297 57.1368 106.99 59.1433 104.03 60.598C101.071 62.0025 97.6595 62.7047 93.7971 62.7047H62.1202ZM72.5789 53.6757H91.7656C95.327 53.6757 98.0859 52.8731 100.042 51.268C101.998 49.6628 102.977 47.3805 102.977 44.421C102.977 41.4113 101.998 39.154 100.042 37.6492C98.0859 36.0942 95.3521 35.3167 91.8408 35.3167H72.5789V53.6757ZM72.5789 26.8896H91.0884C93.8974 26.8896 96.0795 26.2124 97.6345 24.8581C99.1895 23.4535 99.967 21.4471 99.967 18.8387C99.967 16.2303 99.1895 14.2489 97.6345 12.8946C96.0795 11.4901 93.8974 10.7878 91.0884 10.7878H72.5789V26.8896Z" fill="white"/>
            <path d="M310.05 11.6034V9.37454M310.05 9.37454V6.03125H312.324C312.892 6.03125 314.03 6.03125 314.03 7.70289C314.03 9.37454 312.892 9.37454 312.324 9.37454M310.05 9.37454H312.324M312.324 9.37454L314.03 11.6034" stroke="white" strokeWidth="1.71269" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M312.04 16.7769C316.436 16.7769 320 13.2131 320 8.81665C320 4.42023 316.436 0.856445 312.04 0.856445C307.643 0.856445 304.08 4.42023 304.08 8.81665C304.08 13.2131 307.643 16.7769 312.04 16.7769Z" stroke="white" strokeWidth="1.71269" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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

        {/* 4B schody — levý dolní roh, zarovnané na stejnou osu jako nadpis */}
        <div className="flex items-end" style={{ width: 96, height: 96 }}>
          <div style={{ width: 24, height: '25%' }} className="bg-alice border border-white/30" />
          <div style={{ width: 24, height: '50%' }} className="bg-gold" />
          <div style={{ width: 24, height: '75%' }} className="bg-violet" />
          <div style={{ width: 24, height: '100%' }} className="bg-mint" />
        </div>

        {/* Rožky — pravý dolní roh, uvnitř tmavé plochy */}
        <div className="absolute right-0 bottom-0" style={{ width: 48, height: 48 }}>
          <div className="absolute top-0 right-0 bg-gold" style={{ width: 24, height: 24 }} />
          <div className="absolute bottom-0 left-0 bg-violet" style={{ width: 24, height: 24 }} />
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
