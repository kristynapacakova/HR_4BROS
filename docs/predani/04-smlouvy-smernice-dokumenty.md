# 4 · Smlouvy, směrnice, dokumenty, BOZP, onboarding

## Smlouvy

### ContractTemplate — šablona (`mock-data.ts:692-804`)
`id`, `name`, `type` (HPP / DPP / OBECNA), `description`, `body` (HTML s `{{KLIC}}`), `placeholders[]`.

| Šablona | Pole k vyplnění |
|---|---|
| HPP Pracovní smlouva | zaměstnavatel, jméno, pozice, místo výkonu, mzda, nástup, zkušební doba, týdenní úvazek, místo a datum podpisu |
| DPP Dohoda o provedení práce | zaměstnavatel, jméno, pozice, hodinová sazba, max. hodin, nástup, ukončení, místo a datum podpisu |
| Dodatek ke smlouvě | zaměstnavatel, číslo dodatku, jméno, datum původní smlouvy, popis změny, účinnost, nová mzda, místo a datum podpisu |

- Šablony nejdou v aplikaci vytvořit ani upravit.
- ⚠️ **Chybí šablona pro OSVČ (rámcová smlouva o spolupráci) a pro DPČ** — přitom 11 z 16 lidí je OSVČ.

### Contract — smlouva (`mock-data.ts:702-717`)
| Pole | Význam |
|---|---|
| templateId, templateName | šablona (název zkopírovaný při vytvoření) |
| employeeId / employeeName | ⚠️ dnes vazba jen **přes jméno** → v DB `personId` |
| status | DRAFT → PENDING_MANAGEMENT → PENDING_EMPLOYEE → SIGNED |
| createdAt, sentToManagementAt, managementSignedAt, managementSignedBy, sentToEmployeeAt, employeeSignedAt | časy kroků |
| values | vyplněná pole šablony |
| notes | interní poznámka HR |
| *(chybí)* termType, endsAt | na dobu určitou/neurčitou a konec — dnes se berou ze záznamu člověka |

### Průběh podpisu
```
HR: Nová smlouva → šablona → formulář → „Uložit jako návrh“
        ▼
      DRAFT
        │  HR: „Odeslat vedení“
        ▼
  PENDING_MANAGEMENT   → úkol HR „Podepiš smlouvu za firmu“
        │  „Podepsat jako vedení“ (dnes HR, podpis natvrdo „Petra Nováková“)
        ▼
  PENDING_EMPLOYEE     → úkol člověka „Podepiš: …“
        │  člověk: Dokumenty → Podepsat (certifikát + PIN)   nebo HR simulace
        ▼
      SIGNED           → PDF ke stažení
```
- Přechody jsou jen dopředu. **Chybí** storno, zamítnutí, vrácení k úpravě, úprava a smazání návrhu, nová verze.
- Žádný krok neposílá notifikaci ani e-mail.
- Při vytvoření se z údajů člověka **nic nepředvyplní** → doporučení: jméno, pozice, mzda/sazba, nástup z člověka; zaměstnavatel z nastavení firmy.
- Vyplněné hodnoty se vkládají do dokumentu jako neošetřené HTML → **při napojení sanitizovat**.

### Podpis
- HR strana simuluje **Signi** (odeslání e-mailem, SMS). Nic nemění, nic neukládá.
- Zaměstnanec simuluje podpis **vlastním certifikátem** (.p12/.pfx + PIN). Uloží se jen do obnovení stránky.
- **K rozhodnutí:** jedna metoda podpisu (Signi / jiný poskytovatel), úroveň podpisu (prostý / zaručený / kvalifikovaný), **kdo podepisuje za firmu** (jednatel vs. HR), zpětná hlášení stavu (webhooky), uložení podepsaného PDF a auditní stopy.

