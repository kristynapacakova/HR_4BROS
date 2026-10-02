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

## Nasazení na Vercel (krok za krokem)

Kód je na GitHubu v repozitáři `kristynapacakova/hr_4bros`. Vercel si ho odtud sám stáhne a při každé změně na GitHubu appku znovu nasadí.

1. **Účet:** přihlas se na <https://vercel.com> přes GitHub (Continue with GitHub).
2. **Import:** klikni na **Add New… → Project**, u repozitáře `hr_4bros` dej **Import**. Nastavení nech, jak je (Framework Preset: *Other*). Zatím **neklikej na Deploy**, nejdřív rozbal **Environment Variables** a přidej:
   - `APP_PASSWORD`: heslo, kterým se budeš do appky přihlašovat (vymysli si silné).
   - `ANTHROPIC_API_KEY`: klíč z <https://console.anthropic.com/> → API Keys. Je potřeba jen pro vyhodnocení přepisů a dá se doplnit i později.
3. Klikni na **Deploy**.
4. **Databáze:** v projektu otevři záložku **Storage → Create Database → Upstash for Redis** (verze Free stačí) a dej **Connect** k tomuhle projektu. Vercel sám doplní přístupové údaje (`KV_REST_API_URL`, `KV_REST_API_TOKEN`).
5. **Redeploy:** záložka **Deployments** → u posledního nasazení tři tečky → **Redeploy**. Nové proměnné se načtou až po novém nasazení.
6. Otevři adresu, kterou ti Vercel ukáže (něco jako `hr-4bros.vercel.app`), a přihlas se heslem z kroku 2.

Když později změníš heslo nebo klíč v **Settings → Environment Variables**, vždy udělej Redeploy. Změna hesla odhlásí všechna zařízení.

> Vercel standardně nasazuje větev `main`. Pokud je appka zatím na jiné větvi, buď ji slouč do `main`, nebo ve Vercelu v **Settings → Git → Production Branch** nastav tu větev.

### Co appka na Vercelu potřebuje

| Proměnná | K čemu | Povinné |
|---|---|---|
| `APP_PASSWORD` | heslo do appky | ano |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | databáze Upstash Redis, doplní je Vercel | ano |
| `ANTHROPIC_API_KEY` | vyhodnocení přepisů (Claude Opus 5.5) | pro semafor z přepisů |

Vyhodnocení jednoho přepisu může trvat 1–2 minuty, appka má proto nastavený delší časový limit funkce (`vercel.json`).

## Verze na claude.ai

Alternativa bez Vercelu a bez API klíče: <https://claude.ai/artifact/P7CSayPRUVNECtPXTKm25D>. Přepis tu vyhodnotí Claude pod tvým účtem a data jsou v soukromé části stránky. Zdroj je ve složce `artifact/`. Data mezi verzí na claude.ai a na Vercelu se nesdílí, přenést je jde přes **Nastavení → Stáhnout zálohu / Nahrát zálohu**.

## Spuštění na vlastním počítači (volitelné)

Potřebuješ [Node.js](https://nodejs.org/) verze 22 nebo novější.

```bash
npm install
cp .env.example .env      # volitelně doplň ANTHROPIC_API_KEY, případně APP_PASSWORD
npm start
```

Pak otevři <http://localhost:3000>. Bez Redisu se data ukládají do složky `data/` (není v gitu).

## Data a soukromí

- Na Vercelu jsou data v databázi Upstash Redis připojené k tvému projektu. Appka je zamčená heslem a bez přihlášení nevrátí žádná data.
- K vyhodnocení se přepis posílá do Claude API (Anthropic). Nováčka je dobré informovat, že se rozhovor přepisuje a zpracovává (GDPR).
- AI hodnotí jen pracovní postoje a chování, ne osobnost ani citlivé údaje. Výsledek je podklad pro rozhovor, ne rozhodnutí.
- Pravidelně si v Nastavení stahuj zálohu.

## Struktura

```
public/          frontend (index.html, app.js, style.css, watercolor.jpg)
api/             Vercel funkce (data, přepisy, přihlášení, vyhodnocení)
lib/             sdílená logika: úložiště, přihlášení, vyhodnocení přes Claude API
server.js        lokální server pro běh na vlastním počítači
vercel.json      nastavení pro Vercel
artifact/        verze pro claude.ai
```
