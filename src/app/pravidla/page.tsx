import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DEMO_USER, DEMO_ADMIN } from '@/lib/mock-data'
import { SickPayCard } from '@/app/profile/panels/SickPayCard'

export default async function PravidlaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const isAdmin = session.user.role === 'ADMIN'
  const user = isAdmin ? DEMO_ADMIN : DEMO_USER
  const monthlySalary = (user as typeof DEMO_USER).monthlySalary ?? null
  const isEmployee = ['HPP', 'DPP', 'DPC'].includes(user.employmentType ?? '')

  return (
    <AppShell
      title="Pravidla"
      isAdmin={isAdmin}
      userName={session.user.name}
      userEmail={session.user.email}
      employmentType={user.employmentType}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HOMEOFFICE */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-3">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>💻</span><span>HOMEOFFICE</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
              <li>Informace o plánovaném Homeoffice si zadejte do Docházky tak, aby se to daný den propsalo na Slacku do vlákna <span className="text-violet font-medium">#ucast_absence</span></li>
              <li>V Google Kalendáři si nastavte, že daný den nebudete v kanceláři</li>
            </ol>
          </div>
        </div>

        {/* DOVOLENÁ */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-4">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>✈️</span><span>DOVOLENÁ</span>
            </h3>
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

            <div className="space-y-4 pt-1">
              <div>
                <p className="text-sm font-semibold text-navy mb-1">INFORMOVÁNÍ O PLÁNOVANÉ DOVOLENÉ/ABSENCI ℹ️</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                  <li>Informaci o plánované absenci (např. dovolená, návštěva lékaře, apod.) co nejdříve zadejte do Docházky a pokud to nestihnete, pošlete toto info na Slacku do kanálu <span className="text-violet font-medium">#účast_absence</span>.</li>
                  <li>Zároveň si v Google Kalendáři vytvoříte ihned sami událost – typ: nejsem v práci a do popisu události napište o jakou absenci se jedná (více informací ke kalendáři <span className="text-violet">zde</span>)</li>
                </ol>
              </div>

              <div>
                <p className="text-sm font-semibold text-navy mb-1">PŘEDÁNÍ KLIENTŮ NA KOLEGYNI/KOLEGU V PŘÍPADĚ DOVOLENÉ/DLOUHODOBĚJŠÍ NEPŘÍTOMNOSTI 📋</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                  <li>V Asaně si otevřete k tomu určený projekt „📋 DOVOLENÁ/PŘEDÁVÁNÍ"</li>
                  <li>Rozhodnutí o osobě, která vás zastoupí v jednotlivých projektech konzultujete s vaším teamleaderem. Teamleadeři předání svých klientů, v případě potřeby, konzultují s vedoucím oddělení.</li>
                  <li>U každého klienta přidat jako assigneeho určeného člověka, který bude mít na starosti daného klienta v době vaší nepřítomnosti</li>
                  <li>Task, který jste takto vytvořili přidat také ke konkrétnímu klientovi do sekce "Dovolená" pomocí "Add to another project".</li>
                  <li>Každý takto vytvořený úkol bude mít dva subtasky: Klient informován a Potvrzení assigneeho pod konkrétním klientem, že s předaným klientem počítá a má k tomu potřebné informace.</li>
                </ol>
              </div>

              <div>
                <p className="text-sm font-semibold text-navy mb-1">PŘEVOD DOVOLENÉ DO NOVÉHO ROKU</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  V ideálním případě by se tohle nemělo dít, nicméně pokud vám cokoliv nedovolí vyčerpat dovolenou v daném roce, Four Bros umožňuje převod dovolené do nového roku, avšak za určitých podmínek:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                  <li>Každý člen týmu Four Bros má možnost převést si <strong>maximálně</strong> 5 dní do následujícího roku.</li>
                  <li>Převedené dny dovolené je <strong>povinné vyčerpat během Q1</strong> nového roku. V případě, že k jejich vyčerpání nedojde, propadnou.</li>
                  <li>Pro schválení přesunu dovolené do nového roku se obrať na Kristýnu.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* NEMOC */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-3">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>🤒</span><span>NEMOC</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Každý z členů týmu Four Bros má měsíčně určitou časovou kapacitu, kterou může věnovat práci. Nemoc si však často nevybírá a může dojít k situaci, kdy někdo z nás onemocní a nemůže po nějakou dobu pracovat. Ve Four Bros si uvědomujeme důležitost nezůstat, v případě nemoci, která nás na delší dobu vyřadí ze hry, bez příjmu. K řešení těchto situací může každý využít dobrovolné nemocenské pojištění (které však nahrazuje částečně odměnu od 15. dne nemoci), a zajistit si alespoň částečný příjem. Ve Four Bros si spolupráce se všemi našimi partnery a kolegy vážíme a proto v případě nemoci budeme danému nešťastníkovi tyto z důvodu nemoci absentované hodiny finančně nahrazovat od 1. do 15. dne nemoci. Jak? Stejně, jako by daný člověk spolupracoval s Four Bros na hlavní pracovní poměr – pro výpočet náhrady odměny využijeme tedy stejný model.
            </p>
            <p className="text-sm text-slate-600">
              Příklady výpočtu jsou uvedeny zde:{' '}
              <span className="text-violet">https://www.vypocet.cz/popis-vypoctu-nemocenske</span>
            </p>

            {isEmployee && monthlySalary && (
              <div className="pt-1">
                <SickPayCard monthlySalary={monthlySalary} />
              </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed">
              Jak má každý z nás možnosti v případě, kdy se člověk necítí dobře? Prvně je preferováno, aby zůstal doma. V závislosti na reálném zdravotním stavu pak každý z nás má následující možnosti:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 leading-relaxed">
              <li><strong>Nahradit si absenci</strong> (zpravidla krátkodobou – např. 1-2 dny) v následujících dnech a týdnech a nemusíte si tak snižovat celkovou odměnu.</li>
              <li><strong>Navštívit lékaře</strong> a dostat neschopenku/průkaz dočasně práce neschopného pojištěnce. Pokud neschopenku lékař řeší elektronicky, najdeš ji na <span className="text-violet">https://eportal.cssz.cz</span>. Po přihlášení najdi sekci k neschopence (<strong>eNeschopenka</strong> nebo <strong>„Dočasná pracovní neschopnost"</strong>). Rozklikni <strong>„Přehled DPN" / „Moje neschopenky"</strong> a tam uvidíš detaily tvé neschopenky. Zároveň budeš mít možnost ji stáhnout v pdf. A to chceme. :)</li>
            </ol>

            <div className="pt-1">
              <p className="text-sm font-semibold text-navy mb-1">CO JE POTŘEBA SPLNIT PRO BOD Č.2?</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                <li>Podmínkou proplacení náhrady odměny v případě nemoci je přinést potvrzení od lékaře v podobě průkazu dočasně práce neschopného pojištěnce/stáhnout potvrzení z <span className="text-violet">https://eportal.cssz.cz</span>.</li>
                <li>Evidenci těchto průkazů má ve společnosti Four Bros na starosti Kristý.</li>
                <li>Dny, kdy daný člověk bude nemocný a nemůže tedy pracovat si dá do <span className="text-violet">dochazka.fourbros.cz</span>. Využije k tomu status "Nemoc"</li>
                <li>Výpočet náhrady odměny se počítá vždy ke konci měsíce, ve kterém byl daný člen týmu nemocný.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* NÁVŠTĚVA LÉKAŘE */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-3">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>🩺</span><span>NÁVŠTĚVA LÉKAŘE</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jak je to v případě návštěvy lékaře v průběhu pracovní doby? V takovém případě Four Bros poskytne na nezbytně nutnou dobu pracovní volno s náhradou mzdy/odměny, bylo-li vyšetření nebo ošetření provedeno ve zdravotnickém zařízení, které je ve smluvním vztahu ke zdravotní pojišťovně, kterou si zaměstnanec či spolupracující osoba zvolil/a, a které je nejblíže bydlišti nebo pracovišti zaměstnance/spolupracující osoby a je schopné potřebnou zdravotní péči poskytnout (dále jen „nejbližší zdravotnické zařízení"), pokud vyšetření nebo ošetření nebylo možné provést mimo pracovní dobu.
            </p>

            <div>
              <p className="text-sm font-semibold text-navy mb-1">JAKÁ JSOU PRAVIDLA?</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                <li>Potvrzení od lékaře pak vždy doneste/zašlete v co nejkratším termínu emailem Office Manažerce.</li>
                <li>Tuto skutečnost vždy uvádějte do <span className="text-violet">www.dochazka.fourbros.cz</span> a využijte status "Lékař". (nedávat si tam "Nemoc" ani "Neplacené volno")</li>
                <li>V případě akutní návštěvy kdy nemůžete toto uvést do docházky, prosíme alespoň o poslání informace, že musíte nutně k lékaři do Slacku, abychom vás zbytečně někde nenaháněli.</li>
                <li>Čas strávený takovou návštěvou lékaře by neměl jít na úkor klientských hodin.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* POHŘEB */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-2">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>🕊️</span><span>POHŘEB</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              V prvé řadě – upřímnou soustrast. Jestli řešíš otázku toho, co z uvedeného zvolit, pokud budeš na pohřbu, zvol <strong>"placené volno"</strong> a do poznámky prosím napiš <em>pohřeb</em>.
            </p>
          </div>
        </div>

        {/* FAKTURACE */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="border-l-4 border-navy p-6 space-y-3">
            <h3 className="font-headline font-bold text-navy flex items-center gap-2 text-base">
              <span>💸</span><span>FAKTURACE</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jak je to v případě fakturace odpracovaných hodin v předchozím měsíci? Four Bros má pro tyto případy platformu Docházka. Fakturace daného měsíce je vždy závislá na kontrole. Kontrola a doplnění veškerých potřebných položek je možná do 10. dne v měsíci. Pokud se tam nestane, automaticky úpravy spadají do dalšího měsíce.
            </p>

            <div>
              <p className="text-sm font-semibold text-navy mb-1">JAKÁ JSOU PRAVIDLA?</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 leading-relaxed">
                <li>Ke konci každého měsíce si zkontroluj svoji fakturaci a pokud potřebuješ něco doplnit/proplatit, připrav si doklad a napiš Kristýně.</li>
                <li>Každý měsíc se k 10. dni uzavře fakturace daného měsíce a nebude možné už nic editovat.</li>
                <li>Každý měsíc se k 10. dni v měsíci vystaví faktura za kancelářské místo se splatností 10 dní.</li>
                <li>Každý měsíc k 10. vystaví spolupracující osoba fakturu, na základě předpisu fakturace, a odešle ji na invoice@fourbros.cz.</li>
                <li>Faktury jsou propláceny dle smlouvy ke 20. dni v měsíci.</li>
                <li>Pokud zjistíš jakoukoliv nejasnost, nebo budeš mít dotazy → obrať se na Kristý.</li>
              </ol>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
