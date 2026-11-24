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

### Archiv PDF (HR)
Nahrání hotové smlouvy: soubor PDF, název, člověk, typ (HPP / DPP / DPČ / OSVČ / Dodatek / Jiné), poznámka. ⚠️ Nic se neukládá. Zaměstnanec archiv nevidí.

### Vzhled PDF (Vizuál PDF, `fourBros_contractDesign` v prohlížeči)
Logo, dekor, barvy, písma, **název firmy, IČO, adresa**. ⚠️ Tisk používá jen část (název, IČO, adresa); logo a písma ignoruje. Firemní údaje jsou navíc natvrdo na dalších 5 místech → **jedno nastavení firmy**.

### PDF
Dnes tisk z prohlížeče („Uložit jako PDF“), místo podpisu vždy „V Praze“. → Rozhodnout serverové generování a ukládání: návrh k podpisu (zmrazená verze), podepsané PDF + protokol, archiv. K souborům hash, kdo a kdy; podepsané PDF neměnné.

## Dokumenty zaměstnance (Můj účet → Dokumenty, `/documents`)
- Smlouvy k podpisu a podepsané, statický seznam smluv (Smlouva / Dodatek / GDPR / NDA), výplatní pásky (jen HPP).
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
`directiveId`, `personId`, `acknowledgedAt`, **`method`** (`CHECKBOX` = odkliknutí v portálu po přihlášení Google Workspace / `ESIGN` = elektronický podpis), **`envelopeId`** (ID obálky DocuSign), **`documentHash`** (SHA-256 otisk přesného textu směrnice). Jednou, bez odvolání.

### Elektronický podpis směrnic — DocuSign (připraveno, zatím simulace)
- U každé směrnice HR při vydání volí **„Vyžadovat elektronický podpis (DocuSign)“** (`Directive.requireESign`). V ukázce zapnuto u BOZP.
- Člověk v detailu směrnice vidí **podpisové pole** → „Podepsat přes DocuSign“ → po podpisu zelený blok „Podepsáno elektronicky · DocuSign“ s datem, číslem obálky a otiskem dokumentu. V seznamu „Vyžaduje podpis“ / „Podepsáno“; v adminu štítek „Podpis DocuSign“ a „X / 16 podepsalo“.
- Kód: `src/lib/esign.ts` — rozhraní `ESignProvider`, dnes `demoESign`. **Napojení:** serverová implementace přes DocuSign eSignature REST API — vytvořit obálku s PDF směrnice a podepisujícím (embedded signing → podpis přímo v portálu), DocuSign Connect (webhook) po dokončení uloží `Acknowledgement` s `method: 'ESIGN'`, `envelopeId`, `documentHash` a do úložiště podepsané PDF + certifikát o dokončení. Klíče DocuSign jen na serveru.
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
