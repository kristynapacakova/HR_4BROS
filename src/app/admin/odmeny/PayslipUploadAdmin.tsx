'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { DEMO_TEAM } from '@/lib/mock-data'
import { Avatar, personView, useProfiles } from '@/app/team/teamPeople'
import { pushNotification } from '@/lib/notifications-client'
import {
  loadPayslipFiles, savePayslipFile, removePayslipFile, openPayslipFile, payslipKey,
  PAYSLIP_FILES_CHANGED_EVENT, type PayslipFile,
} from '@/lib/payslip-file-client'

const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec']
const TYPE_LABEL: Record<string, string> = { HPP: 'HPP', DPP: 'DPP', DPC: 'DPČ' }
/** Výplatní pásky dostávají zaměstnanci (HPP, DPP, DPČ) — OSVČ fakturují */
const PAYROLL_TYPES = ['HPP', 'DPP', 'DPC']

/** odstraní diakritiku a velikost písmen — pro párování souborů podle příjmení */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function PayslipUploadAdmin() {
  const profiles = useProfiles()
  // výchozí = minulý měsíc (páska za něj se vydává tento měsíc)
  const now = new Date()
  const [period, setPeriod] = useState(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return { month: d.getMonth() + 1, year: d.getFullYear() }
  })
  const [files, setFiles] = useState<Record<string, PayslipFile>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const bulkRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const refresh = () => setFiles(loadPayslipFiles())
    refresh()
    window.addEventListener(PAYSLIP_FILES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(PAYSLIP_FILES_CHANGED_EVENT, refresh)
  }, [])

  const people = DEMO_TEAM.filter(m => PAYROLL_TYPES.includes(m.employmentType))
  const label = `${MONTHS[period.month - 1]} ${period.year}`
  const uploaded = people.filter(m => files[payslipKey(m.id, period.month, period.year)]).length

  const shift = (d: number) => setPeriod(p => {
    const x = new Date(p.year, p.month - 1 + d, 1)
    return { month: x.getMonth() + 1, year: x.getFullYear() }
  })

  async function upload(m: typeof people[number], file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) { setMsg('Nahrát jde jen PDF.'); return }
    await savePayslipFile(m.id, period.month, period.year, file)
    pushNotification({
      recipientEmail: m.email,
      title: `Výplatní páska za ${label} je k dispozici`,
      body: 'Najdeš ji v sekci Moje odměna.',
      href: '/profile?tab=vyplata',
    })
    setMsg(`Nahráno: ${m.name} · ${label}`)
  }

  /** Hromadné nahrání — soubory se spárují s lidmi podle příjmení v názvu (např. „novak_2026-10.pdf“). */
  async function bulk(list: FileList) {
    const done: string[] = []
    const unmatched: string[] = []
    for (const f of Array.from(list)) {
      const n = norm(f.name)
      const m = people.find(p => n.includes(norm(p.name.split(' ').slice(-1)[0])))
      if (m) { await upload(m, f); done.push(m.name) } else unmatched.push(f.name)
    }
    setMsg(`Nahráno ${done.length}${unmatched.length ? ` · nespárováno: ${unmatched.join(', ')}` : ''}`)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        Výplatní pásky pro HPP, DPP a DPČ. Nahraj PDF ke každému člověku — uvidí ho v sekci Moje odměna a dostane upozornění.
        Hromadně: soubory pojmenované příjmením (třeba <code className="text-navy">novak_rijen.pdf</code>) se spárují samy.
      </p>

      <section className="bg-white border border-[rgba(13,33,79,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[rgba(13,33,79,0.08)]">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shift(-1)} className="p-1.5 border border-[rgba(13,33,79,0.2)] hover:border-navy text-navy" aria-label="Předchozí měsíc"><ChevronLeft className="w-4 h-4" /></button>
            <p className="font-headline text-navy text-[18px] capitalize w-40 text-center" style={{ fontWeight: 600 }}>{label}</p>
            <button type="button" onClick={() => shift(1)} className="p-1.5 border border-[rgba(13,33,79,0.2)] hover:border-navy text-navy" aria-label="Další měsíc"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-navy/60"><b className="font-headline text-navy text-[16px]">{uploaded}</b> / {people.length} nahráno</span>
            <input ref={bulkRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={e => { if (e.target.files?.length) bulk(e.target.files); e.target.value = '' }} />
            <button type="button" onClick={() => bulkRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-semibold hover:bg-violet transition-colors">
              <Upload className="w-4 h-4" /> Nahrát hromadně
            </button>
          </div>
        </div>

        <ul className="divide-y divide-[rgba(13,33,79,0.08)]">
          {people.map(m => {
            const p = personView(m, profiles[m.id])
            const f = files[payslipKey(m.id, period.month, period.year)]
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <Avatar p={p} size={36} fontSize={12} />
                <span className="flex-1 min-w-[180px]">
                  <span className="block text-sm font-semibold text-navy">{m.name}</span>
                  <span className="block text-[11px] text-navy/55">{TYPE_LABEL[m.employmentType]} · {m.position}</span>
                </span>
                {f ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-mint text-navy px-1.5 py-0.5">Nahráno</span>
                    <button type="button" onClick={() => openPayslipFile(f)} className="text-navy hover:text-violet underline-offset-2 hover:underline truncate max-w-[200px]" title="Stáhnout">{f.fileName}</button>
                    <span className="text-[11px] text-navy/45">{new Date(f.uploadedAt).toLocaleDateString('cs-CZ')}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-1.5 py-0.5">Chybí</span>
                )}
                <span className="flex items-center gap-1">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[rgba(13,33,79,0.2)] hover:border-navy text-navy cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> {f ? 'Nahradit' : 'Nahrát PDF'}
                    <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) upload(m, file); e.target.value = '' }} />
                  </label>
                  {f && (
                    <>
                      <button type="button" onClick={() => openPayslipFile(f)} title="Stáhnout" className="p-1.5 text-navy/50 hover:text-navy"><Download className="w-4 h-4" /></button>
                      <button type="button" onClick={() => { if (confirm(`Smazat pásku ${m.name} za ${label}?`)) removePayslipFile(m.id, period.month, period.year) }} title="Smazat" className="p-1.5 text-navy/50 hover:text-navy"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
      {msg && <p className="text-sm text-navy/70">{msg}</p>}
      <p className="text-xs text-navy/45">Demo — soubory se zatím ukládají jen v tomto prohlížeči. Po napojení se budou ukládat do úložiště a uvidí je zaměstnanec na svém zařízení.</p>
    </div>
  )
}
