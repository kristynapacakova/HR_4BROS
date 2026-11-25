'use client'

import { useState, type ComponentProps } from 'react'
import { ProfileTabs } from '../ProfileTabs'
import { AccountCard, AccountCardPlus, AccountScroll, AccountSidebar, type AccountInfo, type FormLayout, type HeaderStyle } from './AccountVariants'

const VARIANTS = [
  { key: 'A+', name: 'Průkaz — vyladěný', desc: 'Záložky v hlavičce, silueta, čistší formulář' },
  { key: 'A', name: 'Průkaz', desc: 'Navy hlavička, záložky se žlutým podtržením' },
  { key: 'B', name: 'Rozcestník', desc: 'Menu sekcí vlevo s popisky, obsah vpravo' },
  { key: 'C', name: 'Jedna stránka', desc: 'Sekce 01–04 pod sebou, lepivá navigace' },
  { key: '0', name: 'Současná', desc: 'Pro srovnání' },
] as const

export function Switcher({ info, tabs, current }: { info: AccountInfo; tabs: ComponentProps<typeof ProfileTabs>; current: React.ReactNode }) {
  const [v, setV] = useState<(typeof VARIANTS)[number]['key']>('A+')
  const [header, setHeader] = useState<HeaderStyle>('card')
  const [form, setForm] = useState<FormLayout>('cards')
  const chip = (active: boolean) => `px-3 py-1.5 text-xs font-semibold border transition-colors ${active ? 'bg-violet text-white border-violet' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {VARIANTS.map(x => (
          <button
            key={x.key}
            onClick={() => setV(x.key)}
            className={`text-left px-4 py-2.5 border transition-colors ${v === x.key ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-[rgba(13,33,79,0.14)] hover:border-navy'}`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">{x.key === '0' ? 'Srovnání' : `Varianta ${x.key}`}</span>
            <span className="block font-headline text-[15px]" style={{ fontWeight: 600 }}>{x.name}</span>
            <span className="block text-[11px] opacity-60">{x.desc}</span>
          </button>
        ))}
      </div>
      {v === 'A+' && (
        <div className="flex flex-wrap gap-x-8 gap-y-3 bg-white border border-[rgba(13,33,79,0.14)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="kicker text-navy mr-1">Hlavička</span>
            {([['card', '1 Průkaz'], ['compact', '2 Kompaktní'], ['light', '3 Světlá']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setHeader(k)} className={chip(header === k)}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="kicker text-navy mr-1">Formulář</span>
            {([['cards', '1 Jak je'], ['facts', '2 Údaje od HR nahoře'], ['split', '3 Údaje od HR vedle']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setForm(k)} className={chip(form === k)}>{l}</button>
            ))}
          </div>
        </div>
      )}
      <div key={v}>
        {v === 'A+' && <AccountCardPlus key={`${header}-${form}`} info={info} tabs={tabs} header={header} form={form} />}
        {v === 'A' && <AccountCard info={info} tabs={tabs} />}
        {v === 'B' && <AccountSidebar info={info} tabs={tabs} />}
        {v === 'C' && <AccountScroll info={info} tabs={tabs} />}
        {v === '0' && current}
      </div>
    </div>
  )
}
