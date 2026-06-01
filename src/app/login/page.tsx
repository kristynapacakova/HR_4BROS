'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const verify = searchParams.get('verify')
  const error = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn('nodemailer', { email, callbackUrl: '/dashboard' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-navy rounded-2xl mb-4 shadow-lg">
            <span className="text-white font-headline text-2xl font-bold">4B</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-navy">Four Bros HR</h1>
          <p className="text-slate-500 mt-1 text-sm">Interní HR portál</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
          {verify ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-headline font-semibold text-navy mb-2">Zkontrolujte e-mail</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Odeslali jsme vám přihlašovací odkaz na <strong>{email || 'váš e-mail'}</strong>.
                Kliknutím na odkaz se přihlásíte do HR portálu.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 text-violet text-sm hover:underline"
              >
                Zpět na přihlášení
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-headline font-semibold text-navy mb-1">Přihlásit se</h2>
              <p className="text-slate-500 text-sm mb-6">
                Zadejte svůj firemní e-mail a my vám zašleme přihlašovací odkaz.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">Nastala chyba při přihlášení. Zkuste to prosím znovu.</p>
                </div>
              )}

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
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet hover:bg-violet-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Odesílání...' : 'Odeslat přihlašovací odkaz'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  Přihlašovací odkaz je platný 24 hodin a lze jej použít jen jednou.
                  Přístup mají pouze zaměstnanci společnosti Four Bros.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 Four Bros s.r.o. — Všechna práva vyhrazena
        </p>
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
