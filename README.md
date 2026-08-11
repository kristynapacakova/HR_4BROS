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
- **Postup** — sedm fází od D−14 po první rok, celkem 59 odškrtávacích kroků s uvedením, kdo je vlastníkem
- **Návody** — 12 návodů krok za krokem (přihlášení do systémů, e-mailový podpis, docházka a nemoc, první schůzka s klientem, kam co ukládat, vizitky, hodnoticí 1:1 a další)
- **Značka** — pravidla z brand manuálu pro každého, kdo píše klientovi
- **Kdo je kdo** — na co se ptát buddyho, nadřízeného, HR a IT
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

## Vizuální styl

Vychází z Four Bros Brand Guidelines v1.0 (11-2023):

- **Barvy** (4.2) — Four Bros Navy `#194669` nese texty a tvary, Alice Blue `#F7F8FE`
  a Light Grey `#F4F4F4` slouží jako výplně, bílá pokrývá většinu plochy,
  Electric Violet `#7E17E0` jen na tlačítka a zvýraznění pod 5 % plochy
- **Typografie** (5.4) — nadpisy 1. a 2. úrovně Serenity, 3. úroveň Roboto Bold,
  odstavce Roboto Light
- **Ikony** (6.1) — obrysy v primární barvě, detail v Electric Violet, kruhové pozadí Alice Blue

Fonty Serenity a Roboto nejsou v souboru vložené kvůli licenci. Bez nich se aplikace
zobrazí v náhradních řezech — pro přesnou podobu je potřeba mít je nainstalované
z firemní složky s fonty.

Logo je v hlavičce zastoupené zjednodušenou značkou. Oficiální soubor loga do aplikace
nevkládám, aby nedošlo k porušení pravidel z kapitoly 1.6 (proporce, ochranná zóna,
minimální velikost) — pokud ho chceš doplnit, použij originální soubor ze sdílené složky.
