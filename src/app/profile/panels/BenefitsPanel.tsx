import { Dumbbell, GraduationCap, CheckCircle2 } from 'lucide-react'

function fmt(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n)
}

// Demo data — v ostré verzi by spravovalo HR v adminu
const EDU_BUDGET_TOTAL = 10000
const EDU_DRAWN = [
  { title: 'Kniha: Refactoring UI', amount: 1290, date: '12. 3. 2026' },
  { title: 'Kurz: Copywriting Akademie', amount: 3490, date: '28. 5. 2026' },
]

export function BenefitsPanel() {
  const drawn = EDU_DRAWN.reduce((s, d) => s + d.amount, 0)
  const remaining = EDU_BUDGET_TOTAL - drawn
  const pct = Math.round((drawn / EDU_BUDGET_TOTAL) * 100)

  return (
    <div className="space-y-5">

      {/* Multisportka */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Multisport karta</h3>
              <p className="text-xs text-slate-400 mt-0.5">Neomezený vstup do sportovišť po celé ČR</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aktivní od 1. 2. 2026
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Kartu ti vydá HR při nástupu. Ztrátu nebo změnu nahlas na HR — doprovodnou kartu pro partnera/ku lze dokoupit.
        </p>
      </div>

      {/* Vzdělávací budget */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-violet" />
            </div>
            <div>
              <h3 className="font-headline font-semibold text-navy">Vzdělávací budget</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kurzy, knihy, konference — {fmt(EDU_BUDGET_TOTAL)} na rok</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-headline font-bold text-violet">{fmt(remaining)}</p>
            <p className="text-[11px] text-slate-400">zbývá letos</p>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1.5">
          <div className="bg-violet h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-slate-400 mb-4">Vyčerpáno {fmt(drawn)} z {fmt(EDU_BUDGET_TOTAL)} ({pct} %)</p>

        <div className="divide-y divide-slate-50 border-t border-slate-100">
          {EDU_DRAWN.map(d => (
            <div key={d.title} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-navy truncate">{d.title}</p>
                <p className="text-[11px] text-slate-400">{d.date}</p>
              </div>
              <span className="text-sm font-semibold text-navy flex-shrink-0">{fmt(d.amount)}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Chceš čerpat? Pošli HR odkaz na kurz/knihu — po schválení se ti částka odečte z budgetu.
        </p>
      </div>

    </div>
  )
}