### Přehled smluv + nahrání podepsané smlouvy (HR) — `src/app/admin/smlouvy/ContractOverview.tsx`
- Admin → Smlouvy → **Přehled smluv** (výchozí záložka): všichni lidé a všechny jejich smlouvy v jedné tabulce, souhrn **Podepsané / Čeká na podpis / Lidé bez smlouvy v portálu** (klik filtruje), filtr podle člověka.
- **Povinné dokumenty podle typu spolupráce** (NDA zvlášť nemáme, je součástí smlouvy):
  - HPP: smlouva na HPP, mzdový výměr, předávací protokol, GDPR.
  - IČO: smlouva o poskytování služeb, smlouva o nájmu kancelářského místa, zpracovatelská smlouva, předávací protokol, GDPR.
  - DPP/DPČ: dohoda, předávací protokol, GDPR (potvrzeno HR).
  - Stav uživatele: chybí (nemá některý povinný dokument) → čeká na podpis (nějaký dokument nepodepsaný) → v pořádku.
- **Kdo co smí se smlouvou:** nahrát, označit jako podepsanou a **smazat** smí jen HR (role ADMIN). Mazání je pro případ, že HR nahraje špatný soubor; po potvrzení zmizí i z Dokumentů uživatele. Uživatel svou smlouvu vidí, otevře a stáhne kdykoliv (Můj účet → Dokumenty → Moje smlouvy), ale nesmaže ji. TL ani nikdo jiný smlouvy nevidí. Na backendu hlídat oprávnění i u API (ne jen skrytím tlačítka) a mazání logovat (kdo, kdy, co).
- **„Nahrát smlouvu“** (nebo „Nahrát“ u konkrétního člověka): soubor (PDF nebo sken), člověk, název smlouvy, typ (HPP/DPP/DPČ/IČO/Mzdový výměr/Nájem kanceláře/Zpracovatelská/Předávací protokol/GDPR/Dodatek/Jiné — předvyplní se podle typu spolupráce, u chybějícího dokumentu i název), stav (podepsaná / čeká na podpis), datum podpisu, poznámka. Člověk dostane notifikaci.
- U každé smlouvy: **„Čeká na podpis · označit ✓“** → podepsaná s dnešním datem, „zrušit podpis“, otevřít, stáhnout, smazat.
- **Zaměstnanec** vidí své smlouvy v Můj účet → Dokumenty → **Moje smlouvy** (otevřít / stáhnout).
- Data: `StoredContract` (`src/lib/contract-file-client.ts`) — `personId`, `name`, `type`, `status` (SIGNED/UNSIGNED), `signedAt`, `notes`, soubor. Dnes v prohlížeči; po napojení tabulka Contract + soubor v úložišti. K rozhodnutí: počítat nahrané podepsané smlouvy do Přehledu plnění (dnes plnění bere smlouvy z modelu).

### Archiv PDF (HR) — nahrazeno Přehledem smluv
Nahrání hotové smlouvy: soubor PDF, název, člověk, typ (HPP / DPP / DPČ / OSVČ / Dodatek / Jiné), poznámka. ⚠️ Nic se neukládá. Zaměstnanec archiv nevidí.

### Vzhled PDF (Vizuál PDF, `fourBros_contractDesign` v prohlížeči)
Logo, dekor, barvy, písma, **název firmy, IČO, adresa**. ⚠️ Tisk používá jen část (název, IČO, adresa); logo a písma ignoruje. Firemní údaje jsou navíc natvrdo na dalších 5 místech → **jedno nastavení firmy**.

### PDF
Dnes tisk z prohlížeče („Uložit jako PDF“), místo podpisu vždy „V Praze“. → Rozhodnout serverové generování a ukládání: návrh k podpisu (zmrazená verze), podepsané PDF + protokol, archiv. K souborům hash, kdo a kdy; podepsané PDF neměnné.

## Dokumenty zaměstnance (Můj účet → Dokumenty, `/documents`)
- Smlouvy k podpisu a podepsané, statický seznam smluv (Smlouva / Dodatek / GDPR), výplatní pásky (jen HPP).
- ⚠️ Dokumenty **nemají vlastníka** — všichni vidí stejné; smlouvy k podpisu se filtrují jen podle stavu (vidí je každý).
- ⚠️ Smlouvy jsou dnes na 4 místech (šablonové smlouvy, syntetické smlouvy pro plnění, statické dokumenty, archiv) → sjednotit na `Contract` + `Document` (soubor s vlastníkem).
- Všechna stažení jsou atrapy.

