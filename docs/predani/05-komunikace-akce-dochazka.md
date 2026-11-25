# 5 · Schránka důvěry, notifikace, akce, docházka, Dashboard

## Schránka důvěry

### Feedback — zpráva (`mock-data.ts:82-123`, stavy HR v `fb-feedback-admin`)
| Pole | Význam |
|---|---|
| anonymous | anonymně (výchozí **ano**) |
| authorName | jméno, jen pokud ne anonymně (⚠️ text → v DB `authorPersonId`) |
| category | volitelné téma: pracovní podmínky, vztahy, odměňování, vedení, procesy, návrh, pochvala, jiné (⚠️ klíč `ODMENOVÁNÍ` s diakritikou) |
| message | povinný text |
| status | NEW → READ → RESOLVED |
| submittedAt | kdy přišla |
| adminNote | odpověď HR |
| *(příloha)* | formulář přílohu umožní, ⚠️ v datech pro ni pole není |

### Pravidla
- Poslat může každý. Číst a odpovídat jen HR.
- NEW → READ („Označit jako přečteno“), NEW/READ → RESOLVED („Odpovědět a označit jako vyřešeno“, odpověď volitelná). Z vyřešeného zpět nejde, odpověď nejde upravit.
- Dashboard HR: úkol „Přečti N nových zpráv“.
- ⚠️ **Odeslání je dnes simulované — zprávy se nikam neukládají.**
- ⚠️ Odpověď HR nemá cestu zpět k odesílateli (zaměstnanec nemá „moje zprávy“).

### Anonymita — co musí databáze dodržet (slib v aplikaci „anonymní nelze dohledat“)
- Anonymní zpráva **nesmí** mít ID člověka, e-mail, IP adresu, prohlížeč ani session — ani v lozích serveru (vypnout logování těla požadavku).
- Čas odeslání stačí zaokrouhlit na den (v 16 lidech jde přesný čas spárovat s přihlášením).
- Z přílohy odstranit metadata (autor, EXIF) a přejmenovat ji.
- Notifikace pro HR nesmí obsahovat odesílatele.
- **K rozhodnutí:** jak dostat odpověď k odesílateli — anonymní kód pro zobrazení odpovědi, nebo odpovědi jen u podepsaných zpráv.
- Text slibuje „vidí jen HR — ani admin bez HR role, ani team lead“ → pokud má platit, samostatné oprávnění na čtení schránky.

## Notifikace (`fb-notifications`, zvonek v hlavičce)
`recipientEmail` (⚠️ → v DB `recipientPersonId`), `title`, `body`, `href`, `createdAt`, `read`. Zvonek: max 15 nejnovějších, tečka u nepřečtených, kliknutím přečteno, „Označit vše jako přečtené“. Mazání ani retence nejsou.

| Událost | Komu |
|---|---|
| Rozhodnutí o dovolené | žadateli |
| Rozhodnutí o příspěvku na sport | žadateli (⚠️ odkaz na neexistující záložku Benefity) |
| Rozhodnutí o vzdělávacím budgetu | žadateli (⚠️ totéž) |
| Rozhodnutí o dokladu k proplacení | žadateli |
| Faktura OSVČ zaplacena | OSVČ |
| Návrh prémie / změny odměny od TL | ⚠️ natvrdo jednomu HR → všem HR |
| Rozhodnutí o návrhu TL | team leadovi |

**Dnes notifikaci nevytváří (k rozhodnutí):** nová zpráva ve schránce, nová žádost o dovolenou, nový doklad / žádost o sport / vzdělávání, nová směrnice, smlouva k podpisu, blížící se BOZP, nová akce. **E-mail ani Slack se neposílá** (knihovna na e-maily je nainstalovaná, ale nepoužitá).

## Firemní akce a Google Kalendář
- `CompanyEvent`: název, datum (jen den, bez času a konce), zdroj (Google / ruční).
- HR přidá ruční akci nebo napojí Google Kalendář (tajná iCal adresa) v kartě akcí na Dashboardu.
- Načítání z Google: jen `https://calendar.google.com`, dnes + 60 dní, max 20 akcí; ročně opakované akce ano, ostatní opakování, vícedenní akce a zrušené akce se ignorují; čas a časová zóna se zahodí.
- Karta „Kalendář akcí“ pro všechny: max 4 nejbližší; když nic není, ukáže **ukázkové akce**.
- ⚠️ **Akce i napojení kalendáře jsou uložené jen v prohlížeči HR** — zaměstnanci vidí vždy jen ukázku. → Nastavení na serveru.
- ⚠️ Tajná iCal adresa jde v adrese požadavku → do nastavení na serveru.
- Účast na akcích (RSVP) — kód existuje, nepoužívá se.

## Docházka, dovolená, absence — portál vs. TrackDeck
Schvalování dovolené se přesunulo do **TrackDecku**, ale **integrace neexistuje** a modul v portálu je napůl odpojený:

