# 6 · K rozhodnutí — otevřené otázky

Seznam věcí, které dnes aplikace jen simuluje nebo kde chybí rozhodnutí. Vyplňte sloupec **Rozhodnutí** — podle něj se pak napojení dodělá.

## Integrace
| # | Otázka | Kde | Rozhodnutí |
|---|---|---|---|
| I1 | **Databáze** — jaká (vyberou majitelé) | celé | |
| I2 | **Přihlášení** — Google Workspace s omezením na `fourbros.cz`? Délka relace (12 h?) | [01](01-identita-a-opravneni.md) | |
| I3 | **Profilové fotky** — z Google Workspace účtu, kterým se člověk přihlašuje (Directory API / profil Google), s možností nahrát vlastní? Fotka se dnes ukazuje na Dashboardu, v Můj účet, v hlavičce, v menu a v Týmu z jednoho zdroje (`TeamProfile.photo`) | [02](02-lide-profil-majetek.md) | Z Google Workspace (přihlašovací e-mail) |
| I4 | **E-podpis** — u směrnic připraven **DocuSign** (`src/lib/esign.ts`). Použít DocuSign i pro smlouvy (dnes simulace Signi)? Úroveň podpisu, účet DocuSign | [04](04-smlouvy-smernice-dokumenty.md) | DocuSign pro směrnice |
| I5 | **Fakturoid** — faktury OSVČ, čísla, PDF, stav úhrady | [03](03-odmeny.md) | |
| I6 | **Banka** — zdroj stavu úhrady (Fakturoid / banka), smí HR přepsat ručně? | [03](03-odmeny.md) | |
| I7 | **Faktury z e-mailu** `invoice@fourbros.cz` | [03](03-odmeny.md) | |
| I8 | **Výplatní pásky** — odkud (mzdová účetní / mzdový systém), PDF | [03](03-odmeny.md) | |
| I9 | **Export pro mzdovou účetní** — kam tečou schválené doklady, sport, prémie | [03](03-odmeny.md) | |
| I10 | **TrackDeck** — (a) portál jen importuje schválené absence, nebo (b) portál žádosti vlastní? Zdroj pravdy pro zůstatek dovolené | [05](05-komunikace-akce-dochazka.md) | |
| I11 | **Google Kalendář** — napojení uložit na serveru (dnes jen v prohlížeči HR) | [05](05-komunikace-akce-dochazka.md) | |
| I12 | **E-mail / Slack** — které události posílat i mimo aplikaci | [05](05-komunikace-akce-dochazka.md) | |
| I13 | **Úložiště souborů** — kde (smlouvy, pásky, faktury, účtenky, neschopenky, fotky, certifikáty) | [04](04-smlouvy-smernice-dokumenty.md) | |
| I14 | **Generování PDF** na serveru (dnes tisk z prohlížeče) | [04](04-smlouvy-smernice-dokumenty.md) | |
| I15 | **BOZP** — jen samodeklarace, nebo doklad / import od poskytovatele? | [04](04-smlouvy-smernice-dokumenty.md) | |
| I16 | **Otevřené pozice** v analytice — zdroj nebo ruční nastavení | [02](02-lide-profil-majetek.md) | |

## Pravidla a oprávnění
| # | Otázka | Rozhodnutí |
|---|---|---|
| P1 | Smí **team lead schvalovat doklady** svého týmu? (dnes má úkol, ale nemá kde) | |
| P2 | Smí TL schvalovat **dovolenou** svého týmu? (UI ano, API ne) | |
| P3 | Vidí TL docházku **celé firmy**, nebo jen svého týmu? | |
| P4 | **Kdo podepisuje smlouvy za firmu** — jednatel, nebo HR? Samostatná role? | |
| P5 | Schránka důvěry — „jen HR“: samostatné oprávnění? Jak dostat **odpověď** k anonymnímu odesílateli? | |
| P6 | Týká se **BOZP i OSVČ**? | ✅ **Ne** — BOZP mají jen HPP, DPP a DPČ (`RULES.bozpRequiredFor`) |
| P7 | Na koho se vztahují **povinné směrnice** — všichni / jen zaměstnanci / i OSVČ? Lidé nastoupivší po platnosti? Potvrzení před platností? | |
| P8 | Ukládat **verze směrnic** a u potvrzení verzi? (otisk `documentHash` už se ukládá) | |
| P8b | Které směrnice podepisovat přes DocuSign (BOZP? všechny?) — volí HR u každé směrnice | |
| P9 | Změny osobních údajů (bankovní účet, jméno, adresa) — rovnou, nebo **přes schválení HR**? | |
| P10 | Kdo zadává **nástupní plat** (dnes zaměstnanec) | |
| P11 | **Onboarding** — checklist úkolů na člověka, nebo jen počítané úkoly na Dashboardu? | |
| P12 | Smlouvy — zavést **storno / zamítnutí / vrácení k úpravě / verze**? | |
| P13 | Majetek — **historie výpůjček a předávací protokol**? | |
| P14 | **Uzávěrka měsíce** — po výplatním dni už nejde měnit doklady? | |
| P15 | Benefit — platnost **od / do** (dnes se změna promítne zpětně) | |
| P16 | Vzdělávací budget **po letech** a kontrola zůstatku při schválení; kde zaměstnanec žádá | |
| P17 | Výpočet nemoci — sjednotit (14 vs. 15 dní, dny od 15. se mají srazit celé, pracovní vs. kalendářní dny), nebo nechat jen orientačně? | |
| P18 | Počítat **OSVČ mezi zaměstnance** v analytice? | |
| P19 | Text **Pravidel** — má ho upravovat HR? Proplácení 18. vs. 20.? | |
| P20 | Účast na akcích (RSVP) — zavést, nebo smazat? | |
| P21 | 16Personalities, onboardingové úkoly, nepoužité komponenty — smazat? | |

## Nastavení (dnes natvrdo, mají být editovatelná)
Firma (název, IČO, adresa, logo, místo podpisu), termíny faktur a výplat, příspěvek na sport, cena MultiSport, vzdělávací budget, výchozí nájem a občerstvení OSVČ, roční tabulka pro výpočet nemoci, koeficient odvodů, odkaz na BOZP školení, číselníky (týmy a barvy, typy spolupráce, seniority, typy a stavy majetku, kategorie dokladů, typy absencí, pojišťovny, témata schránky), okna pro narozeniny / výročí / nováčky, pravidla v `RULES` (BOZP 12 měsíců / 30 dní, konec smlouvy 90 dní).
