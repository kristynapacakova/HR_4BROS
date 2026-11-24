# Předávací specifikace HR portálu 4Bros

Kompletní soupis **dat, vazeb, pravidel a oprávnění** celé aplikace pro napojení databáze. Je nezávislý na tom, jakou databázi majitelé vyberou.

Stav: listopad 2026. Aplikace dnes nemá databázi — data jsou v `src/lib/mock-data.ts` (ukázková), v prohlížeči (localStorage) a část pravidel přímo v obrazovkách.

## Obsah
| | Kapitola | Co v ní je |
|---|---|---|
| 1 | [Identita, přihlášení a oprávnění](01-identita-a-opravneni.md) | jedno ID člověka, přihlášení, menu, **matice oprávnění** (stránky i akce) |
| 2 | [Lidé, profil, tým, majetek, analytika](02-lide-profil-majetek.md) | člověk a jeho pole, medailonek, Můj účet, team lead, majetek, analytika |
| 3 | [Odměny a peníze](03-odmeny.md) | výplaty, faktury OSVČ, termíny, doklady, benefity, vzdělávání, návrhy TL, výpočet nemoci |
| 4 | [Smlouvy, směrnice, dokumenty, BOZP](04-smlouvy-smernice-dokumenty.md) | šablony, průběh podpisu, archiv, PDF, směrnice a potvrzení, BOZP, onboarding, soubory |
| 5 | [Schránka, notifikace, akce, docházka, Dashboard](05-komunikace-akce-dochazka.md) | anonymita, notifikace, Google Kalendář, TrackDeck, úkoly na Dashboardu |
| 6 | [**K rozhodnutí**](06-k-rozhodnuti.md) | integrace a pravidla, která je potřeba rozhodnout (s prázdným sloupcem na odpověď) |
| 7 | [Chyby a nesoulady](07-chyby-a-nesoulady.md) | co jsme při průzkumu našli, 🔧 = jde opravit už teď |

Souvisí: [docs/datovy-model.md](../datovy-model.md) — model plnění (smlouvy, směrnice, BOZP) a seznam klíčů v prohlížeči; kód v `src/lib/hr/` (`model.ts` = entity a pravidla, `source.ts` = jediné místo, odkud se berou data).

## Postup napojení (stručně)
1. Projít [K rozhodnutí](06-k-rozhodnuti.md) a doplnit odpovědi.
2. Navrhnout tabulky podle kapitol 1–5 — **všude jedno `personId`**, žádné vazby přes jméno.
3. Implementovat zdroj dat (`HrDataSource` v `src/lib/hr/source.ts`) nad databází a rozšířit ho o další oblasti (odměny, majetek, schránka, akce…).
4. Zápisy, které dnes jdou do prohlížeče (`src/lib/*-client.ts`), přesměrovat na serverové API s kontrolou oprávnění podle [matice](01-identita-a-opravneni.md).
5. Odstranit demo věci: přepínač rolí, přihlášení bez hesla, ukázková data, generátor odměn v adminu.

## Hlavní entity (přehled vazeb)
```
Person ─┬─ UserAccount (Google přihlášení, role)          1:1
        ├─ teamLeadId → Person                              n:1
        ├─< Contract ─── ContractTemplate                    smlouvy + průběh podpisu
        ├─< Acknowledgement >── Directive ── DirectiveTemplate
        ├─< BozpTraining
        ├─< Payslip / IcoInvoice (+ stav úhrady)            měsíční odměna
        ├─< ExpenseRequest, SportRequest, EduRequest        žádosti ke schválení HR
        ├─  BenefitSelection, EduBudget (na rok)
        ├─< TeamAdjustment, SalaryChange                    návrhy TL ke schválení HR
        ├─< Asset (assignedTo)
        ├─< Absence (z TrackDecku?)
        ├─< Notification
        ├─< Document / StoredFile                           všechny soubory
        ├─  TeamProfile (fotka, medailonek, přezdívka)      1:1
        └─  Feedback (jen u podepsaných; anonymní BEZ vazby)
CompanyEvent · Settings (firma, termíny, částky, číselníky, iCal)
```
