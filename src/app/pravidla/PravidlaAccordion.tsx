'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { SickPayEstimator } from './SickPayEstimator'

interface Section {
  id: string
  emoji: string
  title: string
  summary: string
  content: ReactNode
}

const SECTIONS: Section[] = [
  {
    id: 'homeoffice',
    emoji: '💻',
    title: 'Homeoffice',
    summary: 'Pracuješ z domova? Stačí dát vědět do 7:59 a jedeme dál.',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">
          Informace o plánovaném Homeoffice si zadej tak, aby se to daný den propsalo na Slacku do vlákna <span className="text-violet font-medium">#ucast_absence</span>, tj. nejpozději do <strong>7:59</strong> ten den. Pokud to nestihneš, napiš to na Slack do vlákna <span className="text-violet font-medium">#ucast_absence</span>.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Prosím, dodržuj tohle pravidlo primárně z hlediska bezpečnosti (např. pro případ, že by hořelo → díky tomu víme, že tě na kanclu nemusíme nikde hledat).
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          V Google Kalendáři si nastav, že daný den nebudeš v kanceláři.
        </p>
      </div>
    ),
  },
  {
    id: 'dovolena',
    emoji: '✈️',
    title: 'Dovolená',
    summary: '25 dní ročně na vypnutí hlavy — a jasný postup, jak před odjezdem předat klienty.',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Každý z nás si čas od času potřebuje odpočinout a na nějakou dobu prostě nemyslet na práci. Zároveň však potřebujeme zajistit, aby naše nepřítomnost nedopadla negativně na naše klienty nebo tým.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Počet dní dovolené na každého je 25 dní za rok. Dovolenou počítáme však na základě typu úvazku:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-2.5 font-semibold text-navy border-b border-slate-200">Počet dní dovolené za rok</th>
                <th className="text-left px-4 py-2.5 font-semibold text-navy border-b border-slate-200">Měsíční úvazek v hodinách</th>
                <th className="text-left px-4 py-2.5 font-semibold text-navy border-b border-slate-200">Pracovní den v hodinách</th>
                <th className="text-left px-4 py-2.5 font-semibold text-navy border-b border-slate-200">Dovolená v hodinách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['25', '168 (full)', '8', '200'],
                ['25', '140', '6,5', '162,5'],
                ['25', '120 (0,7)', '5,5', '137,5'],
                ['25', '84 (poloviční)', '4', '100'],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 text-slate-600">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Dle zákona, má každý nárok na stejný počet dní dovolené, avšak jiné počty hodin → to se odvíjí od výše úvazku.
        </p>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Informování o plánované dovolené/absenci</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Informaci o plánované absenci (např. dovolená, návštěva lékaře, apod.) co nejdříve zadej do systému a pokud to nestihneš, pošli toto info na Slacku do kanálu <span className="text-violet font-medium">#účast_absence</span>.</li>
            <li>Zároveň si to zaktualizuješ i v Google Kalendáři.</li>
          </ol>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Předání klientů v případě dovolené</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>V Asaně si otevřeš k tomu určený projekt „📋 DOVOLENÁ/PŘEDÁVÁNÍ".</li>
            <li>Rozhodnutí o osobě, která tě zastoupí, konzultuješ s vaším teamleaderem.</li>
            <li>U každého klienta přidat jako assigneeho určeného člověka.</li>
            <li>Task přidat také ke klientovi do sekce „Dovolená" pomocí „Add to another project".</li>
            <li>Každý úkol bude mít dva subtasky: Klient informován a Potvrzení assigneeho.</li>
          </ol>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Převod dovolené do nového roku</p>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            V ideálním případě by se tohle nemělo dít, nicméně Four Bros umožňuje převod dovolené do nového roku, avšak za určitých podmínek:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Každý člen týmu má možnost převést si <strong>maximálně 5 dní</strong> do následujícího roku.</li>
            <li>Převedené dny je <strong>povinné vyčerpat během Q1</strong> nového roku, jinak propadnou.</li>
            <li>Pro schválení přesunu se obrať na Kristýnu.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'nemoc',
    emoji: '🤒',
    title: 'Nemoc',
    summary: 'Nemoc nikoho nešetří — proto ti prvních 15 dní nahradíme odměnu. Kalkulačka spočítá kolik.',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Každý z členů týmu Four Bros má měsíčně určitou časovou kapacitu, kterou může věnovat práci. Nemoc si však často nevybírá. Ve Four Bros si spolupráce se všemi váříme, a proto v případě nemoci budeme absentované hodiny finančně nahrazovat od 1. do 15. dne nemoci.
        </p>
        <SickPayEstimator />

        <p className="text-sm text-slate-600 leading-relaxed">
          Jak má každý z nás možnosti v případě, kdy se necítí dobře? Prvně je preferováno zůstat doma. Máš tyto možnosti: <strong>nahradit si absenci</strong> (zpravidla krátkodobou, 1–2 dny) v následujících dnech a týdnech, což ti nesnižuje odměnu, anebo <strong>navštívit lékaře</strong> a dostat neschopenku, kterou elektronicky najdeš na <a href="https://eportal.cssz.cz" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">eportal.cssz.cz</a> v sekci eNeschopenka / „Dočasná pracovní neschopnost" → „Přehled DPN", odkud si ji stáhneš v PDF.
        </p>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Co je potřeba splnit pro proplacení?</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Podmínkou je přinést potvrzení od lékaře nebo ho stáhnout z <a href="https://eportal.cssz.cz" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">eportal.cssz.cz</a> (evidenci má na starosti Kristý), dny nemoci zadat do systému jako „Nemoc" a počítat s tím, že výpočet náhrady se provádí vždy ke konci měsíce, ve kterém proběhla nemoc.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'lekar',
    emoji: '🩺',
    title: 'Návštěva lékaře',
    summary: 'K lékaři v pracovní době? Bez obav, poskytneme volno s náhradou mzdy.',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Four Bros poskytne na nezbytně nutnou dobu pracovní volno s náhradou mzdy/odměny, bylo-li vyšetření provedeno v nejbližším zdravotnickém zařízení, pokud jej nebylo možné provést mimo pracovní dobu.
        </p>
        <div>
          <p className="text-sm font-semibold text-navy mb-1">Jaká jsou pravidla?</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Potvrzení od lékaře dones/zašli co nejdříve emailem Kristý, v systému využij status „Lékař" (ne „Nemoc" ani „Neplacené volno"), při akutní návštěvě, kdy to nestihneš zapsat, napiš alespoň info na Slack do vlákna <span className="text-violet font-medium">#ucast_absence</span>, a čas strávený návštěvou by neměl jít na úkor klientských hodin.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'pohreb',
    emoji: '🕊️',
    title: 'Pohřeb',
    summary: 'V těžkých chvílích jsme s tebou — placené volno na celý den.',
    content: (
      <p className="text-sm text-slate-600 leading-relaxed">
        V prvé řadě — upřímnou soustrast. Pokud budeš na pohřbu, zvol <strong>„pohřeb"</strong> — jedná se tak o placené volno celý den.
      </p>
    ),
  },
  {
    id: 'fakturace',
    emoji: '💸',
    title: 'Fakturace',
    summary: 'Uzávěrka k 10. dni, peníze na účtu k 20. — bez výmluv, ale i bez zbytečných komplikací.',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Fakturace odpracovaných hodin probíhá přes platformu HR Portál.
        </p>
        <div>
          <p className="text-sm font-semibold text-navy mb-1">Jaká jsou pravidla?</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ke konci měsíce zkontroluj svoji fakturaci a pokud potřebuješ něco doplnit nebo proplatit, napiš Kristý; k 10. dni se vystaví faktura za kancelářské místo se splatností 10 dní; k 10. dni v měsíci vystav fakturu za provedené služby a odešli ji na <span className="text-violet">invoice@fourbros.cz</span>; faktury jsou propláceny dle smlouvy ke 20. dni v měsíci. S jakoukoli nejasností se obrať na Kristý.
          </p>
        </div>
      </div>
    ),
  },
]