## Směrnice

### DirectiveTemplate — šablona směrnice
Obecná (Obecné), GDPR, BOZP, Benefity a odměňování, Onboardingová příručka. Pole: název, kategorie, téma (barva), tělo s `{{…}}`.

### Directive — směrnice
| Pole | Význam |
|---|---|
| title, category, theme | téma: STANDARD, IMPORTANT, GDPR, BOZP, BENEFIT, WELCOME (jen vzhled) |
| body | vyplněné HTML (zmrazené při vydání) |
| publishedAt | vydání = okamžik publikace |
| validFrom | platnost od (výchozí dnes) |
| mustAcknowledge | vyžaduje potvrzení (výchozí ano) |
| createdBy | ⚠️ natvrdo „Petra Nováková“ → přihlášený člověk |

### Acknowledgement — potvrzení = doklad o seznámení
`directiveId`, `personId`, `acknowledgedAt`, **`method`** (`CHECKBOX` = odkliknutí v portálu po přihlášení Google Workspace / `ESIGN` = elektronický podpis), **`submissionId`** (ID podpisu v DocuSeal), **`documentHash`** (SHA-256 otisk přesného textu směrnice). Jednou, bez odvolání.

### Elektronický podpis směrnic — DocuSeal (připraveno, zatím simulace)
- U každé směrnice HR při vydání volí **„Vyžadovat elektronický podpis (DocuSeal)“** (`Directive.requireESign`). V ukázce zapnuto u BOZP.
- Člověk v detailu směrnice vidí **podpisové pole** → „Podepsat přes DocuSeal“ → po podpisu zelený blok „Podepsáno elektronicky · DocuSeal“ s datem, číslem podpisu a otiskem dokumentu. V seznamu „Vyžaduje podpis“ / „Podepsáno“; v adminu štítek „Podpis DocuSeal“ a „X / 16 podepsalo“.
- Kód: `src/lib/esign.ts` — rozhraní `ESignProvider`, dnes `demoESign`. **Napojení na DocuSeal** (open source, cloud docuseal.com/.eu nebo vlastní instalace): šablona ze směrnice `POST /api/templates/html` (jednou za verzi), podpis `POST /api/submissions` (podepisující = člověk, `external_id` = personId, bez e-mailu) → podpisový formulář vložený přímo v portálu (`@docuseal/react`, `<DocusealForm>`), webhook `form.completed` uloží `Acknowledgement` s `method: 'ESIGN'`, `submissionId`, `documentHash` a do úložiště podepsané PDF + auditní záznam DocuSeal. API klíč (`X-Auth-Token`) jen na serveru.
- Odkliknuté směrnice (`CHECKBOX`) se dokládají záznamem: kdo (přihlášení přes Google), kdy, otisk verze. Pro úřady/účetní: PDF „Protokol o seznámení“ (k doplnění).

### Pravidla směrnic
| Pravidlo | |
|---|---|
| Vydává jen HR; vydání je okamžité (bez konceptu, plánování, úpravy, verzí, archivace) | ⚠️ |
| Nevyplněná pole šablony se při vydání odstraní | |
| Každou povinnou směrnici musí potvrdit **každý** (i HR a OSVČ, bez ohledu na `validFrom`) | ⚠️ rozhodnout: na koho se vztahuje (všichni / typy spolupráce), jestli i lidé s nástupem po platnosti, zda jde potvrdit před platností |
| Statistika „X/15 odsouhlasilo“ | ⚠️ natvrdo 15 místo počtu lidí, počítá i nepovinné |
| Dashboard: úkol „Odsouhlas směrnici“, Novinky od HR = 3 nejnovější | |
| Datum v textu směrnice je volný text, nesvázaný s `validFrom` | ⚠️ |
| ⚠️ Nová směrnice se k lidem nedostane a potvrzení se neukládají (jen do obnovení stránky) | |
| Žádná notifikace o nové směrnici | rozhodnout |