| Část | Stav |
|---|---|
| `/time-off` (moje docházka, žádost) | funguje, nic neukládá, **není v menu** |
| `/admin/leave-requests` (schvalování) | HR + TL svého týmu, nic neukládá, **není v menu** |
| `/admin/leave-calendar` (Docházka firmy) | HR úpravy (⚠️ HR ho nemá v menu), TL čte **celou firmu** |
| Absence (`DEMO_TEAM_LEAVES`) | **používá se pro výpočet srážky za nemoc a dní dovolené ve výplatě** a pro kalendář |

**K rozhodnutí:**
- **(a)** TrackDeck je zdroj pravdy → portál jen **importuje schválené absence** (výplata, kalendář, případně zůstatek); `/time-off` a schvalování v portálu smazat. Napojení osob přes e-mail.
- **(b)** portál žádosti vlastní → dopsat ukládání.
- Kdo je zdroj pravdy pro zůstatek dovolené.

### Absence — pole
Člověk (⚠️ dnes **jméno jako text** → `personId`), typ, od, do (včetně), stav (APPROVED / PENDING / REJECTED).

### Pravidla docházky
| Pravidlo |
|---|
| Schvaluje se **jen dovolená**; ostatní typy (home office, nemoc, lékař, pohřeb, placené/neplacené volno) se zapisují automaticky |
| HR schvaluje všechny, TL svůj tým (⚠️ serverové API TL zakazuje) |
| Upozornění na překryv: další dovolené lidí se stejným TL ve stejném období |
| Žádost: typ, od, do (≥ od), důvod povinné; půlden = 0,5; u nemoci volitelná neschopenka (PDF/PNG/JPG, max 10 MB) |
| Pracovní dny = Po–Pá bez státních svátků; svátky se z dovolené neodečítají |
| Státní svátky ČR včetně Velikonoc (⚠️ funkce zkopírovaná na 4 místech) |
| Pravidla (text, nevynucuje se): nárok 25 dní, převod max 5 dní do Q1, home office ohlásit do 7:59 na Slack, nemoc hrazena 1.–15. den |

### Nesoulady
- **4 různé číselníky typů absencí** → jeden číselník s vlastnostmi (odečítá z dovolené, potřebuje schválení, placené).
- Pracovní vs. kalendářní dny (formulář pracovní, výplata a kalendář kalendářní).
- Zůstatek dovolené: 20 (natvrdo) vs. nárok 25 u člověka vs. Pravidla 25; nárok člověka se nikde nepoužívá. Zůstatek je pro všechny stejný, i pro OSVČ.
- Pravidla: nemoc 1.–15. den × výpočet 14 dní.
- Kalendář přidává absenci od HR jako „čeká na schválení“.

## Dashboard — úkoly „Čeká na tebe“
| Úkol | Podmínka | Kdo |
|---|---|---|
| Schval N dokladů k proplacení | čekající doklady (TL jen svůj tým) | HR, TL (⚠️ TL nemá kde schválit) |
| Přečti N nových zpráv ve schránce důvěry | zprávy ve stavu NEW | HR |
| Podepiš N smluv za firmu | smlouvy čekající na vedení | HR |
| Vyřeš N smluv, které končí | doba určitá ≤ 90 dní nebo už skončila | HR |
| N lidí má něco nesplněné | aspoň jeden problém, který řeší člověk sám | HR |
| Odsouhlas směrnici / N směrnic | chybí potvrzení povinné směrnice | všichni |
| Podepiš: {smlouva} | moje smlouva čeká na můj podpis | všichni |
| Nahraj svou fotku | nemám fotku | všichni |
| Projdi školení BOZP / vyprší za N dní | BOZP chybí, propadlo, nebo vyprší do 30 dní | všichni |

Kontakt na HR (karta v Novinkách od HR): první člověk s rolí HR, tlačítka **„Napiš na Slacku“** (přímá zpráva — potřebuje Slack ID člověka, bez něj otevře aplikaci Slack) a **„Zavolat“** (telefon HR). Sama HR kartu nevidí.

Další prvky: pozdrav podle denní doby, oslovení přezdívkou nebo 5. pádem, „Jsi s námi X“, odpočet faktury/výplaty, karty Lidé / Kalendář akcí / Novinky od HR + kontakt na HR. Bez částek peněz (lze otevřít před kýmkoli).
⚠️ Úkoly HR „doklady“ a „zprávy“ čtou ukázková data, ne aktuální stav — po vyřízení nezmizí.

## Pravidla (stránka v hlavičce)
Statický text (home office, dovolená, nemoc s kalkulačkou, lékař, pohřeb, fakturace) natvrdo v kódu, včetně jmen a kontaktů (`invoice@fourbros.cz`, Slack). → Rozhodnout, zda ho má upravovat HR (pak entita nebo směrnice). ⚠️ Píše „proplácí se ke 20.“, nastavení říká 18.

## Ostatní
- Hlídač nové verze: každých 30 s se ptá na verzi aplikace, při změně nabídne „načíst“.
- ⚠️ Přihlašovací stránka používá kód ze složky `intro-preview` — tu nejde smazat bez úpravy loginu.

## Chybějící API (dnes vše v prohlížeči nebo vůbec)
Schránka důvěry, notifikace, akce, nastavení (iCal, termíny), absence / žádosti, profil (dnes neukládá), založení člověka.
