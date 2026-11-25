# 7 · Chyby a nesoulady nalezené při průzkumu

Seřazeno podle dopadu. Většinu vyřeší napojení databáze s **jedním ID člověka** a **ukládáním na serveru**; ty, které jdou opravit už teď, jsou označené 🔧.

## Vysoký dopad
1. **Tři různá ID pro jednoho člověka** (přihlášení / tým / jméno). Důsledky:
   - majetek přiřazený v adminu člověk v profilu nevidí; vlastník starých položek „Neznámý“; 🔧
   - admin Benefity a Vzdělávání nevidí výběry, budgety ani čerpání lidí; Eva je v seznamu dvakrát; 🔧
   - absence a smlouvy jsou navázané **přes jméno**.
2. **TL a OSVČ vidí Janova data** na stránkách Směrnice, Schránka důvěry, Pravidla, Dokumenty (OSVČ tam vidí i výplatní pásky). Směrnice potvrzené na `/smernice` se pak neshodují s Dashboardem. 🔧
3. **Schránka důvěry zprávy neukládá** — odeslání je jen simulace.
4. **Firemní akce a napojení Google Kalendáře jsou jen v prohlížeči HR** — zaměstnanci vidí jen ukázkové akce.
5. ~~Výplatní pásky a info o platu nejsou vázané na člověka~~ ✅ opraveno — každý vidí své výplaty / faktury, admin stejná čísla.
6. **Smlouvy k podpisu vidí každý** (filtr jen podle stavu, ne osoby). 🔧
7. **Neošetřené HTML** z formulářů smluv a směrnic se zobrazuje všem (riziko XSS) — při napojení sanitizovat.
8. Přihlásit se dá **libovolným e-mailem bez hesla**; neznámý e-mail = Jan.

## Střední dopad
9. TL má na Dashboardu úkol „Schval doklady“, ale stránka je jen pro HR. 🔧 (podle rozhodnutí P1)
10. Úkoly HR „doklady“ a „nové zprávy“ čtou ukázková data — po vyřízení nezmizí.
11. Změna role, IČO, nájmu, občerstvení a nároku dovolené v adminu nemá žádný efekt (nikdo ji nečte).
12. Přeřazení team leada respektuje jen Fakturace týmu; dovolená a Dashboard ne.
13. TL může v přehledu faktur přepínat stav úhrady. 🔧
14. Dvě různá „celkem“ u OSVČ: Moje odměna nezahrnuje prémie TL, přehled faktur nezahrnuje doklady a sport.
15. Smlouvy na 4 místech (šablonové, syntetické pro plnění, statické dokumenty, archiv) → Dashboard a Přehled plnění nesedí se Smlouvami. Chybí šablona pro OSVČ a DPČ.
16. Nová směrnice se k lidem nedostane; potvrzení se neukládají.
17. Statistika směrnic „X/15“ — natvrdo 15 místo 16, počítá i nepovinné. 🔧
18. ~~BOZP se vyžadoval i po OSVČ~~ ✅ opraveno (BOZP jen HPP/DPP/DPČ); výpočet v profilu je ale pořád duplikovaný mimo model. 🔧
19. Docházka: 4 číselníky typů, pracovní vs. kalendářní dny, zůstatek 20 vs. nárok 25, nemoc v profilu počítá jen měsíc bez roku.
20. Srážka za nemoc nesráží dny od 15.; počítá od začátku měsíce; bere plat z ukázky místo platu člověka.
21. Rozpis odměny „tento měsíc“ má nadpis posledního měsíce s páskou, ale počítá doklady z aktuálního měsíce.
22. Odkazy z notifikací na neexistující záložku „Benefity“. 🔧
23. Simulace Signi skládá e-mail ze jména s diakritikou a ignoruje skutečný e-mail. 🔧
24. „Odeslat k e-podpisu“ jde i u návrhu (obejde podpis vedení). 🔧
25. Vzhled PDF: logo a písma z nastavení se do tisku nepropíšou; firemní údaje natvrdo na 5 místech.

## Nízký dopad / úklid
26. ~~Narozeniny na Dashboardu ignorují úpravu v profilu~~ ✅ opraveno.
27. Výchozí záliby se zobrazí ve výpisu Tým, ale ne v detailu medailonku. 🔧
28. Pole Bankovní účet má popisek „IBAN“, data jsou `číslo/banka`. 🔧
29. Login slibuje relaci 12 h, platí 30 dní. 🔧
30. Pravidla: proplácení „ke 20.“ vs. nastavení 18.; nemoc 1.–15. vs. 14 dní. 🔧
31. `IcoFieldsCell` porušuje pravidla React hooks. 🔧
32. Klíče s diakritikou (`ODMENOVÁNÍ`, `CESTOVNÉ`, `VZDĚLÁVÁNÍ`). 🔧
33. Datum žádostí v UTC (může se lišit o den).
34. Mrtvý kód: `DashboardGreeting`, `RingStat`, `Medailonek`, `TimeOffPanel`, `BenefitsPanel`, `IntroAnimation`, `DEMO_TASKS`, RSVP, `/koncept/tym-prehled`, 16Personalities.
35. Přihlašovací stránka importuje kód z `intro-preview`.
36. `prisma/schema.prisma` je zastaralé — neodpovídá aplikaci, nebrat jako zdroj pravdy.
37. Starý globální klíč fotky `fb-avatar` (ne na člověka).
38. Státní svátky zkopírované na 4 místech; délka ve firmě implementovaná 5×.
