# Datový model HR portálu

> **Kompletní předávací specifikace celé aplikace je v [docs/predani/](predani/README.md).** Tento dokument popisuje jen model plnění (smlouvy, směrnice, BOZP) zavedený v `src/lib/hr/`.

Tenhle dokument popisuje, **jaká data portál používá, jak spolu souvisí a jak se chovají**. Je nezávislý na konkrétní databázi — vyberte jakoukoli (PostgreSQL, MySQL, MS SQL, Firestore…), vazby a pravidla zůstávají stejná.

## Jak je to v kódu poskládané

| Soubor | Co v něm je |
|---|---|
| `src/lib/hr/model.ts` | **Entity, vazby a pravidla.** Typy (`Person`, `EmploymentContract`, `Directive`, …) a funkce, které z dat počítají stav (`bozpStatus`, `contractStatus`, `directivesStatus`, `complianceOf`). Na databázi nezávisí. |
| `src/lib/hr/source.ts` | **Jediné místo, odkud aplikace bere data** — rozhraní `HrDataSource` + dnešní ukázková implementace `demoSource`. |
| `src/lib/mock-data.ts` | Ukázková data (16 lidí, směrnice, smlouvy…). Po napojení databáze odpadne. |
| `src/lib/*-client.ts` | Dočasná úložiště v prohlížeči (viz tabulka níže) — každé odpovídá jedné budoucí tabulce. |

### Napojení databáze (až bude vybraná)

1. Vytvořit tabulky podle entit níže.
2. Napsat `dbSource`, který implementuje rozhraní `HrDataSource` (čte z databáze).
3. V `getHrSource()` (`src/lib/hr/source.ts`) vrátit `dbSource` místo `demoSource`.
4. Zápisy, které dnes jdou do prohlížeče (`*-client.ts`), přesměrovat na API → databázi.

Pravidla v `model.ts` ani obrazovky se měnit nemusí.

## Entity a vazby

Všechno se váže na **člověka** (`Person.id`). Jedna identita = přihlášení, tým, smlouvy, BOZP, směrnice.

```
Person ─┬─< EmploymentContract     (člověk má 0..n smluv)
        ├─< Acknowledgement >── Directive   (kdo potvrdil kterou směrnici)
        ├─< BozpTraining           (historie školení BOZP)
        ├── teamLeadId → Person    (kdo je jeho team lead)
        ├─< Asset, Payslip, IcoInvoice, ExpenseRequest, …
        └─  TeamProfile            (fotka, přezdívka, záliby — 1:1)
```

### Person — člověk
`id`, `name`, `email` (přihlašovací), `position`, `department` (Head office / Account manager / Creative / Performance), `role` (ADMIN = HR, TL = team lead, EMPLOYEE), `employmentType` (HPP, DPP, DPČ, ICO = OSVČ), `teamLeadId`, `startDate`, `birthday`.

### EmploymentContract — smlouva
`id`, `personId`, `templateName`, `status`, `termType` (URCITA / NEURCITA), `endsAt`, `companySignedAt`, `personSignedAt`.

Podepisování: **DRAFT → PENDING_MANAGEMENT** (podepisuje vedení) **→ PENDING_EMPLOYEE** (podepisuje člověk) **→ SIGNED**.

### Directive + Acknowledgement — směrnice a jejich potvrzení
`Directive`: `id`, `title`, `category`, `publishedAt`, `mustAcknowledge`.
`Acknowledgement`: `directiveId`, `personId`, `acknowledgedAt` — jeden řádek = jeden člověk potvrdil jednu směrnici.

### BozpTraining — školení BOZP
`personId`, `completedAt`. Ukládá se historie; rozhoduje poslední záznam.

## Pravidla (jak se co chová)

Konstanty jsou v `RULES` v `src/lib/hr/model.ts`.

| Co | Pravidlo | Kde se projeví |
|---|---|---|
| **BOZP** | týká se jen **HPP, DPP a DPČ** (OSVČ ne). Platí **12 měsíců** od absolvování. **30 dní** před vypršením „brzy vyprší“, po vypršení „propadlé“, bez záznamu „neabsolvováno“. | Dashboard (úkol), Můj účet (blok BOZP), Přehled plnění |
| **Směrnice** | každou s `mustAcknowledge` musí potvrdit každý člověk. Chybějící = úkol. | Dashboard (úkol + štítek „potvrdit“), Přehled plnění |
| **Smlouva k podpisu** | `PENDING_EMPLOYEE` → úkol pro člověka; `PENDING_MANAGEMENT` → úkol pro HR. | Dashboard, Přehled plnění |
| **Konec smlouvy** | smlouvy na dobu určitou hlídáme **90 dní** předem; po konci „skončila“. | Dashboard HR, Přehled plnění |
| **Fotka** | bere se z Google Workspace účtu (přihlašovací e-mail) — není to úkol ani položka plnění. | všude, kde je člověk |
| **Termíny odměn** | OSVČ posílají fakturu do **10.**, výplaty i faktury se proplácí **18.** (HR mění v Přehledu odměn). | Dashboard (odpočet) — `src/lib/pay-schedule.ts` |

## Co je dnes uložené v prohlížeči (→ budoucí tabulky)

Tyhle věci si teď pamatuje jen prohlížeč, ve kterém se kliklo. Po napojení databáze se přesunou do tabulek:

| Klíč v prohlížeči | Obsah | Budoucí tabulka |
|---|---|---|
| `fb-bozp-last-done:<personId>` | „Označit BOZP jako splněné“ | `BozpTraining` |
| `fb-nickname:<personId>` | přezdívka pro oslovení | `TeamProfile.nickname` |
| `fb-team-profiles` | fotka, výřez, záliby, narozeniny | `TeamProfile` |
| `fb-pay-schedule` | termíny faktur a výplat | `Settings` |
| `fb-company-events`, `fb-events-ics` | akce, odkaz na Google Kalendář | `CompanyEvent`, `Settings` |
| `fb-assets` | majetek | `Asset` |
| `fb-expense-requests` | doklady k proplacení | `ExpenseRequest` |
| `fb-benefit-selection`, `fb-sport-requests` | benefity | `BenefitSelection`, `SportRequest` |
| `fb-edu-requests`, `fb-edu-budgets` | vzdělávání | `EducationRequest`, `EducationBudget` |
| `fb-feedback-admin` | stavy zpráv ve schránce důvěry | `Feedback` |
| `fb-invoice-status` | stav plateb faktur OSVČ | `IcoInvoice.status` |
| `fb-salary-changes`, `fb-team-adjustments` | změny odměn | `SalaryChange`, `RewardAdjustment` |
| `fb-person-overrides`, `fb-team-lead-overrides` | úpravy lidí a team leadů | `Person` |
| `fb-notifications`, `fb-event-rsvp` | notifikace, účast na akcích | `Notification`, `EventRsvp` |

Potvrzení směrnic a podpisy smluv se dnes drží jen do obnovení stránky — v databázi to budou `Acknowledgement` a `EmploymentContract`.

> Pozn.: `prisma/schema.prisma` je ze starší verze portálu a výše uvedenému už neodpovídá. Až bude databáze vybraná, schéma se napíše podle tohoto dokumentu.
