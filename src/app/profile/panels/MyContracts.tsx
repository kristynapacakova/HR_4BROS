'use client'

import { Eye, Download, FileText } from 'lucide-react'
import { useStoredContracts, openStoredContract, downloadStoredContract } from '@/lib/contract-file-client'

/** Smlouvy, které člověku nahrálo HR (Admin → Smlouvy → Přehled smluv). */
export function MyContracts({ personId }: { personId?: string }) {
  const list = useStoredContracts().filter(c => c.personId === personId)
  return (
    <div className="bg-white border border-[rgba(13,33,79,0.14)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(13,33,79,0.08)]">
        <h3 className="font-headline font-semibold text-navy">Moje smlouvy</h3>
        <p className="text-xs text-navy/50 mt-0.5">{list.length ? `${list.length} ${list.length === 1 ? 'smlouva' : list.length < 5 ? 'smlouvy' : 'smluv'}` : 'Smlouvy sem nahrává HR'}</p>
      </div>
      {list.length === 0 ? (
        <div className="px-6 py-8 text-center text-navy/50 text-sm">Zatím tu nemáš žádnou smlouvu. Jakmile ji HR nahraje, najdeš ji tady.</div>
      ) : (
        <ul className="divide-y divide-[rgba(13,33,79,0.08)]">
          {list.map(c => (
            <li key={c.id} className="flex items-center gap-4 px-6 py-3">
              <span className="w-9 h-9 bg-alice flex items-center justify-center flex-shrink-0"><FileText className="w-4 h-4 text-navy" /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-navy truncate">{c.name}</span>
                <span className="block text-[11px] text-navy/55">{c.type}{c.signedAt ? ` · podepsáno ${new Date(c.signedAt).toLocaleDateString('cs-CZ')}` : ''}</span>
              </span>
              {c.status === 'SIGNED'
                ? <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-mint text-navy px-2 py-1">Podepsaná</span>
                : <span className="text-[10px] font-bold uppercase tracking-[0.06em] bg-gold text-navy px-2 py-1">Čeká na podpis</span>}
              <button type="button" onClick={() => openStoredContract(c)} title="Otevřít" className="p-1.5 text-navy/50 hover:text-navy"><Eye className="w-4 h-4" /></button>
              <button type="button" onClick={() => downloadStoredContract(c)} title="Stáhnout" className="p-1.5 text-navy/50 hover:text-navy"><Download className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
