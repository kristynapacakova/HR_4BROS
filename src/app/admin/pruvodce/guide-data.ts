// Obsah průvodce on/offboardingem — vychází z interní HR procesní mapy Four Bros
// (fáze 2. PRE ONBOARDING → 3. ONBOARDING a 4. OFFBOARDING → 5. POST OFFBOARDING).

export interface GuideItem {
  text: string
  /** Krátký tip zobrazený u bodu */
  hint?: string
  /** Detailní postup (mini-manuál) pro režim „krok za krokem" — aby zaškolení zvládl kdokoliv */
  how?: string[]
}

export interface GuideStep {
  id: string
  title: string
  desc: string
  items?: (string | GuideItem)[]
}

export function normItem(it: string | GuideItem): GuideItem {
  return typeof it === 'string' ? { text: it } : it
}

export interface GuidePhase {
  id: string
  title: string
  timing: string
  steps: GuideStep[]
}

export const ONBOARDING_PHASES: GuidePhase[] = [
  {
    id: 'on-24h',
    title: 'Po výběrovém řízení',
    timing: 'Do 24 hodin od ukončení výběrového řízení',
    steps: [
      {
        id: 'on-smlouvy-priprava',
        title: 'Připravit smlouvy v PandaDoc',
        desc: 'Připrav všechny smlouvy k podpisu v PandaDoc — typ úvazku a spolupráce ber z výstupu pohovoru v Asaně.',
      },
      {
        id: 'on-info-tym',
        title: 'Informovat tým o výsledku',
        desc: 'Dej týmu vědět, jak dopadlo výběrové řízení a kdo nastupuje. Krátká zpráva na Slack stačí.',
      },
    ],
  },
  {
    id: 'on-3dny',
    title: 'Smlouvy',
    timing: 'Do 3 dnů od ukončení výběrového řízení',
    steps: [
      {
        id: 'on-smlouvy-projiti',
        title: 'Projít smlouvy s novým členem',
        desc: 'Vedení projde smlouvy společně s novým členem týmu — bod po bodu, ať je vše jasné ještě před podpisem.',
      },
      {
        id: 'on-smlouvy-podpis',
        title: 'Podpis smlouvy v PandaDoc',
        desc: 'Odešli smlouvu k elektronickému podpisu v PandaDoc a zkontroluj, že je podepsaná oběma stranami.',
      },
    ],
  },
  {
    id: 'on-14dni',
    title: 'Příprava na nástup',
    timing: '14 dní před nástupem',
    steps: [
      {
        id: 'on-misto',
        title: 'Zajistit pracovní místo',
        desc: 'Objednej / vyhraď vše, co bude nový člen potřebovat od prvního dne.',
        items: ['Kancelářská židle', 'Pracovní stůl', 'Monitor', 'Notebook', 'Potřebné připojovací kabely'],
      },
      {
        id: 'on-balicek',
        title: 'Nachystat Four Bros balíček',
        desc: 'Připrav uvítací balíček — malá věc, velký dojem.',
        items: ['Mikina', 'Ponožky', 'Samolepky', 'Blok', 'Propiska'],
      },
      {
        id: 'on-pivko',
        title: 'Zaplánovat seznamovací pivko / grilovačku',
        desc: 'Najdi termín, kdy se nový člen neformálně potká s týmem ještě před nástupem nebo krátce po něm.',
      },
      {
        id: 'on-email',
        title: 'Odeslat onboardingový e-mail',
        desc: 'Ve spolupráci s Head of team pošli e-mail s hrubým nástřelem zkušební doby — ať nový člen ví, co ho čeká.',
        items: [
          'Onboardingový plán v průběhu zkušební doby',
          'Cíle v rámci zkušební doby',
          'Nástin průběhu 1. pracovního dne',
          'Pozvánka na projití a podpis smluv',
        ],
      },
    ],
  },
  {
    id: 'on-7dni',
    title: 'Firemní přístupy',
    timing: '7 dní před nástupem',
    steps: [
      {
        id: 'on-pristupy',
        title: 'Založit firemní přístupy',
        desc: 'Založ účty ve všech nástrojích, které používáme. Přihlašovací údaje ulož do 1Password, předáš je první den.',
        items: ['Four Bros Gmail', 'Asana', '1Password', 'Slack', 'Costlocker', 'SettleUp', 'Docházka & fakturace'],
      },
    ],
  },
  {
    id: 'on-pred',
    title: 'Těsně před nástupem',
    timing: 'Pár dní před 1. dnem',
    steps: [
      {
        id: 'on-kontrola-mista',
        title: 'Zkontrolovat pracovní místo',
        desc: 'Projdi pracovní místo, ať je první den vše připravené a funkční.',
        items: ['Kontrola židle', 'Kontrola pracovního stolu', 'Držák na kabely pod stolem', 'Odpadkový koš', 'Připravená elektronika + kabely'],
      },
      {
        id: 'on-seznameni',
        title: 'Seznámení s týmem',
        desc: 'Proběhlo seznamovací pivko / grilovačka? Pokud ne, aspoň krátké představení na Slacku s fotkou a pár větami.',
      },
    ],
  },
  {
    id: 'on-den1',
    title: '1. den ve Four Bros',
    timing: 'Den nástupu',
    steps: [
      {
        id: 'on-predani',
        title: 'Předání vybavení',
        desc: 'Předej novému členovi vše fyzické, co k práci potřebuje.',
        items: [
          'Pracovní místo',
          'Four Bros balíček',
          'Klíče + čip od budovy',
          'Notebook + příslušenství',
          'iGET — QR pro přidání člena',
          'Telefonní číslo na otevření brány',
        ],
      },
      {
        id: 'on-gmail',
        title: 'Gmail',
        desc: 'Společně nastavte účet: dvoufázové ověření, podpis, profilová fotka a aplikace v telefonu.',
        items: [
          {
            text: 'Nastavit 2fázové ověření',
            hint: 'Povinné pro všechny firemní účty.',
            how: [
              'Otevři myaccount.google.com a přihlas se firemním účtem.',
              'V levém menu zvol „Zabezpečení".',
              'V sekci „Jak se přihlašujete do Googlu" klikni na „Dvoufázové ověření" → „Začít".',
              'Zadej telefonní číslo nováčka a zvol ověření SMS (nebo výzvou v telefonu).',
              'Zadej ověřovací kód a potvrď „Zapnout".',
            ],
          },
          {
            text: 'Nastavit podpis',
            how: [
              'V Gmailu klikni vpravo nahoře na ozubené kolo → „Zobrazit všechna nastavení".',
              'Na kartě „Obecné" sjeď na sekci „Podpis" a klikni „Vytvořit nový".',
              'Vlož firemní šablonu podpisu (jméno, pozice, telefon, web fourbros.cz).',
              'Dole nastav, aby se podpis vkládal do nových e-mailů i odpovědí, a ulož změny.',
            ],
          },
          {
            text: 'Nastavit fotku',
            how: [
              'Na myaccount.google.com otevři „Osobní údaje" → „Fotka".',
              'Nahraj profesionální fotku (ideálně stejnou jako na web a Slack).',
            ],
          },
          {
            text: 'Stáhnout appku do telefonu',
            how: [
              'App Store / Google Play → vyhledat „Gmail" → nainstalovat.',
              'Přihlásit se firemním účtem (projde přes 2FA — dobrá kontrola, že funguje).',
            ],
          },
        ],
      },
      {
        id: 'on-kalendar',
        title: 'Google kalendář',
        desc: 'Přidej sdílené kalendáře a nauč nového člena s nimi pracovat.',
        items: [
          {
            text: 'Přidat meetingovky',
            how: [
              'V Google Kalendáři vlevo u „Další kalendáře" klikni na „+".',
              'Zvol „Procházet zdroje" / „Přihlásit se k odběru kalendáře".',
              'Přidej kalendáře zasedaček — nováček pak vidí obsazenost při plánování meetingů.',
            ],
          },
          {
            text: 'Přidat kalendáře Four Bros členů',
            how: [
              'U „Další kalendáře" → „+" → „Přihlásit se k odběru kalendáře".',
              'Postupně zadej e-maily členů týmu, se kterými bude nováček spolupracovat.',
            ],
          },
          {
            text: 'Přidat kalendář „Narozeniny ve Four Bros" + doplnit narozeniny nováčka',
            hint: 'Nezapomeň přidat i narozeniny nového člena!',
            how: [
              'Nasdílej nováčkovi kalendář „Narozeniny ve Four Bros" (odkaz na odběr).',
              'Do kalendáře přidej celodenní opakující se událost s narozeninami nového člena.',
            ],
          },
          {
            text: 'Stáhnout appku do telefonu',
            how: ['App Store / Google Play → „Google Calendar" → přihlásit firemním účtem.'],
          },
        ],
      },
      {
        id: 'on-1password',
        title: '1Password',
        desc: 'Projděte vaulty a ulož emergency kit. Vysvětli, které přístupy k nástrojům (Canva, Figma, ChatGPT…) tam najde.',
        items: [
          {
            text: 'Přijmout pozvánku a založit účet',
            how: [
              'Nováček otevře pozvánkový e-mail „Join Four Bros on 1Password" a klikne na „Join".',
              'Vyplní jméno a vytvoří si silné hlavní heslo (Master Password) — jediné heslo, které si musí pamatovat.',
              'Heslo si nikam nepíše do počítače — ideálně do papírového bloku z Four Bros balíčku.',
            ],
          },
          {
            text: 'Uložit Emergency Kit',
            hint: 'Bez Emergency Kitu se při ztrátě hesla k účtu nikdo nedostane.',
            how: [
              'Po registraci 1Password automaticky nabídne stažení Emergency Kitu (PDF se Secret Key).',
              'PDF uložit mimo firemní disk (osobní úložiště) a ideálně vytisknout.',
              'Vysvětli: Secret Key + Master Password = jediná cesta k obnově účtu.',
            ],
          },
          {
            text: 'Projít vaulty a sdílené přístupy',
            how: [
              'Ukaž rozdíl: „Private" vault (osobní) vs. sdílené firemní vaulty.',
              'Projděte, co ve sdílených vaultech najde: Canva, Figma, ChatGPT, CapCut, Webflow, Google Analytics…',
              'Pravidlo: každé nové firemní heslo se ukládá do správného sdíleného vaultu, ne do Private.',
            ],
          },
          {
            text: 'Nainstalovat aplikaci + rozšíření do prohlížeče',
            how: [
              'Stáhnout desktopovou appku z 1password.com/downloads.',
              'Přidat rozšíření do prohlížeče (Chrome Web Store → „1Password") — vyplňuje hesla automaticky.',
              'Stáhnout mobilní appku (App Store / Google Play) a přihlásit se naskenováním Setup kódu z Emergency Kitu.',
            ],
          },
        ],
      },
      {
        id: 'on-slack',
        title: 'Slack',
        desc: 'Vyplňte profil a projděte kanály — kde se řeší co a jak u nás komunikujeme.',
        items: [
          {
            text: 'Vyplnit profil',
            how: [
              'Klikni na svou fotku vpravo nahoře → „Profile" → „Edit profile".',
              'Vyplň: celé jméno, přezdívku (display name), pozici, telefon a nahraj fotku.',
            ],
          },
          {
            text: 'Seznámení s kanály',
            how: [
              'Projděte společně hlavní kanály: co kam patří (obecné, tým, klienti, random…).',
              'Ukaž, jak si přidat kanál: „+ Add channels" → „Browse channels".',
              'Vysvětli zvyklosti: vlákna (threads), @zmínky, emoji reakce místo „ok" zpráv.',
            ],
          },
          {
            text: 'Stáhnout appku do telefonu',
            how: ['App Store / Google Play → „Slack" → přihlásit se přes firemní Gmail (SSO).'],
          },
        ],
      },
      {
        id: 'on-asana-costlocker',
        title: 'Asana & Costlocker',
        desc: 'Zaškolení vede teamleader — zadávání a přebírání tasků v Asaně, vykazování v Costlockeru.',
        items: ['Asana — zaškolení teamleaderem + appka do telefonu', 'Costlocker — zaškolení teamleaderem'],
      },
      {
        id: 'on-dochazka',
        title: 'Docházka & fakturace',
        desc: 'Projdi proces docházky a fakturace a doplň počet dní dovolené do systému.',
        items: ['Zaškolení docházky', 'Zaškolení fakturace', 'Seznámení s procesem', 'Doplnit počet dní dovolené'],
      },
      {
        id: 'on-settleup',
        title: 'SettleUp',
        desc: 'Nasdílej link / QR kód do společné skupiny na drobné výdaje.',
      },
      {
        id: 'on-prostory',
        title: 'Prostory a interní procesy',
        desc: 'Provedení po kanclu a projití běžných procesů — ať se nový člen cítí jako doma.',
        items: [
          'Kuchyňka — jídlo, myčka, pořádek',
          'Meetingovky — káva & občerstvení pro klienty, pořádek',
          'Toalety — seznámení s procesem',
          'Jsem první v kanclu — odkódovat, odemknout, zkontrolovat okna',
          'Jsem poslední — vypnout klimatizace, zamknout, zakódovat',
          'BOZP + únikové východy',
        ],
      },
    ],
  },
  {
    id: 'on-zkusebka',
    title: 'Zkušební doba',
    timing: 'Průběžně během zkušební doby',
    steps: [
      {
        id: 'on-cile',
        title: 'Stanovit cíle zkušební doby',
        desc: 'Společně s teamleaderem stanov konkrétní cíle, podle kterých se na konci zkušebky vyhodnotí spolupráce.',
      },
      {
        id: 'on-11',
        title: 'Zaplánovat pravidelné 1:1',
        desc: 'Zaplánuj do kalendáře pravidelná 1:1 setkání po dobu zkušební doby.',
      },
      {
        id: 'on-feedback',
        title: 'Zpětná vazba',
        desc: 'Sesbírej zpětnou vazbu od týmu i od vedení/teamleadera a nasdílej ji novému členovi. Získej i jeho pohled.',
        items: ['Od týmu', 'Od vedení / teamleadera', 'Nasdílení zpětné vazby', 'Získání zpětné vazby od nováčka'],
      },
    ],
  },
]

