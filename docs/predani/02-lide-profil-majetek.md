# 2 · Lidé, profil, tým, majetek a analytika

## Person — člověk (`PersonRecord`, `src/lib/mock-data.ts:358-376`)

| Pole | Typ | Význam | Kdo mění |
|---|---|---|---|
| id | string | ID člověka | systém |
| name | string | celé jméno | HR (v profilu jde upravit, ale neukládá se) |
| email | string | firemní e-mail = přihlášení | HR / Google |
| position | string | pozice | HR |
| department | string | tým: Head office / Account manager / Creative / Performance | HR |
| seniority | JUNIOR / MEDIOR / SENIOR / LEAD | seniorita | HR |
| employmentType | HPP / DPP / DPC / ICO / STAZ | typ spolupráce (ICO = OSVČ) | HR |
| role | ADMIN / TL / EMPLOYEE | ADMIN = HR, TL = team lead | HR |
| teamLeadId | → Person | jeho team lead | HR |
| startDate | datum | nástup | HR |
| birthday | YYYY-MM-DD | narozeniny | **člověk sám** |
| bio | text | „Příběh“ v medailonku | člověk sám |
| monthlyHours, clientHours | číslo | úvazek a fakturovatelné hodiny / měsíc | HR |
| monthlySalary | Kč | hrubá mzda (ne OSVČ) | HR |
| hourlyRate | Kč/h | sazba OSVČ | HR |
| icoNumber, officeAmount, refreshAmount | | jen OSVČ: IČO, nájem místa, občerstvení / měsíc | HR |
| annualLeaveDays | dny | nárok na dovolenou (OSVČ null) | HR |
| contractTermType, contractEndDate | URCITA / NEURCITA, datum | smlouva | HR (⚠️ patří spíš ke smlouvě) |

**Pole, která v záznamu člověka chybí a je potřeba je doplnit:** **Slack ID** (pro tlačítko „Napiš na Slacku“ u kontaktu na HR — odkaz `https://<workspace>.slack.com/team/<ID>`; jde načíst ze Slacku podle e-mailu), telefon, adresa, město, stát, bankovní účet, DIČ, nouzový kontakt (jméno, telefon, vztah), zdravotní pojišťovna, nástupní plat (⚠️ dnes ho zadává sám zaměstnanec), přezdívka, **datum odchodu / stav aktivní** (bez toho nejde spočítat fluktuace).

### Odvozené hodnoty
| Hodnota | Výpočet | Kde |
|---|---|---|
| Efektivita | klientské hodiny / celkové hodiny × 100 % | Uživatelé, profil |
| Měsíční náklad HPP | mzda × 1,338 (odvody) | analytika |
| Měsíční náklad OSVČ | sazba × hodiny + nájem + občerstvení | analytika |
| Měsíční náklad DPP/DPČ/stáž | hrubá mzda bez odvodů | analytika |
| Délka ve firmě | rozdíl měsíců od nástupu (⚠️ 5 různých implementací) | všude |
| Je zaměstnanec | HPP, DPP, DPČ (ne OSVČ, ne stáž) | profil |
| Kontakt na HR | první člověk s rolí HR | Dashboard |

⚠️ Tři různé vzorce měsíční ceny OSVČ (tabulka Uživatelé `sazba × klientské hodiny`, analytika `sazba × hodiny + nájem + občerstvení`, profil `sazba × klientské hodiny`) — sjednotit.

## Týmy a barvy
`Head office` gold `#F0E100` · `Creative` violet `#834DFB` · `Performance` mint `#4DE791` · `Account manager` světle modrá `#b9cbf3`. Na stránce Tým jde Head office první. → **Číselník týmů s barvou** (dnes natvrdo, při zakládání člověka je tým volný text).

## Team lead
- Tým team leada = lidé, kteří mají `teamLeadId` = on (ne oddělení). Dnes: Eva (t16) → Jan, Tomáš, Lucie, Veronika.
- Kandidáti na TL = lidé s rolí TL. TL nemůže být sám sobě TL (cykly se nekontrolují).
- HR přeřazuje v Admin → Uživatelé (`fb-team-lead-overrides`). ⚠️ Přeřazení respektuje jen Fakturace týmu; žádosti o dovolenou a Dashboard TL ho ignorují.

## TeamProfile — medailonek (`src/lib/team-profile-client.ts`, `fb-team-profiles`)
| Pole | Význam | Edituje |
|---|---|---|
| photo | profilová fotka (jedna pro hlavičku, Můj účet, Tým) | jen vlastník |
| photoPos | výřez fotky `{x, y, zoom 100–300}`; po nahrání se otevře editor výřezu | vlastník |
| bio | „Příběh“ | vlastník |
| interests | „Věci, které mě baví“ (bez emoji, bez duplicit) | vlastník |
| helpWith | „S čím se na mě můžeš obrátit“ (při ≥2 krátkých částech se zobrazí jako štítky) | vlastník |
| gallery | „Fotky, které mě vystihují“ | vlastník |
| birthday | přebije narozeniny ze záznamu člověka | vlastník (ukládá se hned) |
| nickname | oslovení na Dashboardu (`fb-nickname:<id>`) | vlastník |
| personality | 16Personalities — ⚠️ data existují, UI odebráno (rozhodnout smazat) | — |