**K rozhodnutí:** ukládat PDF každé verze a u potvrzení verzi, aby bylo jasné, *co* člověk potvrdil.

## BOZP
- Platí **12 měsíců**, upozornění **30 dní** předem, stavy: neabsolvováno / propadlé / brzy vyprší / platné (`src/lib/hr/model.ts`).
- Dnes: odkaz na `skolenibozp.cz` a **samodeklarace** „Označit jako splněné“ (bez dokladu).
- ✅ **BOZP se týká jen HPP, DPP a DPČ — OSVČ ne** (`RULES.bozpRequiredFor` v `src/lib/hr/model.ts`). OSVČ nedostanou úkol na Dashboardu a v Přehledu plnění mají „netýká se“.
- ⚠️ Výpočet v profilu je zduplikovaný mimo model (může se lišit o den) → sjednotit.
- Směrnice BOZP říká „školení do 30 dnů od účinnosti“ — neimplementováno.
- Do DB `BozpTraining`: člověk, datum, zdroj (sám / HR / poskytovatel), certifikát (soubor), kdo zapsal.

## Onboarding
- Seznam úkolů (`DEMO_TASKS`: osobní údaje, podpis smlouvy, kopie OP, bankovní účet, BOZP, hodnotící formulář, nouzový kontakt) **se nikde nepoužívá**.
- Skutečné úkoly jsou **počítané** na Dashboardu (směrnice, smlouva, BOZP, fotka + úkoly HR/TL).
- **K rozhodnutí:** zavést onboardingový checklist (šablona × člověk, termín od nástupu), nebo zůstat u počítaných úkolů. Kopie OP a bankovní účet = citlivé údaje (GDPR, úložiště).

## Úložiště souborů (souhrn)
Smlouvy (návrh / podepsané / archiv), logo a dekor, výplatní pásky, faktury OSVČ, účtenky k dokladům, neschopenky, kopie OP, certifikáty BOZP, profilové fotky a galerie. → Entita `StoredFile` / `Document`: vlastník, druh, typ souboru, velikost, hash, kdo nahrál, kdy, doba uchování.

## Vizuál smluv — šablona dokumentů Four Bros, brand 2026 (`src/lib/contract-doc.ts`)

Podklad od HR: `HR | 4B smlouvy/4Bros_sablona_dokumentu` (SABLONA_4Bros.md, Vzor_dokumentu_4Bros.pdf/.docx, technicka_sablona).

- Všechny smlouvy, dohody a dodatky (náhled v aplikaci, podepisování, tisk do PDF) se generují v jednom vzhledu:
  titulní strana (název, Připraveno pro / kým, schody, rožky) → úvodní věta → smluvní strany (tabulka bez linek, „(dále jen …)“, „a“) →
  uvozující věta → články „1.“ (fialově) + body „1.1“ → závěrečná věta → podpisy vedle sebe; patička „Four Bros s.r.o. · IČO · adresa · fourbros.cz“ a „X z Y“.
- Písma a barvy jsou dané brandem (Funnel Sans / Funnel Display, navy, fialová; žlutě JEN pole k doplnění „[…]“) — v aplikaci se nenastavují.
  V Admin → Smlouvy → Vizuál PDF se nastavují jen údaje firmy (obchodní firma, IČO, sídlo) a je tam náhled.
- Šablona smlouvy v aplikaci = HTML: `h2` název, `h3` = článek, `p` = bod (1.1, 1.2…). Sekce „Smluvní strany“ a řádek „V … dne …“ se z těla vynechají (generují se zvlášť).
  Prázdná proměnná `{{KLIC}}` se vypíše jako žluté pole „[popis]“.