export const OFFBOARDING_PHASES: GuidePhase[] = [
  {
    id: 'off-vypoved',
    title: 'Výpověď',
    timing: 'Ihned po oznámení',
    steps: [
      {
        id: 'off-info-tym',
        title: 'Obeznámit Four Bros tým',
        desc: 'Informuj tým, že spolupráce s danou osobou končí k danému dni.',
      },
      {
        id: 'off-nabor',
        title: 'Spustit nábor',
        desc: 'Začni řešit nábor a nové výběrové řízení jako náhradu za odcházejícího člena.',
      },
      {
        id: 'off-smlouvy',
        title: 'Smlouvy a protokoly',
        desc: 'Připrav dokumenty k ukončení spolupráce.',
        items: ['Podpis dohody o ukončení spolupráce', 'Podpis dohody o ukončení nájmu kancelářského místa', 'Připravit předávací protokol'],
      },
      {
        id: 'off-dovolena',
        title: 'Dovolená',
        desc: 'Vypočítej zbývající dovolenou a domluv se na jejím vyčerpání do konce spolupráce.',
        items: ['Vypočítat zbývající dovolenou', 'Informovat o vyčerpání dovolené'],
      },
    ],
  },
  {
    id: 'off-7dni',
    title: 'Předání práce',
    timing: '7 dní do ukončení',
    steps: [
      {
        id: 'off-klienti',
        title: 'Obeznámit klienty',
        desc: 'Informuj klienty, že spolupráce s danou osobou končí k danému dni, a představ jim, kdo je přebírá.',
      },
      {
        id: 'off-disk',
        title: 'Google Disk',
        desc: 'Vyčisti Disk a přesuň osobní soubory tam, kam patří — ať se nic neztratí.',
        items: ['Vyčistit', 'Přesun osobních souborů'],
      },
      {
        id: 'off-kalendar',
        title: 'Kalendář',
        desc: 'Předej vytvořené meetingy a uvolni kalendář.',
        items: ['Změnit organizátora vytvořených meetingů', 'Vyčistit kalendář'],
      },
      {
        id: 'off-asana',
        title: 'Asana',
        desc: 'Předej všechny tasky na zodpovědné osoby — nic nesmí zůstat viset bez majitele.',
      },
      {
        id: 'off-1password',
        title: '1Password',
        desc: 'Osobní hesla si osoba převede na svůj soukromý 1Password účet (návod: support.1password.com/offboarding).',
      },
    ],
  },
  {
    id: 'off-posledniden',
    title: 'Poslední den',
    timing: 'Poslední den před ukončením',
    steps: [
      {
        id: 'off-pristupy',
        title: 'Odebrat všechny přístupy',
        desc: 'Projdi nástroj po nástroji a odeber / přesměruj přístupy.',
        items: [
          'Google Workspace — odebrání přístupů',
          'Gmail — přesměrování e-mailu',
          'Změna hesla k účtu fourbroshost@gmail.com',
          'Odstranění z FB Business Manageru',
          'Změna hesla ke vzdělávacím programům',
          'Costlocker — zablokování účtu',
          'Asana — odebrání přístupů',
          'Slack — odebrání přístupů',
          '1Password — odebrání přístupů',
          'Smazání účtů u ostatních platforem',
        ],
      },
      {
        id: 'off-odevzdani',
        title: 'Odevzdání vybavení',
        desc: 'Převezmi klíče, čip a elektroniku a nech podepsat předávací protokol.',
        items: ['Odevzdání klíčů, čipu a elektroniky', 'Podepsat předávací protokol', 'Připravit si a odnést osobní věci'],
      },
      {
        id: 'off-rozlouceni',
        title: 'Rozloučení',
        desc: 'Rozluč se hezky — poděkování a květina. Odchod ve zlém nikomu nic nepřinese.',
      },
    ],
  },
  {
    id: 'off-post',
    title: 'Post offboarding',
    timing: 'Po ukončení spolupráce',
    steps: [
      {
        id: 'off-reference',
        title: 'Zajistit referenci',
        desc: 'Vedení / teamleader připraví referenci pro odcházejícího člena.',
      },
      {
        id: 'off-pomoc',
        title: 'Nabídnout pomoc',
        desc: 'Nabídni pomoc s průběhem pohovoru u nového zaměstnavatele a s vylepšením CV.',
      },
    ],
  },
]
