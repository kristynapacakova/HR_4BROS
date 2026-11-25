# 3 · Odměny a peníze

Výplaty (HPP/DPP/DPČ), faktury OSVČ, termíny, doklady k proplacení, benefity, vzdělávací budget, návrhy team leadů.
Zkratky souborů: `MD` = `src/lib/mock-data.ts`, `PC` = `src/app/payslips/PayslipsClient.tsx`, `IO` = `src/app/admin/faktury/InvoiceOverview.tsx`, `SP` = `src/app/profile/panels/SickPayCard.tsx`, `PS` = `src/lib/pay-schedule.ts`.

> Všechno níže dnes žije v `mock-data.ts`, v prohlížeči (localStorage) a přímo v komponentách. V `src/lib/hr/model.ts` zatím peníze nejsou.

## Ukázková data odměn — jak jsou postavená (demo pro prezentaci)
Všechny obrazovky (Moje odměna, Dokumenty, Přehled odměn v adminu, faktury OSVČ) berou čísla z **jednoho generátoru** v `src/lib/mock-data.ts` (`payslipsFor`, `salaryInfoFor`, `grossFor`), takže si nikde neodporují:
- **HPP / DPP / DPČ:** hrubá mzda podle historie mezd (`SALARY_HISTORY`), jinak `monthlySalary` člověka; čistá z pevné tabulky (HPP) nebo poměrem (DPP 0,85, DPČ 0,8). Jan Novák: nástup 1/2024 na 55 000 Kč, **každý říjen +5 000 Kč** → dnes 70 000 Kč (čistá 51 200 Kč).
- **OSVČ:** měsíční odměna (paušál) = **hodinová sazba × měsíční hodiny** (Tomáš 450 Kč × 140 h = 63 000 Kč) + nájem místa a občerstvení z profilu (1 500 + 300 Kč). Faktury Tomáše = posledních 12 proplacených měsíců.
- **Proplaceno vs. plán:** měsíc je proplacený, když minul **18. den následujícího měsíce**; zbytek roku je „plán“.
- Výplaty se vedou od nástupu, nejdřív od 1/2024.
- Po napojení se generátor nahradí skutečnými páskami (mzdová účetní) a fakturami (Fakturoid) — vzorce výše jsou jen pro demo.

## Entity

### Payslip — výplata / měsíční odměna (`MD:574-627`)
| Pole | Typ | Význam |
|---|---|---|
| id | string | |
| month, year | number | období |
| grossAmount | Kč | hrubá mzda |
| netAmount | Kč | čistá mzda; u OSVČ se zobrazuje jako „Paušál / Faktura za odměnu“ |
| currency | string | CZK |
| fileUrl | string\|null | PDF pásky (dnes vždy null, stažení je atrapa) |
| planned | boolean | budoucí plánovaná mzda, páska ještě není |

- Vazba na člověka: v demu `payslipsFor(personId)`; v DB `personId`.

### PayslipFile — nahraná výplatní páska (PDF) (`src/lib/payslip-file-client.ts`, `fb-payslip-files`)
`personId`, `month`, `year`, `fileName`, `size`, `uploadedAt` (+ v demu obsah jako data URL).
- **HR nahrává** v Admin → Přehled odměn → **Výplatní pásky**: výběr měsíce (výchozí minulý), seznam lidí s HPP/DPP/DPČ, u každého „Nahrát PDF / Nahradit / Stáhnout / Smazat“, stav „Nahráno / Chybí“, počítadlo „X / 5 nahráno“. **Hromadně**: soubory pojmenované příjmením (`novak_rijen.pdf`) se spárují samy (bez diakritiky).
- Po nahrání dostane člověk notifikaci „Výplatní páska za {měsíc} je k dispozici“ → Moje odměna.
- **Zaměstnanec stahuje** v Moje odměna → rozbalený měsíc → „Výplatní páska · PDF“; když chybí: „HR ji zatím nenahrálo“.
- Jen PDF. Napojení: soubor do úložiště (`Document`, kind = PAYSLIP) — dnes jen v prohlížeči (větší soubory jen jménem).
- **K rozhodnutí:** nahrává HR ručně, nebo přijdou rovnou od mzdové účetní / ze mzdového systému?

### SalaryInfo — plat a navýšení (`MD:61-67`)
`currentSalary` 65 000, `nextRaiseDate`, `nextRaiseAmount` +5000, `lastRaiseDate` (nepoužito). ⚠️ Bez vazby na člověka; zobrazuje se i OSVČ. Je základem výpočtu nemoci místo `monthlySalary` člověka.

