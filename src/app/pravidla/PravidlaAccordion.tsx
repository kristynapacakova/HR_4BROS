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
    summary: 'Jak nahlásit den mimo kancelář',
    content: (
      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
        <li>Informace o plánovaném Homeoffice si zadejte do Docházky tak, aby se to daný den propsalo na Slacku do vlákna <span className="text-violet font-medium">#ucast_absence</span></li>
        <li>V Google Kalendáři si nastavte, že daný den nebudete v kanceláři</li>
      </ol>
    ),
  },
  {
    id: 'dovolena',
    emoji: '✈️',
    title: 'Dovolená',
    summary: 'Nárok, informování, předání klientů, převod do dalšího roku',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Každý z nás si čas od času potřebuje odpočinout a na nějakou dobu prostě nemyslet na práci. Zároveň však potřebujeme zajistit, aby naše nepřítomnost nedopadla negativně na naše klienty.
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
          Tzn. že nově, dle zákona, má každý nárok na 25 dní dovolené, avšak jiné počty hodin → to se odvíjí od výše úvazku.
        </p>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Informování o plánované dovolené/absenci ℹ️</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Informaci o plánované absenci (např. dovolená, návštěva lékaře, apod.) co nejdříve zadejte do Docházky a pokud to nestihnete, pošlete toto info na Slacku do kanálu <span className="text-violet font-medium">#účast_absence</span>.</li>
            <li>Zároveň si v Google Kalendáři vytvoříte ihned sami událost – typ: nejsem v práci a do popisu události napište o jakou absenci se jedná.</li>
          </ol>
        </div>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Předání klientů v případě dovolené 📋</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>V Asaně si otevřete k tomu určený projekt „📋 DOVOLENÁ/PŘEDÁVÁNÍ".</li>
            <li>Rozhodnutí o osobě, která vás zastoupí, konzultujete s vaším teamleaderem.</li>
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
    summary: 'Náhrada odměny, neschopenka, výpočet srážky',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Každý z členů týmu Four Bros má měsíčně určitou časovou kapacitu, kterou může věnovat práci. Nemoc si však často nevybírá. Ve Four Bros si spolupráce se všemi váříme, a proto v případě nemoci budeme absentované hodiny finančně nahrazovat od 1. do 15. dne nemoci — stejně, jako by daný člověk spolupracoval s Four Bros na hlavní pracovní poměr.
        </p>
        <p className="text-sm text-slate-600">
          Příklady výpočtu jsou uvedeny zde:{' '}
          <a href="https://www.vypocet.cz/popis-vypoctu-nemocenske" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">vypocet.cz/popis-vypoctu-nemocenske</a>
        </p>

        <SickPayEstimator />

        <p className="text-sm text-slate-600 leading-relaxed">
          Jak má každý z nás možnosti v případě, kdy se necítí dobře? Prvně je preferováno zůstat doma. Máš tyto možnosti:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 leading-relaxed">
          <li><strong>Nahradit si absenci</strong> (zpravidla krátkodobou, 1–2 dny) v následujících dnech a týdnech — nesnižuje ti to odměnu.</li>
          <li><strong>Navštívit lékaře</strong> a dostat neschopenku. Elektronicky ji najdeš na <a href="https://eportal.cssz.cz" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">eportal.cssz.cz</a> v sekci <strong>eNeschopenka</strong> / <strong>„Dočasná pracovní neschopnost"</strong> → <strong>„Přehled DPN"</strong>, odkud si ji stáhneš v PDF.</li>
        </ol>

        <div>
          <p className="text-sm font-semibold text-navy mb-1">Co je potřeba splnit pro proplacení?</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Podmínkou je přinést potvrzení od lékaře / stáhnout ho z <a href="https://eportal.cssz.cz" target="_blank" rel="noopener noreferrer" className="text-violet hover:underline">eportal.cssz.cz</a>.</li>
            <li>Evidenci průkazů má na starosti Kristý.</li>
            <li>Dny nemoci zadej do <span className="text-violet">dochazka.fourbros.cz</span> se statusem „Nemoc".</li>
            <li>Výpočet náhrady se počítá vždy ke konci měsíce, ve kterém jsi byl/a nemocný/á.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'lekar',
    emoji: '🩺',
    title: 'Návštěva lékaře',
    summary: 'Pracovní volno s náhradou mzdy na nezbytně nutnou dobu',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Four Bros poskytne na nezbytně nutnou dobu pracovní volno s náhradou mzdy/odměny, bylo-li vyšetření provedeno v nejbližším zdravotnickém zařízení, pokud jej nebylo možné provést mimo pracovní dobu.
        </p>
        <div>
          <p className="text-sm font-semibold text-navy mb-1">Jaká jsou pravidla?</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Potvrzení od lékaře doneste/zašlete co nejdříve emailem Office Manažerce.</li>
            <li>V <span className="text-violet">dochazka.fourbros.cz</span> využijte status „Lékař" (ne „Nemoc" ani „Neplacené volno").</li>
            <li>Při akutní návštěvě, kdy to nestihnete zapsat, napište alespoň info na Slack.</li>
            <li>Čas strávený návštěvou by neměl jít na úkor klientských hodin.</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: 'pohreb',
    emoji: '🕊️',
    title: 'Pohřeb',
    summary: 'Placené volno s poznámkou „pohřeb“',
    content: (
      <p className="text-sm text-slate-600 leading-relaxed">
        V prvé řadě — upřímnou soustrast. Pokud budeš na pohřbu, zvol <strong>„placené volno"</strong> a do poznámky napiš <em>pohřeb</em>.
      </p>
    ),
  },
  {
    id: 'fakturace',
    emoji: '💸',
    title: 'Fakturace',
    summary: 'Uzávěrka k 10. dni, splatnost faktur ke 20. dni',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Fakturace odpracovaných hodin probíhá přes platformu Docházka. Kontrola a doplnění položek je možná do 10. dne v měsíci — po tomto datu automaticky spadají do dalšího měsíce.
        </p>
        <div>
          <p className="text-sm font-semibold text-navy mb-1">Jaká jsou pravidla?</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
            <li>Ke konci měsíce zkontroluj svoji fakturaci; potřebuješ-li něco doplnit/proplatit, napiš Kristýně.</li>
            <li>K 10. dni se fakturace daného měsíce uzavře a nelze ji dál editovat.</li>
            <li>K 10. dni se vystaví faktura za kancelářské místo se splatností 10 dní.</li>
            <li>Spolupracující osoba vystaví fakturu k 10. dni a odešle ji na <span className="text-violet">invoice@fourbros.cz</span>.</li>
            <li>Faktury jsou propláceny dle smlouvy ke 20. dni v měsíci.</li>
            <li>S jakoukoli nejasností se obrať na Kristý.</li>
          </ol>
        </div>
      </div>
    ),
  },
]

export function PravidlaAccordion() {
  const [openId, setOpenId] = useState<string | null>(SECTIONS[0].id)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
      {SECTIONS.map(section => {
        const open = openId === section.id
        return (
          <div key={section.id}>
            <button
              onClick={() => setOpenId(open ? null : section.id)}
              className="w-full flex items-center gap-3.5 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-xl flex-shrink-0">{section.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-semibold text-navy">{section.title}</p>
                <p className="text-xs text-slate-400 truncate">{section.summary}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="px-6 pb-6 pt-1">
                {section.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
