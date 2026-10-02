# Four Bros · HR check-iny

Samostatná HR appka (nezávislá na HR portálu) pro adaptaci nováčků během prvních 3 měsíců.

- **Lidé**: seznam nováčků s datem nástupu, pozicí, týmem a leaderem/buddym. Ukazuje, kolikátý den adaptace člověk má.
- **Kalendář**: od data nástupu se každému automaticky naplánují check-iny (výchozí den 14, 30, 60 a 85). Schůzku, která vyjde na víkend, appka posune na pondělí. Termíny jde ručně posunout a celý plán stáhnout jako `.ics` do Google nebo Outlook kalendáře.
- **Přepisy → semafor**: ke každému check-inu nahraješ přepis (`.txt`, `.md`, `.vtt`, `.srt`, nebo text rovnou vložíš). AI ho vyhodnotí podle hodnot Four Bros a seznamu red flags:
  - 🟢 **Souzní**: člověk sdílí kulturu a hodnoty
  - 🟠 **Pozor**: nejasnosti nebo menší signály, je dobré se doptat
  - 🔴 **Red flag**: vážný varovný signál

  Ke každému hodnocení dostaneš doslovnou citaci z přepisu, silné stránky, otázky na příští schůzku a doporučený další krok. Semafor můžeš vždycky ručně přepsat, finální slovo máš ty.
- **Poznámky**: ke každé schůzce i obecné poznámky k člověku.
- **Nastavení**: hodnoty Four Bros, red flags a harmonogram check-inů si upravíš sama. Přes záloha/obnova stáhneš a nahraješ data jako JSON.

## Spuštění

Potřebuješ [Node.js](https://nodejs.org/) verze 22 nebo novější.

```bash
npm install
cp .env.example .env      # do .env vlož ANTHROPIC_API_KEY
npm start
```

Pak otevři <http://localhost:3000>.

Bez API klíče funguje všechno kromě vyhodnocení přepisů. Klíč získáš na <https://console.anthropic.com/>. Analýza běží na modelu Claude Opus 5.5.

Tip: na prvním spuštění klikni na **„Vyzkoušet na ukázkových datech“** a uvidíš, jak to vypadá s vyplněnými daty.

## Data a soukromí

- Všechna data (lidi, přepisy, poznámky) jsou jen v souboru `data/db.json` na počítači, kde appka běží. Do gitu se **neukládají** (`data/` je v `.gitignore`).
- Appka poslouchá jen na `127.0.0.1`, takže z jiného počítače se k ní nikdo nedostane. Pokud ji budeš chtít provozovat na serveru pro víc lidí, bude potřeba přidat přihlášení.
- K vyhodnocení se přepis posílá do Claude API (Anthropic). Nováčka je dobré informovat, že se rozhovor přepisuje a zpracovává (GDPR).
- AI hodnotí jen pracovní postoje a chování, ne osobnost ani citlivé údaje. Výsledek je podklad pro rozhovor, ne rozhodnutí.

## Struktura

```
server.js          Node server: ukládání dat + /api/analyze (Claude API)
public/index.html  aplikace
public/app.js      logika (lidé, kalendář, semafor, poznámky, nastavení)
public/style.css   vizuál v barvách Four Bros
public/watercolor.jpg
```