### Mzdová pole na člověku (`PersonRecord`, `MD:358-376`)
`employmentType` (HPP/DPP/DPC/ICO/STAZ), `monthlySalary`, `hourlyRate` (OSVČ Kč/h), `monthlyHours`, `clientHours`, `icoNumber`, `officeAmount` (nájem místa OSVČ), `refreshAmount` (občerstvení OSVČ). HR je mění v Admin → Uživatelé (`fb-person-overrides`, klíč `tX`) — ⚠️ do Moje odměna se ale nepropíšou.

### IcoInvoice — měsíční faktura OSVČ (`MD:509-532`)
| Pole | Význam |
|---|---|
| id, employeeId | (persona id) |
| month, year | fakturované období |
| invoiceNumber | číslo z Fakturoidu |
| salaryAmount | paušál za odměnu |
| officeAmount, refreshAmount | nájem místa, občerstvení |
| otherLabel, otherAmount | volitelná další položka |

Plán: tahat z Fakturoidu (napárovaného na banku). Stav úhrady je samostatně ↓.

### InvoicePaymentStatus — stav úhrady (`MD:499-505`, localStorage `fb-invoice-status`)
`NEZAPLACENO` (výchozí) → `CEKA_NA_UHRADU` → `ZAPLACENO` → zpět (klikací cyklus, bez auditu). Mění HR v Přehled odměn → Přehled faktur OSVČ. Při `ZAPLACENO` jde OSVČ notifikace „Faktura za {měsíc} byla označena jako zaplacená“.
- ⚠️ TL může stav také přepínat (chybí kontrola).
- ⚠️ U zaměstnance badge patří jen k faktuře za nájem a občerstvení, v adminu k celé faktuře.

### PaySchedule — termíny (`PS`, localStorage `fb-pay-schedule`)
`invoiceDueDay` (výchozí **10**) — do kdy OSVČ pošlou fakturu za minulý měsíc; `payDay` (výchozí **18**) — kdy se proplácí výplaty i faktury. 1–28, globální, mění jen HR.
- ⚠️ Stránka Pravidla píše, že se faktury proplácí **ke 20.**

### TeamAdjustment — jednorázová prémie / srážka od TL (`MD:537-553`, `fb-team-adjustments`)
`teamLeadId`, `employeeId`, `title`, `amount > 0`, `sign` PLUS/MINUS, `month/year`, `status` PENDING/APPROVED/REJECTED, `requestedAt`.
TL navrhne (jen pro OSVČ ze svého týmu) → notifikace HR → HR schválí/zamítne → notifikace TL. Po rozhodnutí nevratné.

### SalaryChange — trvalá změna odměny OSVČ (`MD:557-572`, `fb-salary-changes`)
`newAmount`, `reason` (povinné), `effectiveMonth/Year`, stav jako výše. Platná odměna v měsíci = poslední schválená změna s účinností ≤ měsíc; nahradí `invoice.salaryAmount`. Pro HPP neexistuje.

### ExpenseRequest — doklad k proplacení (`MD:33-49`, `fb-expense-requests`)
| Pole | Význam |
|---|---|
| employeeId, employeeName | ⚠️ jméno se z Moje odměna ukládá prázdné |
| title, amount > 0 | |
| sign | PLUS = proplatit (+), MINUS = strhnout z faktury/odměny (−) |
| category | SPORT / REPREZENTACE / CESTOVNÉ / VZDĚLÁVÁNÍ / JINE (⚠️ diakritika v klíčích) |
| receiptName | název souboru; **soubor se ukládá k dokladu** (`src/lib/receipt-file-client.ts`, demo v prohlížeči) — HR ho v Dokladech k proplacení a v Benefitech **otevře a stáhne**, zaměstnanec vidí svůj. Po napojení: úložiště souborů (Document, kind = RECEIPT) |
| month, year | do kterého měsíce se propíše (volí člověk) |
| status | PENDING / APPROVED / REJECTED |

Průběh:
```
člověk vytvoří ─► PENDING ─(HR schválí)─► APPROVED ─► započte se do zvoleného měsíce (±)
                    │  └─(HR zamítne)─► REJECTED
                    ├─ člověk: upravit / smazat (jen PENDING)
                    └─ HR: upravit / smazat kdykoli (status se nemění, bez auditu)
```
Notifikace člověku při schválení/zamítnutí. ⚠️ TL má na Dashboardu úkol „Schval doklady“, ale stránka je jen pro HR — **rozhodnout, zda TL schvaluje doklady svého týmu.**

