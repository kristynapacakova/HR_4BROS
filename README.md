# HR_4BROS

Interní HR materiály Four Bros.

## Obsah

| Soubor | Co to je |
|---|---|
| [`onboarding/pruvodce-onboardingem.html`](onboarding/pruvodce-onboardingem.html) | Onboardingová aplikace — proklikávací průvodce nástupem od A po Z |

## Onboardingová aplikace

Jeden HTML soubor, který je zároveň celá aplikace. Nepotřebuje server, instalaci ani
připojení — stačí ho otevřít v prohlížeči nebo poslat odkazem.

### Obrazovky

- **Přehled** — postup v procentech, kolikátý je den onboardingu, aktuální fáze a co je na řadě
- **Postup** — sedm rozbalovacích fází, celkem 62 odškrtávacích kroků s odznakem role, která je má na starosti
- **Přístupy** — kompletní postup zajištění přístupů novému kolegovi: založení účtů, fyzické přístupy, nastavení nástrojů krok za krokem a 14 řešených zádrhelů
- **Návody** — 16 návodů krok za krokem: přihlášení do nástrojů, přístupy do klientských účtů, výkazy hodin, první call s klientem, kontrola výstupů před odesláním, mlčenlivost a klientská data, náš brand manuál, e-mailový podpis a další
- **Značka** — pravidla z brand manuálu pro každého, kdo píše klientovi
- **Kdo je kdo** — posádka Four Bros a na co se koho ptát
- **Termíny** — zákonné lhůty při nástupu
- **Šablony** — uvítací e-mail, oznámení týmu, plán 30/60/90, dotazník ve 30. dni (jen v režimu HR)
- **Nastavení** — firemní údaje a údaje o novém kolegovi

### Jak se používá

1. V **Nastavení** vyplň firemní údaje a jméno nového kolegy. Vyplňuje se jednou.
2. Klikni na **Zkopírovat sdílecí odkaz**. Odkaz v sobě nese všechny vyplněné údaje.
3. Pošli odkaz novému člověku. Uvidí konkrétní jména a systémy místo prázdných míst
   a odškrtává si vlastní postup.

Přepínač **Nový kolega / HR** v levém sloupci mění pohled — HR navíc vidí obrazovku
se šablonami textů.

### Jak to funguje uvnitř

- Vyplněné údaje se do textů doplňují přes zástupné značky `{{klic}}`. Co není vyplněné,
  zůstane zvýrazněné fialovou, aby bylo vidět, co ještě chybí.
- Odškrtnuté kroky a vyplněné údaje se ukládají do `localStorage` daného prohlížeče.
  Nikam se neodesílají.
- Sdílecí odkaz nese údaje zakódované v adrese (base64 v hashi). **Postup se nepřenáší** —
  každý má svůj vlastní.
- Aktuální fáze se počítá z data nástupu oproti dnešnímu dni.

### Ověřeno

Aplikace byla proklikána automatizovaným testem v Chromiu — routování, ukládání stavu,
propisování údajů do návodů i šablon, sdílecí odkaz, mobilní zobrazení bez vodorovného
scrollu a tmavý režim. Bez chyb v konzoli.

### Než to začneš používat

Tabulka zákonných termínů slouží jako připomínka, co nesmí zapadnout, ne jako právní
výklad. Konkrétní lhůty a maximální délku zkušební doby si nech potvrdit od účetní
nebo právníka — zákoník práce se v této oblasti opakovaně měnil.

## Zdroj obsahu

Postup přístupů a seznam nástrojů vychází z **interní procesní mapy Four Bros**,
obnovené z větve `claude/dazzling-allen-z9AjG` (commit `44d838f` ji odstranil
z HR aplikace s poznámkou „will be redone separately"). Reálný stack:
Four Bros Gmail, Asana, 1Password, Slack, Costlocker, SettleUp, docházka
a fakturace, PandaDoc na smlouvy, iGET na vstup do budovy.

## Obsah je psaný na agenturu

Kroky i návody vycházejí z toho, že Four Bros je full-service marketingová agentura:
klientské účty (Google Ads, Meta, GA4, Search Console), výkazy odpracovaných hodin,
cally s klientem, kontrola výstupů před odesláním, mlčenlivost o klientských datech
a rozdíl mezi naším brand manuálem a brand manuálem klienta.

Posádka na obrazovce „Kdo je kdo" je předvyplněná podle veřejného webu — Víťa, Honza,
Kristýna, Jessica a Matúš, Radim, Zdenda a Filip. Uprav ji v poli `CREW` v souboru,
pokud se složení změní.

## Vizuální styl

Postranní panel v primární barvě Four Bros Navy, bílá pracovní plocha, měkce zaoblené
karty a vzdušná typografie. Za hlavičkou přehledu je jemná brushová plocha podle
kapitoly 7.1 brand manuálu — lehkost, jemné tóny, decentnost.

- **Fáze jsou rozbalovací** — otevřená je ta aktuální, ostatní jsou složené,
  takže se místo zdi 59 zaškrtávátek zobrazí přehledný seznam
- **Fialová má jediný význam** — Electric Violet označuje aktuální fázi,
  odškrtnuté kroky a hlavní tlačítka. Tím sama od sebe drží limit 5 % plochy
- **Kruhový ukazatel** postupu na přehledu, tenký pruh v postranním panelu
- **Odznaky rolí** (HR, Manažer, IT, Buddy) u každého kroku, aby bylo hned vidět,
  kdo ho má na starosti

Dodržené kapitoly brand manuálu:

- **Barvy** (4.2) — Four Bros Navy `#194669` nese texty a tvary, Alice Blue `#F7F8FE`
  a Light Grey `#F4F4F4` slouží jako výplně, bílá pokrývá většinu plochy,
  Electric Violet `#7E17E0` jen na tlačítka a zvýraznění pod 5 % plochy
- **Typografie** (5.4) — nadpisy 1. a 2. úrovně Serenity, 3. úroveň Roboto Bold,
  odstavce Roboto Light, řádkování v pásmu 1,5–1,8
- **Ikony** (6.1) — obrysy v primární barvě, detail v Electric Violet, kruhové pozadí Alice Blue

Fonty Serenity a Roboto nejsou v souboru vložené kvůli licenci. Bez nich se aplikace
zobrazí v náhradních řezech — pro přesnou podobu je potřeba mít je nainstalované
z firemní složky s fonty.

Logo je v postranním panelu zastoupené zjednodušenou značkou. Oficiální soubor loga do aplikace
nevkládám, aby nedošlo k porušení pravidel z kapitoly 1.6 (proporce, ochranná zóna,
minimální velikost) — pokud ho chceš doplnit, použij originální soubor ze sdílené složky.