export function PravidlaAccordion() {
  const [openId, setOpenId] = useState<string | null>(SECTIONS[0].id)

  return (
    <div className="space-y-6">

      {/* Header — editorial-size headline with soft violet glow */}
      <div className="relative overflow-hidden rounded-2xl bg-navy px-7 py-10 sm:px-10 sm:py-12">
        <div
          className="absolute -right-16 -top-16 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(126,23,224,0.32), transparent 70%)', filter: 'blur(52px)' }}
        />
        <div
          className="absolute -left-10 -bottom-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(155,69,232,0.18), transparent 70%)', filter: 'blur(44px)' }}
        />
        <div className="relative max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-violet-light" style={{ fontSize: 10, letterSpacing: '0.2em' }}>∿∿∿</span>
            <p className="text-violet-light text-xs font-semibold uppercase tracking-[0.2em]">Na jedné lodi</p>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-white mb-3 leading-tight">
            Jak to u nás chodí
          </h1>
          <p className="text-white/60 text-[15px] leading-relaxed">
            Homeoffice, dovolená, nemoc a pár dalších situací, do kterých se dřív nebo později připlete každý z nás. Rozklikni si téma a najdi si, co potřebuješ.
          </p>
        </div>
      </div>

      {/* Accordion */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {SECTIONS.map((section, i) => {
          const open = openId === section.id
          return (
            <div key={section.id} className={open ? 'bg-[#F7F8FE]/60' : undefined}>
              <button
                onClick={() => setOpenId(open ? null : section.id)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 transition-colors ${
                    open ? 'bg-violet/10' : 'bg-alice'
                  }`}
                >
                  {section.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-semibold text-violet tracking-wide flex-shrink-0">0{i + 1}</span>
                    <p className="font-headline font-semibold text-navy">{section.title}</p>
                  </div>
                  <p className="font-headline text-[15px] text-slate-500 leading-snug mt-1 italic">
                    „{section.summary}"
                  </p>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-violet/10' : ''}`}>
                  <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180 text-violet' : 'text-slate-300'}`} />
                </div>
              </button>
              {open && (
                <div className="pl-6 sm:pl-[76px] pr-6 pb-7 pt-1">
                  {section.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