### Benefit — MultiSport / příspěvek na sport (`MD:325-334`, `fb-benefit-selection`)
`MULTISPORT` nebo `SPORT_CONTRIBUTION` na člověka; nastavuje HR. ⚠️ Bez „platí od“ — změna se promítne zpětně do všech měsíců.

### SportRequest — žádost o příspěvek na sport (`MD:336-350`, `fb-sport-requests`)
`month/year`, `receiptName`, stav PENDING → APPROVED/REJECTED (HR). Částka se neukládá, platí vždy 600 Kč.
- ⚠️ Lze podat i bez nastaveného příspěvku a víckrát za měsíc.

### EduBudget a EduRequest — vzdělávání (`MD:288-317`, `fb-edu-budgets`, `fb-edu-requests`)
Roční budget na člověka (výchozí 10 000 Kč), žádosti `title`, `amount`, `url`, stav PENDING → APPROVED/REJECTED (HR). Vyčerpáno = součet schválených.
- ⚠️ Zaměstnanec nemá kde žádost podat (UI chybí). Budget není vázaný na rok, schválení nehlídá zůstatek.
- ⚠️ `/admin/benefity` a `/admin/vzdelavani` nejsou v menu.

## Faktury od 4Bros pro OSVČ — nájem a občerstvení (`src/lib/fakturoid.ts`)

Směr: **4Bros → OSVČ** (OSVČ platí 4Bros za kancelářské místo a občerstvení). Neplést s fakturou OSVČ za odměnu (OSVČ → 4Bros).

| pole | význam |
|---|---|
| id, personId, month, year | jedna faktura na uživatele a měsíc (unikátní klíč — opakované spuštění nic nezdvojí) |
| number | číslo z Fakturoidu |
| issuedOn, dueOn | vystaveno 1. den měsíce, splatnost 14 dní (nastavení) |
| lines[] | „Nájem kancelářského místa“ (officeAmount) a „Občerstvení“ (refreshAmount), 1 měs; položka s 0 / prázdná se vynechá |
| total | součet položek (+ DPH podle nastavení účtu ve Fakturoidu — k rozhodnutí) |
| status | PAID (zaplacena) / UNPAID (nezaplacena) / OVERDUE (po splatnosti) — z Fakturoidu |
| paidOn | datum úhrady z Fakturoidu (napárovaného na banku) |
| fakturoidId, pdfUrl | pro otevření / stažení PDF přes server |

Pravidla:
- Částky zadává HR v **Admin panel → Uživatelé → rozbalit IČaře → Kancelář / Občerstvení**. Platí částka v den vystavení; změna se projeví od další faktury, vystavené se nemění.
- Každý měsíc 1. den cron v aplikaci vystaví přes API Fakturoidu fakturu všem **aktivním** OSVČ, kteří mají aspoň jednu částku > 0. Fakturoid ji pošle e-mailem.
- Uživatel vidí své faktury v **Moje odměna → Faktury od 4Bros** (a u měsíce v Přehledu faktur): otevřít, stáhnout PDF, stav zaplacena / nezaplacena / po splatnosti, „K úhradě X Kč“.
- HR vidí všechny v **Přehled odměn → Faktury za kancelář** (po měsících, kolik vystaveno a nezaplaceno). Ruční přepnutí stavu je jen v demu — v ostré verzi stav přichází z Fakturoidu.
- Technika napojení (OAuth, endpointy, webhook, idempotence) je popsaná v hlavičce `src/lib/fakturoid.ts`.
- K rozhodnutí: DPH na položkách; zda se faktura posílá i při nástupu v půlce měsíce (poměrná částka?); co s fakturou po deaktivaci uživatele v průběhu měsíce.

## Pravidla