- Medailonek kolegy (`/team/[id]`) vidí každý, upravuje **jen vlastník** (ani HR ne).
- ⚠️ Výchozí záliby se zobrazí ve výpisu Tým, ale ne v detailu.
- Fotky jsou dnes v prohlížeči jako data URL (rychle zaplní místo) → **úložiště souborů**. Rozhodnout: vlastní nahrávání vs. fotky z Google Workspace.

## Můj účet — co je editovatelné
| Pole | Edituje | Ukládá se dnes? | Podmínka |
|---|---|---|---|
| Jméno a příjmení | člověk | ne | — |
| Přezdívka | člověk | ano (prohlížeč) | — |
| Datum narození | člověk | ano (prohlížeč) | — |
| Telefon | člověk | ne | — |
| Bankovní účet | člověk | ne | ne pro OSVČ (⚠️ popisek „IBAN“, data `číslo/banka`) |
| Zdravotní pojišťovna | člověk | ne | HPP/DPP/DPČ |
| Nástupní plat | člověk ⚠️ | ne | HPP/DPP/DPČ |
| Aktuální plat + „+X % od nástupu“ | jen čtení | — | HPP/DPP/DPČ |
| Školení BOZP | „Označit jako splněné“ | ano (prohlížeč) | HPP/DPP/DPČ (⚠️ OSVČ blok nevidí) |
| Adresa, nouzový kontakt | člověk | ne | — |
| Karta „Ve 4Bros — spravuje HR“ | jen čtení: e-mail, tým, pozice, typ spolupráce, nástup, smlouva | — | — |
| HR údaje (seniorita, úvazek, mzda…) | jen HR, jen na vlastním profilu, neukládá se | — | HR |

**K rozhodnutí:** které změny jdou rovnou a které přes schválení HR (bankovní účet, jméno, adresa); kdo zadává nástupní plat (logicky HR).

## Narozeniny, výročí, nováčci
| | Pravidlo |
|---|---|
| Narozeniny (Dashboard) | do 30 dní, zobrazí se 2 (⚠️ ignoruje narozeniny upravené v profilu) |
| Narozeniny (Tým, správa akcí) | do 7 dní, s úpravou z profilu |
| Výročí | ≥ 1 rok ve firmě, do 30 dní, 2 |
| Nováčci | nástup před < 183 dny, jinak 2 poslední; max 3 |

## Asset — majetek (`src/lib/asset-client.ts`, `fb-assets`)
| Pole | Význam |
|---|---|
| name, type | povinné; typy: notebook, telefon, myš, klávesnice, monitor, nabíječka, sluchátka, jiné |
| brand, model, serialNumber | |
| assignedTo | → Person; prázdné = skladem |
| assignedAt | datum přiřazení (nastaví se při změně držitele, při vrácení na sklad se smaže) |
| condition | nový (výchozí) / dobrý / opotřebený / poškozený |
| notes | |

- Spravuje jen HR (přidat, upravit, smazat s potvrzením). Člověk vidí jen svůj majetek (jen čtení).
- ⚠️ Majetek přiřazený v adminu člověk v profilu nevidí (jiná ID) — viz [01](01-identita-a-opravneni.md).
- Chybí historie výpůjček a předávací protokol → **k rozhodnutí**.

## Analytika (Admin panel)
Počítá se z dat lidí: počet lidí v čase (12 měsíců), nástupy/odchody, fluktuace = odchody / průměrný počet × 100, průměrná délka ve firmě, rozložení podle týmů a typu spolupráce, náklady (měsíční, roční, na člověka, na klientskou hodinu), efektivita.
- ⚠️ Odchody jsou samostatný natvrdo zadaný seznam → potřeba `Person.endDate`.
- ⚠️ „Otevřené pozice = 3“ natvrdo → zdroj (náborový systém?) nebo ruční nastavení.
- K rozhodnutí: počítat OSVČ mezi „zaměstnance“?

## Natvrdo → nastavení / číselníky
Týmy a barvy, typy spolupráce, seniority, role, typy a stavy majetku, zdravotní pojišťovny, odkaz na BOZP školení, koeficient odvodů 1,338, otevřené pozice, okna 7/30/183 dní, výchozí nájem a občerstvení OSVČ, výchozí záliby, maximální rozměry fotek.
