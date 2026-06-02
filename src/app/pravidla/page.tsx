import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'

const RULES_SECTIONS = [
  {
    key: 'homeoffice',
    emoji: '💻',
    title: 'HOMEOFFICE',
    text: 'Informace o plánovaném Homeoffice si zadejte do Docházky tak, aby se to daný den propsalo na Slacku do vlákna #ucast_absence. V Google Kalendáři si nastavte, že daný den nebudete v kanceláři.',
  },
  {
    key: 'dovolena',
    emoji: '✈️',
    title: 'DOVOLENÁ',
    text: 'Počet dní dovolené na každého je 25 dní za rok. Dovolenou počítáme na základě typu úvazku. Informaci o plánované absenci co nejdříve zadejte do Docházky a pošlete info na Slacku do kanálu #účast_absence. Zároveň si v Google Kalendáři vytvoříte ihned událost – typ: nejsem v práci. Každý člen týmu má možnost převést si maximálně 5 dní do následujícího roku (nutno vyčerpat v Q1).',
  },
  {
    key: 'nemoc',
    emoji: '🤒',
    title: 'NEMOC',
    text: 'Four Bros nahrazuje absentované hodiny finančně od 1. do 15. dne nemoci. Podmínkou je přinést potvrzení od lékaře. Dny nemoci si zadejte do dochazka.fourbros.cz se statusem "Nemoc".',
  },
  {
    key: 'lekar',
    emoji: '🩺',
    title: 'NÁVŠTĚVA LÉKAŘE',
    text: 'Four Bros poskytne na nezbytně nutnou dobu pracovní volno s náhradou mzdy. Potvrzení od lékaře doneste emailem Office Manažerce. Tuto skutečnost zadejte do www.dochazka.fourbros.cz se statusem "Lékař".',
  },
  {
    key: 'pohreb',
    emoji: '🕊️',
    title: 'POHŘEB',
    text: 'Zvol "placené volno" a do poznámky napiš pohřeb.',
  },
  {
    key: 'fakturace',
    emoji: '💸',
    title: 'FAKTURACE',
    text: 'Fakturace daného měsíce je závislá na kontrole do 10. dne v měsíci. Ke konci každého měsíce zkontroluj svoji fakturaci. Faktury jsou propláceny ke 20. dni v měsíci.',
  },
]

export default async function PravidlaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER

  return (
    <AppShell
      title="Pravidla"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-headline font-bold text-navy mb-1">Firemní pravidla a postupy</h2>
          <p className="text-sm text-slate-500">
            Přehled pravidel pro homeoffice, dovolenou, nemoc a další situace. Přečti si je a v případě dotazů kontaktuj HR.
          </p>
          {isAdmin && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
              <strong>Admin:</strong> Úprava pravidel je v demo verzi dostupná pouze jako ukázka.{' '}
              <button className="underline hover:no-underline" onClick={undefined}>Upravit (demo)</button>
            </div>
          )}
        </div>

        {/* Rule cards */}
        {RULES_SECTIONS.map((section) => (
          <div
            key={section.key}
            className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="border-l-4 border-navy p-6">
              <h3 className="font-headline font-bold text-navy mb-2 flex items-center gap-2">
                <span>{section.emoji}</span>
                <span>{section.title}</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{section.text}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