| # | Pravidlo | Kdo | Kde |
|---|---|---|---|
| R1 | **Nemoc — sazby:** redukční hranice 2026: do 294,85 Kč/h → 90 %, do 442,05 → 60 %, do 884,05 → 30 %, nad → 0 %. Náhrada = 60 % redukovaného průměru. Den = 8 h. | systém | `SP:10-17` |
| R2 | Průměrný hodinový výdělek = mzda × 12 / 2088 h. (Kalkulačka v Pravidlech počítá jinak: mzda / měsíční hodiny.) | systém | `SP:48-51` |
| R3 | Srážka za nemoc = (mzda za den − náhrada za den) × dny 1–14. ⚠️ Dny od 15. se nesrážejí vůbec (správně by se měla srazit celá mzda, platí ČSSZ). Dny se počítají od začátku měsíce, ne nemoci. | systém | `SP:27-46` |
| R4 | Dny nemoci/dovolené v měsíci = kalendářní dny schválených absencí (párováno podle jména), vč. víkendů. | systém | `payslips/page.tsx:7-19` |
| R5 | **Výplata HPP/DPP/DPČ:** K výplatě = čistá + 600 (příspěvek na sport, je-li schválený a nastavený) + Σ schválených dokladů měsíce (±) − srážka za nemoc. MultiSport se u zaměstnanců strhává ze mzdy mimo aplikaci. DPP a DPČ se chovají stejně jako HPP. | | `PC:234-248` |
| R6 | **Faktura OSVČ:** Celkem = paušál + nájem místa + občerstvení + sport (+600 příspěvek / **−390** MultiSport: firma platí 600 z 990) + Σ schválených dokladů. | OSVČ | `PC:81-96` |
| R7 | Doklad se počítá jen jako APPROVED, do měsíce, který si člověk zvolil. Nový doklad musí mít název, částku > 0 a soubor (obrázek/PDF). | | `PC:501-525` |
| R8 | Platná odměna OSVČ = poslední schválená trvalá změna s účinností ≤ měsíc; jinak `salaryAmount` z faktury. Nesoulad s fakturou → „⚠ neodpovídá“. | HR, TL | `IO:133-139, 363-383` |
| R9 | Celkem v přehledu faktur = platná odměna + nájem + občerstvení + další + Σ schválených TL úprav měsíce. ⚠️ Nezahrnuje doklady ani sport — Moje odměna zase nezahrnuje TL úpravy → **dvě různá „celkem“**. | HR, TL | `IO:141-144` |
| R10 | TL přehled faktur = OSVČ členové jeho týmu (podle přeřazení TL). HPP členové se nezobrazí. | TL | `TeamFakturaceClient.tsx:37-41` |
| R11 | **Odpočet na Dashboardu:** HPP „Výplata za {měsíc} přijde {payDay}“; OSVČ před termínem „Fakturu za {měsíc} pošli do {invoiceDueDay}“, mezi termínem a proplacením „Faktura bude proplacená kolem {payDay}“. Bez posunu kvůli víkendům/svátkům. | systém | `PS:44-65` |
| R12 | Přístup: `/admin/odmeny`, `/admin/benefity`, `/admin/vzdelavani` jen HR; `/admin/tym-fakturace` jen TL; `/payslips` každý. | | |

## Simulované — potřebuje integraci nebo rozhodnutí
1. **Fakturoid** — faktury OSVČ, čísla, PDF (tlačítka ke stažení jsou atrapy).
2. **Banka** — stav úhrady se nastavuje ručně. Rozhodnout zdroj (Fakturoid / banka) a zda smí HR přepsat ručně.
3. **Faktury z e-mailu** (`invoice@fourbros.cz`) — integrace neexistuje.
4. **Výplatní pásky** — zdroj (mzdová účetní / mzdový systém) a PDF.
5. **Úložiště souborů** pro doklady (dnes jen název souboru).
6. **MultiSport u HPP** — strhává se mimo aplikaci; má být v aplikaci?
7. **Export pro mzdovou účetní** — schválené doklady, sport, TL úpravy a změny odměn za měsíc nikam neodcházejí.
8. ~~Admin Přehled odměn běží na vymyšlených datech~~ ✅ teď ze stejného generátoru jako Moje odměna.
9. Výpočet nemoci je orientační — reálně mzdová účetní.

## Natvrdo → mají být nastavení
| Hodnota | Návrh |
|---|---|
| Příspěvek na sport 600 Kč, MultiSport 990 Kč | firemní nastavení s platností od |
| Vzdělávací budget 10 000 Kč | nastavení + budget na člověka **a rok** |
| Redukční hranice, sazby, 14 dní, 2088 h, 8 h/den | roční tabulka parametrů (mění se každý rok) |
| Termíny 10. / 18. | nastavení (dnes v prohlížeči) |
| Nájem 1500 / občerstvení 300 Kč (výchozí OSVČ) | na člověku + výchozí v nastavení |
| Kategorie dokladů, stavy úhrady | číselníky (klíče bez diakritiky) |
| Příjemce HR notifikací = admin@fourbros.cz | všichni s rolí HR |

## Doporučení pro databázi
- Jedno `personId` všude (viz [01](01-identita-a-opravneni.md)).
- **Měsíční mzdový podklad** na člověka a období, který sloučí pásku/fakturu, doklady, sport, MultiSport, TL úpravy, změny odměny a nemoc — aby zaměstnanec, TL i HR viděli **stejné** „celkem“.
- Benefit s `platí od / do`.
- Auditní log změn stavů.
- **Uzávěrka měsíce** po výplatním dni — pak už nejde měnit doklady.
