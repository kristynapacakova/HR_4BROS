# 1 · Identita, přihlášení a oprávnění

Nejdůležitější kapitola pro napojení. Role a typ spolupráce jsou **dvě nezávislé osy**:
- **role**: `ADMIN` (= HR), `TL` (team lead), `EMPLOYEE`
- **typ spolupráce**: `HPP`, `DPP`, `DPC` (DPČ), `ICO` (OSVČ), `STAZ` (stáž)

## 1.1 Jeden člověk = tři různá ID (dnes)

| Prostor | Příklad | Kde se používá |
|---|---|---|
| **Přihlašovací (persona) id** | `demo-employee-1` (Jan, HPP), `demo-employee-ico-1` (Tomáš, OSVČ), `demo-tl-1` (Eva, TL), `demo-admin-1` (Petra, HR) | přihlášení (`session.user.id`), doklady, sport, vzdělávání, benefity, faktury OSVČ, majetek, část potvrzení směrnic |
| **Id člověka v týmu** | `t1`…`t16` | `teamLeadId`, fotky a medailonek, přezdívka, BOZP, přehled plnění, přiřazení majetku v adminu, Tým |
| **Jméno jako text** | „Jan Novák“ | absence a dovolená, smlouvy (`employeeName`), archiv PDF |

Převody: e-mail → člověk (`demoTeamIdFor`), persona → e-mail (`PERSONA_EMAIL_BY_ID`), `personForLogin` v `src/lib/hr/source.ts`.

**Důsledky dnes** (viz [chyby](07-chyby-a-nesoulady.md)): majetek přiřazený v adminu člověk nevidí, admin benefitů a vzdělávání nevidí data lidí, TL a OSVČ na některých stránkách vidí Janova data.

**V databázi:** jedna tabulka `Person` s jedním ID. Přihlašovací účet (Google) navázat 1:1 na `Person.id` přes e-mail. Persona id a vazby přes jméno zrušit.

## 1.2 Přihlášení (`src/lib/auth.ts`, `src/app/login/page.tsx`)
- Dnes: přihlášení jen e-mailem **bez hesla**. 4 pevné účty; **jakýkoli jiný e-mail se přihlásí jako Jan** (i mimo doménu).
- „Přihlásit přes Google“ je simulace výběru účtu. Text „Přístup mají jen uživatelé Four Bros“ se **nevynucuje**.
- Role se zapíše do přihlašovacího tokenu při přihlášení (změna role v adminu se neprojeví).
- Text slibuje relaci 12 hodin, reálně platí výchozích 30 dní.
- Přepínač demo rolí v hlavičce (`RoleSwitcher`) — **v produkci odstranit**.
- Middleware hlídá jen přihlášení, ne roli. Nepřihlášený → `/login`.

**K rozhodnutí:** Google Workspace přihlášení s omezením na doménu `fourbros.cz`, mapování na `Person` podle e-mailu, lidé bez záznamu → odmítnout, délka relace, role číst z DB při každém požadavku.

## 1.3 Menu (`src/components/layout/Sidebar.tsx`)
- **Všichni:** Dashboard, Můj účet, Schránka důvěry, Interní směrnice, Tým Four Bros.
- **HR navíc (Administrace):** Admin panel, Přehled plnění, Smlouvy, Správa směrnic, Schránka důvěry (zprávy), Přehled odměn.
- **TL navíc (Tým):** Docházka firmy, Fakturace týmu.
- OSVČ nemá vlastní položky.
- ⚠️ Mimo menu (jen přímou adresou): `/admin/leave-requests`, `/admin/leave-calendar` (pro HR), `/admin/benefity`, `/admin/vzdelavani`, `/documents`, `/payslips`, `/time-off`.

## 1.4 Matice oprávnění — stránky

Legenda: ✅ plný přístup · 👁 jen čtení · 🔒 jen vlastní data · ➖ nedostupné · ⚠️ nesoulad