- Údaje zaměstnance, které aplikace zatím nemá (datum narození, bydliště), jsou ve smluvních stranách jako pole k doplnění — po napojení DB doplnit z profilu.
- Pozadí: `public/brand/doc/bg_cover.png` (titulka), `bg_page.png` (náhled dalších stran). V tisku se logo + slogan opakují jako hlavička tabulky a schody jako `position: fixed`.
- Ostrá verze: PDF/DOCX pro archiv a e-podpis generovat na serveru stejnou šablonou — buď headless Chrome z tohoto HTML,
  nebo generátorem z `technicka_sablona` (docx 9.6.1 + finalize.py přes LibreOffice). Výstup musí odpovídat Vzor_dokumentu_4Bros.pdf.

## Šablony nahrané HR a živý náhled
- **Šablony → Nahrát šablonu**: Word (.docx) nebo text (.txt / .md). Z Wordu se převezme jen znění — titulní strana, smluvní strany, věty velkými písmeny a podpisy se vynechají (dělá je šablona 4Bros). Čtení .docx je v prohlížeči bez knihovny (`src/lib/template-text.ts`).
- Editor: vlevo název, typ, popis a text v jednoduchém formátu (`# název`, `## článek`, `1.1 bod`, `- odrážka`, `**tučně**`, `[pole k doplnění]`), vpravo živý náhled ve vizuálu 4Bros. Vestavěné šablony jde upravit, vlastní i smazat.
- `[Jméno a příjmení]` v textu = pole k doplnění: uloží se jako `{{F_JMENO_A_PRIJMENI}}` + popisek v `labels`; při vytváření smlouvy se nabídne jako políčko.
- **Nová ze šablony / Použít šablonu**: vlevo formulář, vpravo živý náhled smlouvy (mění se při psaní, nevyplněné žlutě).
- Typ šablony určuje smluvní strany: IČO = Objednatel / Poskytovatel (IČO, místo podnikání), ostatní = Zaměstnavatel / Zaměstnanec.
- Demo ukládá šablony do localStorage (`fb-contract-templates`). Ostrá verze: tabulka ContractTemplate s verzováním — smlouva si drží verzi šablony, ze které vznikla.

## Cesta smlouvy k podpisu (`src/lib/contract-flow-client.ts`)
1. HR: **Nová ze šablony** → vybere uživatele, druh dokumentu (= sloupec v Přehledu smluv) a vyplní pole → **Uložit jako návrh** (DRAFT).
   Při vytvoření se **zmrazí znění šablony a údaje firmy** (`snapshot`, `company`) — pozdější úprava šablony smlouvu nezmění.
2. **Odeslat jednateli** (PENDING_MANAGEMENT). HR za firmu nepodepisuje; jednatel je nastavený v Vizuál PDF → Údaje firmy → „Za firmu podepisuje“.
3. **Jednatel podepíše** (v demu tlačítko) → PENDING_EMPLOYEE: smlouva přijde uživateli do **Můj účet → Dokumenty → Smlouvy k podpisu** + notifikace „Máš smlouvu k podpisu“.
4. **Uživatel podepíše** → SIGNED: HR dostane notifikaci, smlouva je v **Přehledu smluv** (✓ ve svém sloupci) a u uživatele v **Moje smlouvy**.
- Od kroku 2 je smlouva v Přehledu smluv jako „čeká na podpis jednatele / uživatele“ (tužka).
- **PDF ke stažení** má HR i uživatel (Přehled smluv, Moje smlouvy, detail smlouvy) — v demu přes tisk → Uložit jako PDF; v ostré verzi PDF z e-podpisu (DocuSeal) uložené v úložišti.
- **Po podpisu je smlouva zamčená**: nejde upravit ani smazat (v UI zámek, v kódu `isLocked`; na backendu hlídat i v API). Nepodepsanou může HR zrušit.
- K rozhodnutí: e-podpis uživatele je v demu „kvalifikovaný certifikát“ (simulace) — sjednotit s DocuSeal jako u směrnic; jak podepisuje jednatel (DocuSeal, pořadí podpisů).

