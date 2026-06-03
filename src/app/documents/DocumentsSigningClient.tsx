'use client'

import { useState, useRef } from 'react'
import { Contract, ContractTemplate } from '@/lib/mock-data'
import { Pen, X, CheckCircle2, FileText, Download, ShieldCheck, Upload, KeyRound, Loader2, BadgeCheck, AlertCircle } from 'lucide-react'

function fillPlaceholders(body: string, values: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? `{{${k}}}`)
}

// Simulated CA issuers for demo
const FAKE_CERT_ISSUERS = ['PostSignum QCA 4', 'I.CA - Qualified CA/RSA', 'eIdentity CA']

type SignStep = 'read' | 'cert-upload' | 'cert-pin' | 'verifying' | 'done'

interface CertInfo {
  fileName: string
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  serialNumber: string
}

function fakeCertInfo(fileName: string, ownerName: string): CertInfo {
  const issuer = FAKE_CERT_ISSUERS[Math.floor(Math.random() * FAKE_CERT_ISSUERS.length)]
  const now = new Date()
  const from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const to = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate())
  const serial = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase()
  return {
    fileName,
    subject: `CN=${ownerName}, O=Four Bros s.r.o., C=CZ`,
    issuer,
    validFrom: from.toLocaleDateString('cs-CZ'),
    validTo: to.toLocaleDateString('cs-CZ'),
    serialNumber: serial,
  }
}