| Stránka | HR | TL | Zaměstnanec | OSVČ |
|---|---|---|---|---|
| Dashboard | ✅ + HR úkoly + správa akcí | ✅ + úkol „Schval doklady“ ⚠️ (nemá kde) | ✅ | ✅ (termín faktury místo výplaty) |
| Můj účet | 🔒 + blok HR údajů (jen vlastní) | 🔒 | 🔒 | 🔒 bez bankovního účtu a bez bloku BOZP ⚠️ |
| Můj účet → Dokumenty | 🔒 výplatní pásky jen HPP | 🔒 | 🔒 (DPP/DPČ bez pásek) | 🔒 bez pásek |
| Tým, medailonek kolegy | 👁 všech, upravuje jen svůj | ← | ← | ← |
| Schránka důvěry, Směrnice, Pravidla | ✅ | ✅ | ✅ | ✅ |
| Admin panel (Analytika, Uživatelé, Majetek) | ✅ | ➖ | ➖ | ➖ |
| Přehled plnění, Smlouvy, Správa směrnic, Schránka (zprávy), Přehled odměn, Benefity, Vzdělávání | ✅ | ➖ | ➖ | ➖ |
| Žádosti o dovolenou | ✅ všechny | 🔒 jen svého týmu ⚠️ (API TL zakazuje) | ➖ | ➖ |
| Docházka firmy (kalendář) | ✅ úpravy ⚠️ není v menu | 👁 **celá firma** (záměr?) | ➖ | ➖ |
| Fakturace týmu | ➖ ⚠️ | ✅ jen OSVČ svého týmu | ➖ | ➖ |

## 1.5 Matice oprávnění — akce

| Akce | HR | TL | Zaměstnanec | OSVČ |
|---|---|---|---|---|
| Upravit vlastní kontakt, adresu, nouzový kontakt | ano (dnes se neukládá) | ← | ← | ← bez bank. účtu |
| Přezdívka, narozeniny, fotka, medailonek | vlastní | vlastní | vlastní | vlastní |
| Upravit medailonek jiného | ➖ | ➖ | ➖ | ➖ |
| Vidět mzdy, hodiny, efektivitu ostatních | ✅ | ➖ | ➖ | ➖ |
| Založit člověka, změnit roli, přiřadit TL, IČO/nájem/nárok dovolené | ✅ (dnes jen v prohlížeči, ⚠️ bez efektu) | ➖ | ➖ | ➖ |
| Majetek — správa | ✅ | ➖ | ➖ | ➖ |
| Majetek — vidět vlastní | ✅ | ✅ | ✅ | ✅ |
| Schválit doklad k proplacení | ✅ | ⚠️ rozhodnout | ➖ | ➖ |
| Navrhnout prémii/srážku nebo změnu odměny OSVČ | ➖ | ✅ svůj tým | ➖ | ➖ |
| Schválit návrh TL | ✅ | ➖ | ➖ | ➖ |
| Stav úhrady faktury | ✅ | ⚠️ dnes může taky | ➖ | ➖ |
| Smlouvy — vytvořit, odeslat, podepsat za firmu | ✅ (⚠️ rozhodnout, kdo podepisuje za firmu) | ➖ | ➖ | ➖ |
| Smlouvy — podepsat vlastní | ✅ | ✅ | ✅ | ✅ |
| Směrnice — vydat | ✅ | ➖ | ➖ | ➖ |
| Směrnice — potvrdit | ✅ | ✅ | ✅ | ✅ |
| Schránka důvěry — poslat | ✅ | ✅ | ✅ | ✅ |
| Schránka důvěry — číst a odpovídat | ✅ (⚠️ text slibuje „jen HR, ne admin bez HR role“) | ➖ | ➖ | ➖ |
| Firemní akce, napojení Google Kalendáře | ✅ | ➖ | ➖ | ➖ |
| Schválit dovolenou | ✅ | ✅ svůj tým (UI) | ➖ | ➖ |
| Termíny faktur a výplat | ✅ | ➖ | ➖ | ➖ |

## 1.6 Rozhodnutí do databáze
- Oprávnění vynucovat **na serveru při každém zápisu**, ne jen skrytím stránky (dnes kdokoli může v prohlížeči přepsat cokoli).
- „Tým“ team leada = lidé s `teamLeadId = TL` (ne oddělení). Kontrolovat cykly.
- Samostatné oprávnění pro čtení schránky důvěry, pokud má platit „jen HR“.
- Kdo podepisuje smlouvy za firmu (jednatel vs. HR).