function SignModal({ contract, template, onSign, onClose }: {
  contract: Contract
  template: ContractTemplate | undefined
  onSign: (certInfo: CertInfo) => void
  onClose: () => void
}) {
  const [step, setStep] = useState<SignStep>('read')
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const filled = fillPlaceholders(template?.body ?? '', contract.values)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['p12', 'pfx', 'pem', 'crt'].includes(ext ?? '')) {
      alert('Nepodporovaný formát. Použijte soubor .p12, .pfx nebo .pem.')
      return
    }
    setCertInfo(fakeCertInfo(file.name, contract.employeeName))
    setStep('cert-pin')
  }

  function handlePinSubmit() {
    if (pin.length < 4) { setPinError(true); return }
    setPinError(false)
    setStep('verifying')
    // Simulate CA verification delay
    setTimeout(() => setStep('done'), 2800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-headline text-navy text-lg">{contract.templateName}</h2>
            <div className="flex items-center gap-2 mt-1">
              {(['read','cert-upload','cert-pin','verifying','done'] as SignStep[]).map((s, i, arr) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    step === s ? 'bg-violet text-white' :
                    arr.indexOf(step) > i ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {arr.indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  {i < arr.length - 1 && <div className={`w-4 h-0.5 ${arr.indexOf(step) > i ? 'bg-green-200' : 'bg-slate-100'}`} />}
                </div>
              ))}
              <span className="ml-2 text-xs text-slate-400">
                {step === 'read' && 'Přečíst dokument'}
                {step === 'cert-upload' && 'Nahrát certifikát'}
                {step === 'cert-pin' && 'Zadat PIN'}
                {step === 'verifying' && 'Ověřování...'}
                {step === 'done' && 'Podepsáno'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-navy rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step: Read */}
        {step === 'read' && (
          <>
            <div
              className="flex-1 overflow-y-auto px-6 py-5 prose prose-sm max-w-none text-navy"
              dangerouslySetInnerHTML={{ __html: filled }}
            />
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet flex-shrink-0" />
                Podpis bude proveden kvalifikovaným elektronickým certifikátem (eIDAS)
              </p>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={onClose} className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Zrušit</button>
                <button
                  onClick={() => setStep('cert-upload')}
                  className="flex items-center gap-2 px-5 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
                >
                  Pokračovat k podpisu
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step: Upload cert */}
        {step === 'cert-upload' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-6">
            <div className="w-16 h-16 bg-violet/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-violet" />
            </div>
            <div className="text-center">
              <h3 className="font-headline font-semibold text-navy text-lg">Nahrát kvalifikovaný certifikát</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Nahrajte svůj kvalifikovaný certifikát pro elektronický podpis (.p12, .pfx nebo .pem). Certifikát vydává PostSignum, I.CA nebo jiná akreditovaná CA.</p>
            </div>
            <input ref={fileRef} type="file" accept=".p12,.pfx,.pem,.crt" className="hidden" onChange={handleFileChange} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Vybrat soubor certifikátu
            </button>
            <p className="text-xs text-slate-400 text-center">
              Demo: certifikát není skutečně ověřován — simulujeme průběh pro ukázku.
            </p>
            <button onClick={() => setStep('read')} className="text-xs text-slate-400 hover:text-navy transition-colors">← Zpět na dokument</button>
          </div>
        )}

        {/* Step: PIN */}
        {step === 'cert-pin' && certInfo && (
          <div className="flex-1 flex flex-col px-8 py-8 gap-5">
            {/* Cert info card */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-violet" />
                <p className="text-sm font-medium text-navy">Načtený certifikát</p>
              </div>
              {[
                ['Soubor', certInfo.fileName],
                ['Vlastník', certInfo.subject],
                ['Vydavatel', certInfo.issuer],
                ['Platnost', `${certInfo.validFrom} – ${certInfo.validTo}`],
                ['Sériové číslo', certInfo.serialNumber],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3 text-xs">
                  <span className="text-slate-400 w-24 flex-shrink-0">{label}</span>
                  <span className="text-navy font-mono break-all">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-navy flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-violet" />
                PIN certifikátu
              </label>
              <input
                type="password"
                className={`input ${pinError ? 'border-red-300 focus:ring-red-300' : ''}`}
                placeholder="Zadejte PIN (min. 4 znaky)"
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError(false) }}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                autoFocus
              />
              {pinError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />PIN musí mít alespoň 4 znaky.</p>}
              <p className="text-xs text-slate-400">Demo: jakýkoliv PIN o 4+ znacích projde.</p>
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button onClick={() => setStep('cert-upload')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">← Zpět</button>
              <button
                onClick={handlePinSubmit}
                className="flex items-center gap-2 px-5 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Ověřit a podepsat
              </button>
            </div>
          </div>
        )}

        {/* Step: Verifying */}
        {step === 'verifying' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-5">
            <Loader2 className="w-12 h-12 text-violet animate-spin" />
            <div className="text-center space-y-1">
              <p className="font-headline font-semibold text-navy">Ověřování certifikátu</p>
              <p className="text-sm text-slate-400">Komunikace s certifikační autoritou {certInfo?.issuer}…</p>
            </div>
            <div className="w-full max-w-xs space-y-2 mt-2">
              {['Kontrola platnosti certifikátu', 'Ověření revokačního seznamu (CRL)', 'Aplikace kvalifikovaného podpisu'].map((msg, i) => (
                <div key={msg} className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && certInfo && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 gap-5">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
              <BadgeCheck className="w-9 h-9 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-headline font-semibold text-navy text-lg">Smlouva podepsána</h3>
              <p className="text-sm text-slate-400 mt-1">Kvalifikovaný elektronický podpis byl úspěšně aplikován.</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 w-full max-w-sm space-y-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-green-700 mb-1">
                <ShieldCheck className="w-4 h-4" />
                Podpis ověřen certifikační autoritou
              </div>
              {[
                ['Vlastník certifikátu', contract.employeeName],
                ['Vydavatel', certInfo.issuer],
                ['Čas podpisu', new Date().toLocaleString('cs-CZ')],
                ['Sériové číslo', certInfo.serialNumber],
              ].map(([l, v]) => (
                <div key={l} className="flex gap-3">
                  <span className="text-slate-400 w-36 flex-shrink-0">{l}</span>
                  <span className="text-navy font-mono">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { onSign(certInfo); onClose() }}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Dokončit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function DocumentsSigningClient({ contracts, templates }: {
  contracts: Contract[]
  templates: ContractTemplate[]
}) {
  const [list, setList] = useState(contracts)
  const [signing, setSigning] = useState<Contract | null>(null)

  const pending = list.filter(c => c.status === 'PENDING_EMPLOYEE')
  const signed = list.filter(c => c.status === 'SIGNED')

  function doSign(id: string, certInfo: CertInfo) {
    setList(prev => prev.map(c => c.id === id
      ? { ...c, status: 'SIGNED' as const, employeeSignedAt: new Date() }
      : c
    ))
  }

  if (pending.length === 0 && signed.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <FileText className="w-4 h-4 text-violet" />
        <h3 className="font-headline font-semibold text-navy">Smlouvy k podpisu</h3>
        {pending.length > 0 && (
          <span className="ml-auto text-xs bg-violet/10 text-violet px-2 py-0.5 rounded-full font-medium">
            {pending.length} čeká
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-50">
        {pending.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4 bg-violet/5">
            <div className="w-10 h-10 bg-violet/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Podepsáno vedením {c.managementSignedAt ? `(${new Date(c.managementSignedAt).toLocaleDateString('cs-CZ')})` : ''} · Čeká na váš kvalifikovaný podpis
              </p>
            </div>
            <button
              onClick={() => setSigning(c)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Podepsat
            </button>
          </div>
        ))}

        {signed.map(c => (
          <div key={c.id} className="px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy">{c.templateName}</p>
              <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Podepsáno kvalifikovaným certifikátem · {c.employeeSignedAt ? new Date(c.employeeSignedAt).toLocaleDateString('cs-CZ') : ''}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex-shrink-0 p-2 text-slate-300 hover:text-navy rounded-lg transition-colors"
              title="Stáhnout PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {signing && (
        <SignModal
          contract={signing}
          template={templates.find(t => t.id === signing.templateId)}
          onSign={(certInfo) => doSign(signing.id, certInfo)}
          onClose={() => setSigning(null)}
        />
      )}
    </div>
  )
}
