// Demo mock data — no database required

// ── Team Leave Calendar ────────────────────────────────────────────────────

// DEMO_TEAM_LEAVES je odvozený z DEMO_TEAM — viz konec souboru.

// ── Analytics ──────────────────────────────────────────────────────────────

// ── HR Dashboard Stats ─────────────────────────────────────────────────────

// DEMO_HR_STATS, DEMO_HEADCOUNT_TREND, DEMO_FLUCTUATION, DEMO_DEPARTMENT_HEADCOUNT,
// DEMO_EMPLOYEE_PERFORMANCE, DEMO_TURNOVER_RATE a DEMO_AVG_TENURE se počítají z DEMO_TEAM — viz konec souboru.

export const DEMO_OPEN_POSITIONS = 3

// ── General Tasks (all employees) ─────────────────────────────────────────

export const DEMO_TASKS = [
  { id: "task1", title: "Vyplnit osobní údaje", category: "ONBOARDING", completed: true,  dueDate: null },
  { id: "task2", title: "Podepsat pracovní smlouvu", category: "ONBOARDING", completed: true,  dueDate: null },
  { id: "task3", title: "Nahrát kopii občanského průkazu", category: "ONBOARDING", completed: false, dueDate: new Date("2026-06-15") },
  { id: "task4", title: "Nastavit bankovní účet pro výplatu", category: "ONBOARDING", completed: false, dueDate: new Date("2026-06-15") },
  { id: "task5", title: "Absolvovat BOZP školení", category: "ONBOARDING", completed: false, dueDate: new Date("2026-06-30") },
  { id: "task6", title: "Vyplnit roční hodnotící formulář", category: "HR", completed: false, dueDate: new Date("2026-06-20") },
  { id: "task7", title: "Aktualizovat nouzový kontakt", category: "HR", completed: false, dueDate: null },
]

// ── Expense / Reimbursement Requests ──────────────────────────────────────
// Zaměstnanec/OSVČ nahraje doklad (oběd s klientem, taxi apod.), HR schválí,
// po schválení se částka přičte k odměně/faktuře za daný měsíc.
// (DEMO_EXPENSE_REQUESTS is defined further below, after DEMO_USER/DEMO_USER_ICO.)

export interface ExpenseRequest {
  id: string
  employeeId: string
  employeeName: string
  title: string
  amount: number
  /** PLUS = chce si nechat proplatit (přičte se), MINUS = chce si nechat strhnout z faktury (odečte se) */
  sign: 'PLUS' | 'MINUS'
  currency: string
  category: string
  receiptName: string
  month: number
  year: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  seenByEmployee?: boolean
}

export const EXPENSE_CATEGORIES = [
  { value: "SPORT", label: "Benefit — příspěvek na sport" },
  { value: "REPREZENTACE", label: "Náklad ke klientovi (oběd, kafe…)" },
  { value: "CESTOVNÉ", label: "Cestovné" },
  { value: "VZDĚLÁVÁNÍ", label: "Vzdělávání" },
  { value: "JINE", label: "Jiné" },
]

// ── Salary Raise Info ─────────────────────────────────────────────────────


// ── Trust Mailbox ──────────────────────────────────────────────────────────

export const FEEDBACK_CATEGORIES = [
  { value: "PRACOVNI_PODMINKY", label: "Pracovní podmínky" },
  { value: "VZTAHY",            label: "Vztahy na pracovišti" },
  { value: "ODMENOVÁNÍ",        label: "Odměňování a benefity" },
  { value: "VEDENI",            label: "Vedení a management" },
  { value: "PROCESY",           label: "Procesy a organizace" },
  { value: "NAVRH",             label: "Návrh na zlepšení" },
  { value: "POCHVALA",          label: "Pochvala" },
  { value: "JINE",              label: "Jiné" },
]

export const DEMO_FEEDBACK = [
  {
    id: "fb1",
    anonymous: true,
    authorName: null,
    category: "PRACOVNI_PODMINKY",
    message: "Bylo by fajn mít v kanceláři lepší klimatizaci. V létě je tam nesnesitelné vedro a produktivita opravdu trpí.",
    status: "NEW",
    submittedAt: new Date("2026-05-28"),
    adminNote: null,
  },
  {
    id: "fb2",
    anonymous: false,
    authorName: "Jan Novák",
    category: "NAVRH",
    message: "Navrhuji zavést týdenní stand-up napříč odděleními, abychom věděli co dělají ostatní týmy. Pomohlo by to spolupráci.",
    status: "READ",
    submittedAt: new Date("2026-05-15"),
    adminNote: "Díky za podnět, probereme na příštím all-hands meetingu.",
  },
  {
    id: "fb3",
    anonymous: true,
    authorName: null,
    category: "VEDENI",
    message: "Někdy chybí zpětná vazba od vedení na odvedenou práci. Bylo by motivující slyšet, jak si vedu.",
    status: "NEW",
    submittedAt: new Date("2026-06-01"),
    adminNote: null,
  },
  {
    id: "fb4",
    anonymous: false,
    authorName: "Marie Svobodová",
    category: "POCHVALA",
    message: "Chci pochválit HR tým za skvělé zvládnutí onboardingu nových kolegů. Bylo to opravdu profesionální!",
    status: "RESOLVED",
    submittedAt: new Date("2026-04-20"),
    adminNote: "Moc děkujeme! 😊",
  },
]

export const ASSET_TYPES = [
  { value: "NOTEBOOK", label: "Notebook" },
  { value: "TELEFON", label: "Telefon" },
  { value: "MYS", label: "Myš" },
  { value: "KLAVESNICE", label: "Klávesnice" },
  { value: "MONITOR", label: "Monitor" },
  { value: "NABIJEC", label: "Nabíječka" },
  { value: "SLUCHATKA", label: "Sluchátka" },
  { value: "JINE", label: "Jiné" },
]

export const ASSET_CONDITIONS = [
  { value: "NOVY", label: "Nový" },
  { value: "DOBRY", label: "Dobrý" },
  { value: "OPOTREBOVANY", label: "Opotřebovaný" },
  { value: "POSKOZENY", label: "Poškozený" },
]

export const DEMO_ASSETS = [
  { id: "a1", name: "MacBook Pro 14\"", type: "NOTEBOOK", brand: "Apple", model: "MacBook Pro M3", serialNumber: "C02X1234", assignedTo: "demo-employee-1", assignedAt: new Date("2024-01-15"), condition: "DOBRY", notes: null },
  { id: "a2", name: "iPhone 14 Pro", type: "TELEFON", brand: "Apple", model: "iPhone 14 Pro 256GB", serialNumber: "DNPXYZ123", assignedTo: "demo-employee-1", assignedAt: new Date("2024-01-15"), condition: "DOBRY", notes: null },
  { id: "a3", name: "Magic Mouse", type: "MYS", brand: "Apple", model: "Magic Mouse 3", serialNumber: null, assignedTo: "demo-employee-1", assignedAt: new Date("2024-01-15"), condition: "DOBRY", notes: null },
  { id: "a4", name: "LG UltraWide 27\"", type: "MONITOR", brand: "LG", model: "27UK850-W", serialNumber: "LG2024001", assignedTo: "demo-employee-1", assignedAt: new Date("2024-02-01"), condition: "DOBRY", notes: "Druhý monitor" },
  { id: "a5", name: "Dell XPS 15", type: "NOTEBOOK", brand: "Dell", model: "XPS 15 9530", serialNumber: "DXPS123456", assignedTo: "demo-employee-2", assignedAt: new Date("2023-06-01"), condition: "DOBRY", notes: null },
  { id: "a6", name: "Samsung Galaxy S23", type: "TELEFON", brand: "Samsung", model: "Galaxy S23", serialNumber: "R5CR123456", assignedTo: "demo-employee-2", assignedAt: new Date("2023-06-01"), condition: "DOBRY", notes: null },
  { id: "a7", name: "ThinkPad X1 Carbon", type: "NOTEBOOK", brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 11", serialNumber: "PF3ABC123", assignedTo: "demo-employee-3", assignedAt: new Date("2022-03-15"), condition: "DOBRY", notes: null },
  { id: "a8", name: "Logitech MX Keys", type: "KLAVESNICE", brand: "Logitech", model: "MX Keys Advanced", serialNumber: null, assignedTo: null, assignedAt: null, condition: "NOVY", notes: "Skladem" },
  { id: "a9", name: "Dell Monitor 24\"", type: "MONITOR", brand: "Dell", model: "P2422H", serialNumber: "CN123456", assignedTo: null, assignedAt: null, condition: "NOVY", notes: "Skladem" },
  { id: "a10", name: "Sony WH-1000XM5", type: "SLUCHATKA", brand: "Sony", model: "WH-1000XM5", serialNumber: null, assignedTo: null, assignedAt: null, condition: "NOVY", notes: "Skladem" },
]

export const EMPLOYMENT_TYPES = [
  { value: "HPP", label: "HPP – Hlavní pracovní poměr" },
  { value: "DPP", label: "DPP – Dohoda o provedení práce" },
  { value: "DPC", label: "DPČ – Dohoda o pracovní činnosti" },
  { value: "ICO", label: "IČO" },
  { value: "STAZ", label: "Stáž" },
]

export const SENIORITY_LEVELS = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MEDIOR', label: 'Medior' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD',   label: 'Lead' },
]

export const DEMO_USER = {
  id: "demo-employee-1",
  email: "jan.novak@fourbros.cz",
  name: "Jan Novák",
  role: "EMPLOYEE",
  department: "Creative",
  position: "Frontend Developer",
  employmentType: "HPP",
  startDate: new Date("2024-01-15"),
  phone: "+420 777 123 456",
  address: "Náměstí Míru 1",
  city: "Praha",
  country: "CZ",
  birthDate: new Date("1990-05-20"),
  bankAccount: "1234567890/0800",
  taxId: "123456789",
  // HR fields
  seniority: "MEDIOR",
  monthlyHours: 168,
  clientHours: 120,
  monthlySalary: 70000,
  hourlyRate: null as number | null,
  contractTermType: "URCITA" as "URCITA" | "NEURCITA",
  contractEndDate: new Date("2027-01-31") as Date | null,
}

export const DEMO_ADMIN = {
  id: "demo-admin-1",
  email: "admin@fourbros.cz",
  name: "Petra Nováková",
  role: "ADMIN",
  department: "Head office",
  position: "HR Manager",
  employmentType: "HPP",
  startDate: new Date("2022-01-01"),
  phone: "+420 777 999 000",
  address: "Vinohradská 10",
  city: "Praha",
  country: "CZ",
  birthDate: null,
  bankAccount: null,
  taxId: null,
  contractTermType: "NEURCITA" as "URCITA" | "NEURCITA",
  contractEndDate: null as Date | null,
}

// Team lead — vidí a schvaluje jen svůj tým (oddělení Vývoj)
export const DEMO_TL = {
  id: "demo-tl-1",
  email: "eva.horakova@fourbros.cz",
  name: "Eva Horáková",
  role: "TL",
  department: "Creative",
  position: "Team Lead — Vývoj",
  employmentType: "HPP",
  startDate: new Date("2021-04-01"),
  phone: "+420 777 456 789",
  address: "Korunní 40",
  city: "Praha",
  country: "CZ",
  birthDate: new Date("1987-11-02"),
  bankAccount: "9876543210/0800",
  taxId: "987654321",
  seniority: "LEAD",
  monthlyHours: 168,
  clientHours: 100,
  monthlySalary: 85000,
  hourlyRate: null as number | null,
  contractTermType: "NEURCITA" as "URCITA" | "NEURCITA",
  contractEndDate: null as Date | null,
}

// OSVČ (IČO) demo účet — pro ukázku pohledu spolupracovníka na fakturu
export const DEMO_USER_ICO = {
  id: "demo-employee-ico-1",
  email: "tomas.dvorak@fourbros.cz",
  name: "Tomáš Dvořák",
  role: "EMPLOYEE",
  department: "Account manager",
  position: "Account Manager",
  employmentType: "ICO",
  startDate: new Date("2022-03-15"),
  phone: "+420 777 321 654",
  address: "Milady Horákové 12",
  city: "Praha",
  country: "CZ",
  birthDate: new Date("1985-07-22"),
  bankAccount: "5647382910/0800",
  taxId: "192837465",
  seniority: "SENIOR",
  monthlyHours: 140,
  clientHours: 110,
  monthlySalary: null as number | null,
  hourlyRate: 450,
  contractTermType: "NEURCITA" as "URCITA" | "NEURCITA",
  contractEndDate: null as Date | null,
  icoNumber: "01234567",
  officeAmount: 1500,
  refreshAmount: 300,
  annualLeaveDays: 25,
}

export const DEMO_EXPENSE_REQUESTS: ExpenseRequest[] = [
  { id: "exp1", employeeId: DEMO_USER.id, employeeName: DEMO_USER.name, title: "Taxi na klientské jednání", amount: 350, sign: "PLUS", currency: "CZK", category: "CESTOVNÉ", receiptName: "uctenka_taxi.pdf", month: 8, year: 2026, status: "PENDING", requestedAt: "2026-08-20" },
  { id: "exp2", employeeId: DEMO_USER_ICO.id, employeeName: DEMO_USER_ICO.name, title: "Oběd s klientem", amount: 890, sign: "PLUS", currency: "CZK", category: "REPREZENTACE", receiptName: "uctenka_obed.jpg", month: 7, year: 2026, status: "APPROVED", requestedAt: "2026-07-20" },
]

// Resolves which demo user record a logged-in session maps to, by id.
export function getDemoUserById(id: string) {
  if (id === DEMO_ADMIN.id) return DEMO_ADMIN
  if (id === DEMO_TL.id) return DEMO_TL
  if (id === DEMO_USER_ICO.id) return DEMO_USER_ICO
  return DEMO_USER
}

// ── Vzdělávací budget ──────────────────────────────────────────────────────
// Roční částka na kurzy/knihy/konference, kterou nastavuje HR/admin za osobu.
// Žádost podá zaměstnanec nebo OSVČ, po schválení HR se odečte z budgetu.

export const DEMO_EDU_BUDGETS: Record<string, number> = {
  [DEMO_USER.id]: 10000,
  [DEMO_USER_ICO.id]: 8000,
  [DEMO_TL.id]: 12000,
  [DEMO_ADMIN.id]: 12000,
  "demo-employee-2": 8000,
  "demo-employee-3": 8000,
}
export const DEFAULT_EDU_BUDGET = 10000

export interface EduRequest {
  id: string
  employeeId: string
  employeeName: string
  title: string
  amount: number
  url?: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
  note?: string | null
}

export const DEMO_EDU_REQUESTS: EduRequest[] = [
  { id: "edu1", employeeId: DEMO_USER.id, employeeName: DEMO_USER.name, title: "Kniha: Refactoring UI", amount: 1290, status: "APPROVED", requestedAt: "2026-03-12" },
  { id: "edu2", employeeId: DEMO_USER.id, employeeName: DEMO_USER.name, title: "Kurz: Copywriting Akademie", amount: 3490, status: "APPROVED", requestedAt: "2026-05-28" },
  { id: "edu3", employeeId: DEMO_USER.id, employeeName: DEMO_USER.name, title: "Konference React Summit", amount: 4500, url: "https://reactsummit.cz", status: "PENDING", requestedAt: "2026-08-10" },
  { id: "edu4", employeeId: DEMO_USER_ICO.id, employeeName: DEMO_USER_ICO.name, title: "Kurz: Vyjednávání s klienty", amount: 2900, url: "https://akademie.cz/vyjednavani", status: "PENDING", requestedAt: "2026-08-05" },
]

// ── Sportovní benefit ───────────────────────────────────────────────────────
// HR nastaví každému člověku buď Multisport kartu, nebo příspěvek na sport.
// Příspěvek na sport (600 Kč/měsíc) žádá zaměstnanec/OSVČ s dokladem, HR schvaluje.
// Multisport u zaměstnanců se strhává ze mzdy standardně (mimo appku).
// Multisport u OSVČ: firma přispívá 600 Kč, zbytek ceny karty se odečte z odměny za daný měsíc.

export type BenefitType = 'MULTISPORT' | 'SPORT_CONTRIBUTION'

export const SPORT_CONTRIBUTION_AMOUNT = 600
export const MULTISPORT_MONTHLY_COST = 990

export const DEMO_BENEFIT_SELECTION: Record<string, BenefitType> = {
  [DEMO_USER.id]: 'MULTISPORT',
  [DEMO_USER_ICO.id]: 'MULTISPORT',
  [DEMO_TL.id]: 'SPORT_CONTRIBUTION',
}

export interface SportBenefitRequest {
  id: string
  employeeId: string
  employeeName: string
  month: number
  year: number
  receiptName: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

export const DEMO_SPORT_REQUESTS: SportBenefitRequest[] = [
  { id: "sport1", employeeId: DEMO_TL.id, employeeName: DEMO_TL.name, month: 7, year: 2026, receiptName: "doklad_fitness_cerven.pdf", status: "APPROVED", requestedAt: "2026-07-03" },
  { id: "sport2", employeeId: DEMO_TL.id, employeeName: DEMO_TL.name, month: 8, year: 2026, receiptName: "doklad_fitness_srpen.pdf", status: "PENDING", requestedAt: "2026-08-04" },
]

// ── Team directory ──────────────────────────────────────────────────────────

export const TEAM_DEPARTMENTS = [
  'Head office', 'Account manager', 'Creative', 'Performance',
]

export interface PersonRecord {
  id: string; name: string; email: string; position: string; department: string
  seniority: string | null; employmentType: string; birthday: string | null
  bio: string | null; emoji: string; teamLeadId: string | null
  role: "ADMIN" | "TL" | "EMPLOYEE"
  startDate: Date
  monthlyHours: number | null
  clientHours: number | null
  monthlySalary: number | null
  hourlyRate: number | null
  /** Jen u OSVČ — IČO a měsíční položky, které se liší člověk od člověka. */
  icoNumber: string | null
  officeAmount: number | null
  refreshAmount: number | null
  /** Nárok na placenou dovolenou za rok — u OSVČ typicky null (nejsou zaměstnanci). */
  annualLeaveDays: number | null
  contractTermType: "URCITA" | "NEURCITA"
  contractEndDate: Date | null
}

export const DEMO_TEAM: PersonRecord[] = [
  { id: "t1",  name: "Petra Nováková",    email: DEMO_ADMIN.email,     position: "HR Manager",           department: "Head office",          seniority: "SENIOR", employmentType: "HPP", birthday: "1988-03-15", bio: "Mám ráda lidi, kávu a pořádek.", emoji: "🌿", teamLeadId: null, role: "ADMIN", startDate: new Date("2022-01-01"), monthlyHours: 160, clientHours: null, monthlySalary: 58000, hourlyRate: null, icoNumber: null, officeAmount: null, refreshAmount: null, annualLeaveDays: 25, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t2",  name: "Jan Novák",          email: DEMO_USER.email,      position: "Frontend Developer",   department: "Creative",    seniority: "MEDIOR", employmentType: "HPP", birthday: "1990-05-20", bio: "React, TypeScript a dobrý coffee.", emoji: "💻", teamLeadId: "t16", role: "EMPLOYEE", startDate: new Date("2024-01-15"), monthlyHours: 168, clientHours: 120, monthlySalary: 70000, hourlyRate: null, icoNumber: null, officeAmount: null, refreshAmount: null, annualLeaveDays: 25, contractTermType: "URCITA", contractEndDate: new Date("2027-01-31") },
  { id: "t3",  name: "Marie Svobodová",    email: "marie.svobodova@fourbros.cz", position: "Social Media Manager", department: "Performance", seniority: "JUNIOR", employmentType: "DPP", birthday: "1997-11-03", bio: "Tvořím obsah, který lidi zastaví při scrollování.", emoji: "📱", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2023-06-01"), monthlyHours: 80, clientHours: 60, monthlySalary: 28000, hourlyRate: null, icoNumber: null, officeAmount: null, refreshAmount: null, annualLeaveDays: 20, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t4",  name: "Tomáš Dvořák",       email: DEMO_USER_ICO.email,  position: "Account Manager",      department: "Account manager",     seniority: "SENIOR", employmentType: "ICO", birthday: "1985-07-22", bio: "Klienti jsou základ. Rád řeším výzvy.", emoji: "🤝", teamLeadId: "t16", role: "EMPLOYEE", startDate: new Date("2022-03-15"), monthlyHours: 140, clientHours: 110, monthlySalary: null, hourlyRate: 450, icoNumber: "01234567", officeAmount: 1500, refreshAmount: 300, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t5",  name: "Lucie Kratochvílová",email: "lucie.kratochvilova@fourbros.cz", position: "Art Director",         department: "Creative",    seniority: "SENIOR", employmentType: "ICO", birthday: "1991-02-08", bio: "Vizuál je moje řeč. Pixely jsou moji přátelé.", emoji: "🎨", teamLeadId: "t16", role: "EMPLOYEE", startDate: new Date("2021-09-01"), monthlyHours: 150, clientHours: 120, monthlySalary: null, hourlyRate: 500, icoNumber: "87654321", officeAmount: 1500, refreshAmount: 300, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t6",  name: "Ondřej Mašek",       email: "ondrej.masek@fourbros.cz", position: "Performance Specialist",department:"Performance", seniority: "MEDIOR", employmentType: "ICO", birthday: "1993-09-14", bio: "PPC, data a ROAS. Čísla mě baví.", emoji: "📊", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2022-11-01"), monthlyHours: 150, clientHours: 115, monthlySalary: null, hourlyRate: 420, icoNumber: "11223344", officeAmount: 1200, refreshAmount: 250, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t7",  name: "Klára Horáková",     email: "klara.horakova@fourbros.cz", position: "Copywriter",           department: "Creative",    seniority: "JUNIOR", employmentType: "ICO", birthday: "1999-04-01", bio: "Slova jsou moje superschopnost.", emoji: "✍️", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2023-08-01"), monthlyHours: 140, clientHours: 100, monthlySalary: null, hourlyRate: 380, icoNumber: "22334455", officeAmount: 1200, refreshAmount: 250, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t8",  name: "Martin Beneš",       email: "martin.benes@fourbros.cz", position: "Sales Manager",        department: "Head office",       seniority: "SENIOR", employmentType: "ICO", birthday: "1984-12-19", bio: "Obchod mi jde přirozeně. Rád poznávám nové lidi.", emoji: "🚀", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2019-05-01"), monthlyHours: 160, clientHours: 130, monthlySalary: null, hourlyRate: 550, icoNumber: "33445566", officeAmount: 1800, refreshAmount: 400, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t9",  name: "Veronika Jelínková", email: "veronika.jelinkova@fourbros.cz", position: "Project Manager",      department: "Account manager",     seniority: "MEDIOR", employmentType: "ICO", birthday: "1994-06-30", bio: "Deadline je pro mě výzva, ne hrozba.", emoji: "📋", teamLeadId: "t16", role: "EMPLOYEE", startDate: new Date("2021-02-01"), monthlyHours: 150, clientHours: 100, monthlySalary: null, hourlyRate: 450, icoNumber: "44556677", officeAmount: 1500, refreshAmount: 300, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t10", name: "Pavel Šimánek",      email: "pavel.simanek@fourbros.cz", position: "Motion Designer",      department: "Creative",    seniority: "MEDIOR", employmentType: "ICO", birthday: "1992-08-11", bio: "Video a animace. After Effects je můj hřiště.", emoji: "🎬", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2022-04-01"), monthlyHours: 150, clientHours: 110, monthlySalary: null, hourlyRate: 430, icoNumber: "55667788", officeAmount: 1300, refreshAmount: 300, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t11", name: "Adéla Procházková",  email: "adela.prochazkova@fourbros.cz", position: "SEO Specialist",       department: "Performance", seniority: "JUNIOR", employmentType: "ICO", birthday: "1998-01-25", bio: "Google mě nezklame — já ho taky ne.", emoji: "🔍", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2026-03-01"), monthlyHours: 140, clientHours: 95, monthlySalary: null, hourlyRate: 350, icoNumber: "66778899", officeAmount: 1200, refreshAmount: 250, annualLeaveDays: null, contractTermType: "URCITA", contractEndDate: new Date("2026-12-31") },
  { id: "t12", name: "Jakub Veselý",       email: "jakub.vesely@fourbros.cz", position: "Graphic Designer",     department: "Creative",    seniority: "JUNIOR", employmentType: "ICO", birthday: "2000-05-05", bio: "Figma, Illustrator a dobrá muzika v pozadí.", emoji: "🖌️", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2026-06-01"), monthlyHours: 140, clientHours: 90, monthlySalary: null, hourlyRate: 330, icoNumber: "77889900", officeAmount: 1200, refreshAmount: 250, annualLeaveDays: null, contractTermType: "URCITA", contractEndDate: new Date("2027-05-31") },
  { id: "t13", name: "Michaela Červenková",email: "michaela.cervenkova@fourbros.cz", position: "Office Manager",       department: "Head office",  seniority: "MEDIOR", employmentType: "HPP", birthday: "1989-10-17", bio: "Kancelář šlape díky mně. A já to miluju.", emoji: "🏠", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2020-06-01"), monthlyHours: 160, clientHours: null, monthlySalary: 42000, hourlyRate: null, icoNumber: null, officeAmount: null, refreshAmount: null, annualLeaveDays: 25, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t14", name: "Radek Pospíšil",     email: "radek.pospisil@fourbros.cz", position: "Business Developer",   department: "Head office",       seniority: "MEDIOR", employmentType: "ICO", birthday: "1991-03-28", bio: "Nové příležitosti a partnerství jsou moje parketa.", emoji: "💼", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2022-07-01"), monthlyHours: 150, clientHours: 110, monthlySalary: null, hourlyRate: 450, icoNumber: "88990011", officeAmount: 1500, refreshAmount: 300, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t15", name: "Tereza Müllerová",   email: "tereza.mullerova@fourbros.cz", position: "Email Marketing Spec.",department: "Performance", seniority: "JUNIOR", employmentType: "ICO", birthday: "1996-07-09", bio: "Každý e-mail je příběh. Otevírací rate mi to potvrdí.", emoji: "📧", teamLeadId: null, role: "EMPLOYEE", startDate: new Date("2025-12-01"), monthlyHours: 140, clientHours: 95, monthlySalary: null, hourlyRate: 360, icoNumber: "99001122", officeAmount: 1200, refreshAmount: 250, annualLeaveDays: null, contractTermType: "NEURCITA", contractEndDate: null },
  { id: "t16", name: "Eva Horáková",       email: DEMO_TL.email,        position: "Team Lead",            department: "Creative",       seniority: "LEAD",   employmentType: "HPP", birthday: "1987-11-02", bio: "Vedu tým vývojářů a mám ráda, když věci dávají smysl.", emoji: "🧭", teamLeadId: null, role: "TL", startDate: new Date("2021-04-01"), monthlyHours: 168, clientHours: 100, monthlySalary: 85000, hourlyRate: null, icoNumber: null, officeAmount: null, refreshAmount: null, annualLeaveDays: 25, contractTermType: "NEURCITA", contractEndDate: null },
]

// Lidé, které lze v adminu nastavit jako team leadera daného člověka.
export const TEAM_LEAD_CANDIDATES = DEMO_TEAM.filter((m) => m.role === "TL").map((m) => ({ id: m.id, name: m.name }))

export const PERSON_ROLE_LABELS: Record<PersonRecord["role"], string> = {
  ADMIN: "Administrátor / HR",
  TL: "Team leader",
  EMPLOYEE: "Uživatel",
}

// Kompletní seznam lidí ve firmě pro adminskou sekci Uživatelé — DEMO_TEAM je zdroj pravdy,
// tohle jméno se v appce používá tam, kde dřív existoval samostatný (a neúplný) seznam zaměstnanců.
export const DEMO_EMPLOYEES: PersonRecord[] = DEMO_TEAM

// ── Odměny: JEDNA konzistentní historie pro všechny obrazovky ───────────────
// Moje odměna, Dokumenty, Přehled odměn (admin) i faktury OSVČ se počítají odsud,
// ze stejných údajů člověka — čísla si nikde neodporují. Po napojení se nahradí
// skutečnými páskami (mzdová účetní) a fakturami (Fakturoid).

/** Den výplaty (a proplacení faktur) — viz Termíny v Přehledu odměn */
const DEMO_PAY_DAY = 18
/** Odkdy portál vede výplaty (starší historie se do portálu nepřenáší) */
const PAYROLL_SINCE = { year: 2024, month: 1 }

/** Historie mezd (od kdy platí). Jan: nástup 55 000 Kč, každý říjen +5 000 Kč. Ostatní mají celou dobu monthlySalary. */
export const SALARY_HISTORY: Record<string, { from: string; gross: number }[]> = {
  t2: [
    { from: '2024-01', gross: 55000 },
    { from: '2024-10', gross: 60000 },
    { from: '2025-10', gross: 65000 },
    { from: '2026-10', gross: 70000 },
  ],
}

/** Čistá mzda k hrubé (HPP, sleva na poplatníka) — pevné hodnoty, ať jsou čísla všude stejná */
const NET_TABLE: Record<number, number> = { 28000: 23800, 42000: 32600, 55000: 40500, 58000: 42600, 60000: 44200, 65000: 47800, 70000: 51200, 85000: 61400 }
const NET_RATIO: Record<string, number> = { HPP: 0.735, DPC: 0.8, DPP: 0.85, STAZ: 0.85 }
function netOf(employmentType: string, gross: number) {
  if (employmentType === 'ICO') return gross
  if (employmentType === 'HPP' && NET_TABLE[gross]) return NET_TABLE[gross]
  return Math.round((gross * (NET_RATIO[employmentType] ?? 0.75)) / 100) * 100
}

export interface PayslipRecord {
  id: string; month: number; year: number
  grossAmount: number; netAmount: number; currency: string
  fileUrl: string | null
  /** výplata/faktura za měsíc ještě neproběhla (proplácí se 18. dne následujícího měsíce) */
  planned: boolean
}

/** Měsíční odměna člověka v daném měsíci: OSVČ = sazba × měsíční hodiny, ostatní podle historie mezd. */
export function grossFor(m: PersonRecord, year: number, month: number): number {
  if (m.employmentType === 'ICO') return Math.round(((m.hourlyRate ?? 0) * (m.monthlyHours ?? 0)) / 100) * 100
  const key = `${year}-${String(month).padStart(2, '0')}`
  const hist = SALARY_HISTORY[m.id]
  if (hist) return [...hist].reverse().find(h => h.from <= key)?.gross ?? hist[0].gross
  return m.monthlySalary ?? 0
}

/** Výplaty / faktury člověka od nástupu (nejdřív 1/2024) do konce letošního roku, nejnovější první. */
export function payslipsFor(personId: string, now = new Date()): PayslipRecord[] {
  const m = DEMO_TEAM.find(x => x.id === personId)
  if (!m) return []
  const startKey = Math.max(m.startDate.getFullYear() * 12 + m.startDate.getMonth(), PAYROLL_SINCE.year * 12 + PAYROLL_SINCE.month - 1)
  const endKey = now.getFullYear() * 12 + 11
  const out: PayslipRecord[] = []
  for (let k = endKey; k >= startKey; k--) {
    const year = Math.floor(k / 12), month = (k % 12) + 1
    const gross = grossFor(m, year, month)
    if (!gross) continue
    const paid = new Date(year, month, DEMO_PAY_DAY) <= now // 18. den následujícího měsíce
    out.push({ id: `${m.id}-${year}-${month}`, month, year, grossAmount: gross, netAmount: netOf(m.employmentType, gross), currency: 'CZK', fileUrl: null, planned: !paid })
  }
  return out
}

/** Aktuální odměna a poslední navýšení (pro hlavičku Moje odměna a profil). */
export function salaryInfoFor(personId: string, now = new Date()) {
  const m = DEMO_TEAM.find(x => x.id === personId)
  const real = payslipsFor(personId, now).filter(p => !p.planned)
  const current = real[0]?.grossAmount ?? (m ? grossFor(m, now.getFullYear(), now.getMonth() + 1) : 0)
  const hist = SALARY_HISTORY[personId]
  let lastRaise: { date: Date; amount: number } | null = null
  if (hist && hist.length > 1) {
    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const idx = hist.map(h => h.from <= nowKey).lastIndexOf(true)
    if (idx > 0) {
      const [y, mo] = hist[idx].from.split('-').map(Number)
      lastRaise = { date: new Date(y, mo - 1, 1), amount: hist[idx].gross - hist[idx - 1].gross }
    }
  }
  return {
    currentSalary: current,
    currency: 'CZK',
    /** nástupní mzda (HR) */
    startingSalary: hist ? hist[0].gross : (m?.monthlySalary ?? null),
    lastRaiseDate: lastRaise?.date ?? null,
    lastRaiseAmount: lastRaise?.amount ?? null,
  }
}
export type SalaryInfo = ReturnType<typeof salaryInfoFor>

// teamLeadId v DEMO_TEAM odkazuje na DEMO_TEAM.id (např. "t16"), ne na přihlašovací id
// demo účtu (DEMO_TL.id = "demo-tl-1") — tohle převádí jedno na druhé podle e-mailu.
export function demoTeamIdFor(email: string): string | undefined {
  return DEMO_TEAM.find((m) => m.email.toLowerCase() === email.toLowerCase())?.id
}

// Žádosti o benefity/vzdělávání/výdaje jsou v demu vedené podle přihlašovacího (persona) id — tohle na něj dohledá e-mail.
export const PERSONA_EMAIL_BY_ID: Record<string, string> = {
  [DEMO_ADMIN.id]: DEMO_ADMIN.email,
  [DEMO_USER.id]: DEMO_USER.email,
  [DEMO_TL.id]: DEMO_TL.email,
  [DEMO_USER_ICO.id]: DEMO_USER_ICO.email,
}

// ── Notifikace ──────────────────────────────────────────────────────────────

export interface NotificationSeed {
  id: string
  recipientEmail: string
  title: string
  body: string
  href?: string
  createdAt: string
  read: boolean
}

export const DEMO_NOTIFICATIONS: NotificationSeed[] = [
  { id: "ntf-seed-1", recipientEmail: DEMO_USER.email, title: "Dovolená schválena", body: "Tvoje dovolená 21. 7. – 1. 8. byla schválena.", href: "/time-off", createdAt: "2026-07-15T09:00:00.000Z", read: true },
  { id: "ntf-seed-2", recipientEmail: DEMO_USER.email, title: "Vzdělávací budget", body: "HR schválilo kurz Copywriting Akademie za 3 490 Kč.", href: "/profile?tab=benefity", createdAt: "2026-05-28T09:00:00.000Z", read: true },
  { id: "ntf-seed-3", recipientEmail: DEMO_TL.email, title: "Nová žádost o dovolenou", body: "Ve tvém týmu čeká žádost o dovolenou ke schválení.", href: "/admin/leave-requests", createdAt: "2026-08-20T09:00:00.000Z", read: false },
  { id: "ntf-seed-4", recipientEmail: DEMO_USER_ICO.email, title: "Faktura zaplacena", body: "Faktura za červenec (nájem + občerstvení) byla označena jako zaplacená.", href: "/payslips", createdAt: "2026-08-05T09:00:00.000Z", read: false },
  { id: "ntf-seed-5", recipientEmail: DEMO_ADMIN.email, title: "Žádosti čekají na schválení", body: "Několik žádostí o dovolenou čeká na tvoje vyřízení.", href: "/admin/leave-requests", createdAt: "2026-08-20T09:00:00.000Z", read: false },
]

// tag: SMLOUVA | DODATEK | GDPR  (for contracts section; NDA je součástí smlouvy)
// type: CONTRACT | PAYSLIP
export const DEMO_DOCUMENTS = [
  // Smlouvy
  { id: "c1", name: "Pracovní smlouva", type: "CONTRACT", tag: "SMLOUVA", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  { id: "c2", name: "Dodatek č. 1 — změna pozice", type: "CONTRACT", tag: "DODATEK", createdAt: new Date("2024-06-01"), uploadedAt: new Date("2024-06-01"), signedAt: new Date("2024-06-03"), url: "#" },
  { id: "c3", name: "GDPR souhlas se zpracováním osobních údajů", type: "CONTRACT", tag: "GDPR", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  // Výplatní pásky (HPP only) — stejné měsíce jako proplacené výplaty Jana
  ...payslipsFor('t2').filter(p => !p.planned).map((p, i) => ({
    id: `p${i + 1}`, name: "Výplatní páska", type: "PAYSLIP", tag: null as string | null, month: p.month, year: p.year,
    createdAt: new Date(p.year, p.month, 18), uploadedAt: new Date(p.year, p.month, 18), signedAt: null as Date | null, url: "#",
  })),
]

export const DEMO_LEAVE_BALANCE = {
  annualTotal: 20,
  annualUsed: 5,
  sickTotal: 10,
  sickUsed: 2,
}

export const DEMO_LEAVE_REQUESTS = [
  { id: "1", type: "ANNUAL", startDate: new Date("2024-07-15"), endDate: new Date("2024-07-26"), status: "APPROVED", reason: "Letní dovolená", note: null, createdAt: new Date("2024-06-01") },
  { id: "2", type: "SICK", startDate: new Date("2024-03-04"), endDate: new Date("2024-03-05"), status: "APPROVED", reason: "Nemoc", note: null, createdAt: new Date("2024-03-04") },
  { id: "3", type: "ANNUAL", startDate: new Date("2024-12-23"), endDate: new Date("2024-12-27"), status: "PENDING", reason: "Vánoce", note: null, createdAt: new Date("2024-11-01") },
]

// Pravidelné měsíční položky přičítané k odměně OSVČ (nájem, občerstvení apod.)
export const ICO_MONTHLY_EXPENSES = [
  { label: "Nájem kancelářského místa", amount: 1500 },
  { label: "Občerstvení", amount: 300 },
]

// Připraveno pro budoucí napojení na Fakturoid + firemní e-mail — zatím HR nastavuje ručně.
export type InvoicePaymentStatus = 'NEZAPLACENO' | 'CEKA_NA_UHRADU' | 'ZAPLACENO'

export const INVOICE_STATUS_LABELS: Record<InvoicePaymentStatus, string> = {
  NEZAPLACENO: 'Nezaplaceno',
  CEKA_NA_UHRADU: 'Čeká na úhradu',
  ZAPLACENO: 'Zaplaceno',
}

// Měsíční faktury OSVČ — do budoucna natažené z Fakturoidu (napárovaného na banku) přes API.
// Zatím mock: paušál (Plat) + Místo (nájem) + Občerstvení + volitelná další položka.
export interface IcoInvoiceRecord {
  id: string
  employeeId: string
  month: number
  year: number
  invoiceNumber: string
  salaryAmount: number
  officeAmount: number
  refreshAmount: number
  otherLabel: string | null
  otherAmount: number
}

/** Faktury Tomáše Dvořáka (OSVČ) za posledních 12 proplacených měsíců — paušál = sazba × hodiny, nájem a občerstvení z jeho profilu */
export const DEMO_ICO_INVOICES: IcoInvoiceRecord[] = payslipsFor('t4')
  .filter(p => !p.planned)
  .slice(0, 12)
  .map((p, i, arr) => ({
    id: `inv-${p.year}-${String(p.month).padStart(2, '0')}`,
    employeeId: DEMO_USER_ICO.id,
    month: p.month, year: p.year,
    invoiceNumber: `${p.year}-${String(100 + arr.length - i).padStart(4, '0')}`,
    salaryAmount: p.grossAmount,
    officeAmount: DEMO_USER_ICO.officeAmount,
    refreshAmount: DEMO_USER_ICO.refreshAmount,
    otherLabel: null,
    otherAmount: 0,
  }))

// ── Úpravy odměny navržené team leadem ──────────────────────────────────────
// TL může u lidí ve svém týmu navrhnout přirážku/srážku/prémii k jejich faktuře — musí to ale schválit HR,
// než se to promítne do přehledu. Ukládá se v prostoru invoiceEmployeeId (stejném jako DEMO_ICO_INVOICES).
export interface TeamAdjustmentRequest {
  id: string
  teamLeadId: string
  teamLeadName: string
  teamLeadEmail: string
  employeeId: string
  employeeName: string
  title: string
  amount: number
  sign: 'PLUS' | 'MINUS'
  month: number
  year: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

export const DEMO_TEAM_ADJUSTMENTS: TeamAdjustmentRequest[] = []

// Návrh na trvalou změnu měsíční odměny/paušálu od zadaného období — na rozdíl od jednorázové prémie
// výše platí od zvoleného měsíce dál, dokud ji někdo nezmění znovu. Musí schválit HR.
export interface SalaryChangeRequest {
  id: string
  teamLeadId: string
  teamLeadName: string
  teamLeadEmail: string
  employeeId: string
  employeeName: string
  newAmount: number
  reason: string
  effectiveMonth: number
  effectiveYear: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedAt: string
}

export const DEMO_SALARY_CHANGES: SalaryChangeRequest[] = []

/** Výplaty Jana Nováka (HPP) — generované z historie mezd výše */
export const DEMO_PAYSLIPS = payslipsFor('t2')
export const DEMO_SALARY_INFO = salaryInfoFor('t2')

// All leave requests for admin view (with user info)
export const DEMO_ALL_LEAVE_REQUESTS = [
  {
    id: "1",
    type: "ANNUAL",
    startDate: new Date("2024-07-15"),
    endDate: new Date("2024-07-26"),
    status: "APPROVED",
    reason: "Letní dovolená",
    note: null,
    createdAt: new Date("2024-06-01"),
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Creative" },
  },
  {
    id: "2",
    type: "SICK",
    startDate: new Date("2024-03-04"),
    endDate: new Date("2024-03-05"),
    status: "APPROVED",
    reason: "Nemoc",
    note: null,
    createdAt: new Date("2024-03-04"),
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Creative" },
  },
  {
    id: "3",
    type: "ANNUAL",
    startDate: new Date("2024-12-23"),
    endDate: new Date("2024-12-27"),
    status: "PENDING",
    reason: "Vánoce",
    note: null,
    createdAt: new Date("2024-11-01"),
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Creative" },
  },
  {
    id: "4",
    type: "ANNUAL",
    startDate: new Date("2024-08-05"),
    endDate: new Date("2024-08-09"),
    status: "PENDING",
    reason: "Dovolená u moře",
    note: null,
    createdAt: new Date("2024-07-01"),
    user: { name: "Marie Svobodová", email: "marie.svobodova@fourbros.cz", department: "Performance" },
  },
  {
    id: "5",
    type: "PERSONAL",
    startDate: new Date("2024-09-02"),
    endDate: new Date("2024-09-02"),
    status: "REJECTED",
    reason: "Osobní záležitosti",
    note: "Příliš krátká doba pro schválení",
    createdAt: new Date("2024-08-28"),
    user: { name: "Tomáš Dvořák", email: "tomas.dvorak@fourbros.cz", department: "Account manager" },
  },
]

// ── Contract Management ─────────────────────────────────────────────────────

export type ContractStatus = 'DRAFT' | 'PENDING_MANAGEMENT' | 'PENDING_EMPLOYEE' | 'SIGNED'

export interface ContractTemplate {
  id: string
  name: string
  type: string
  description: string
  body: string
  placeholders: string[]
  createdAt: Date
}

export interface Contract {
  id: string
  templateId: string
  templateName: string
  employeeId: string
  employeeName: string
  status: ContractStatus
  createdAt: Date
  sentToManagementAt: Date | null
  managementSignedAt: Date | null
  managementSignedBy: string | null
  sentToEmployeeAt: Date | null
  employeeSignedAt: Date | null
  values: Record<string, string>
  notes: string | null
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "tpl-1",
    name: "HPP Pracovní smlouva",
    type: "HPP",
    description: "Standardní pracovní smlouva pro zaměstnance na hlavní pracovní poměr (HPP).",
    body: `<h2>PRACOVNÍ SMLOUVA</h2>

<h3>Smluvní strany</h3>
<p><strong>Zaměstnavatel:</strong> {{ZAMESTNAVATEL}}</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Předmět smlouvy</h3>
<p>Zaměstnavatel přijímá zaměstnance na pozici <strong>{{POZICE}}</strong> s místem výkonu práce {{MISTO_VYKONU}}.</p>

<h3>Základní mzdové podmínky</h3>
<p>Zaměstnanci náleží základní měsíční mzda ve výši <strong>{{MZDA}}</strong>.</p>

<h3>Nástup do práce</h3>
<p>Zaměstnanec nastupuje do práce dne <strong>{{DATUM_NASTUPU}}</strong>.</p>

<h3>Zkušební doba</h3>
<p>{{ZKUSEBNI_DOBA}}</p>

<h3>Pracovní doba</h3>
<p>Týdenní pracovní doba činí {{TYDENNI_UVAZEK}} hodin.</p>

<p>V {{MISTO_PODPISU}} dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["ZAMESTNAVATEL", "JMENO", "POZICE", "MISTO_VYKONU", "MZDA", "DATUM_NASTUPU", "ZKUSEBNI_DOBA", "TYDENNI_UVAZEK", "MISTO_PODPISU", "DATUM_PODPISU"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "tpl-2",
    name: "DPP Dohoda o provedení práce",
    type: "DPP",
    description: "Dohoda o provedení práce pro spolupráci na konkrétních projektech nebo úkolech.",
    body: `<h2>DOHODA O PROVEDENÍ PRÁCE</h2>

<h3>Smluvní strany</h3>
<p><strong>Zaměstnavatel:</strong> {{ZAMESTNAVATEL}}</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Sjednaná práce</h3>
<p>Předmětem dohody je výkon práce na pozici <strong>{{POZICE}}</strong>.</p>

<h3>Odměna</h3>
<p>Za provedenou práci přísluší zaměstnanci odměna ve výši <strong>{{HODINOVA_SAZBA}}</strong>.</p>

<h3>Rozsah práce</h3>
<p>Rozsah práce nepřesáhne {{MAX_HODIN}} hodin za rok.</p>

<h3>Doba trvání dohody</h3>
<p>Dohoda se sjednává od {{DATUM_NASTUPU}} do {{DATUM_UKONCENI}}.</p>

<p>V {{MISTO_PODPISU}} dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["ZAMESTNAVATEL", "JMENO", "POZICE", "HODINOVA_SAZBA", "MAX_HODIN", "DATUM_NASTUPU", "DATUM_UKONCENI", "MISTO_PODPISU", "DATUM_PODPISU"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "tpl-3",
    name: "Dodatek ke smlouvě",
    type: "OBECNA",
    description: "Obecný dodatek ke stávající pracovní smlouvě pro změny podmínek, navýšení mzdy apod.",
    body: `<h2>DODATEK KE SMLOUVĚ</h2>
<p>č. {{CISLO_DODATKU}}</p>

<h3>Smluvní strany</h3>
<p><strong>Zaměstnavatel:</strong> {{ZAMESTNAVATEL}}</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Předmět dodatku</h3>
<p>Smluvní strany se dohodly na následující změně pracovní smlouvy ze dne {{DATUM_PUVODNI_SMLOUVY}}:</p>

<h3>Změna podmínek</h3>
<p>{{POPIS_ZMENY}}</p>

<h3>Nová mzda</h3>
<p>S účinností od <strong>{{DATUM_UCINNOSTI}}</strong> se mzda stanovuje na <strong>{{NOVA_MZDA}}</strong> hrubého měsíčně.</p>

<p>Ostatní podmínky pracovní smlouvy zůstávají v platnosti.</p>

<p>V {{MISTO_PODPISU}} dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["ZAMESTNAVATEL", "CISLO_DODATKU", "JMENO", "DATUM_PUVODNI_SMLOUVY", "POPIS_ZMENY", "DATUM_UCINNOSTI", "NOVA_MZDA", "MISTO_PODPISU", "DATUM_PODPISU"],
    createdAt: new Date("2024-01-01"),
  },
]

export const DEMO_CONTRACTS: Contract[] = [
  {
    id: "c-demo-1",
    templateId: "tpl-1",
    templateName: "HPP Pracovní smlouva",
    employeeId: "demo",
    employeeName: "Ukázkový zaměstnanec",
    status: "SIGNED",
    createdAt: new Date("2026-01-10"),
    sentToManagementAt: new Date("2026-01-11"),
    managementSignedAt: new Date("2026-01-13"),
    managementSignedBy: "Kristýna Pacáková",
    sentToEmployeeAt: new Date("2026-01-14"),
    employeeSignedAt: new Date("2026-01-15"),
    values: {
      ZAMESTNAVATEL: "Four Bros s.r.o., IČO: xxxxxxxx, se sídlem xxxxxxxxxx",
      JMENO: "Ukázkový zaměstnanec",
      POZICE: "Pracovní pozice",
      MISTO_VYKONU: "Brno",
      MZDA: "XX 000 Kč",
      DATUM_NASTUPU: "1. 1. 2026",
      ZKUSEBNI_DOBA: "Sjednává se zkušební doba v délce 3 měsíců od nástupu do práce.",
      TYDENNI_UVAZEK: "40",
      MISTO_PODPISU: "Brně",
      DATUM_PODPISU: "10. 1. 2026",
    },
    notes: "Ukázková smlouva — slouží jen pro náhled vizuálu.",
  },
  {
    id: "c-demo-2",
    templateId: "tpl-2",
    templateName: "DPP Dohoda o provedení práce",
    employeeId: "demo",
    employeeName: "Ukázkový spolupracovník",
    status: "PENDING_MANAGEMENT",
    createdAt: new Date("2026-05-01"),
    sentToManagementAt: new Date("2026-05-02"),
    managementSignedAt: null,
    managementSignedBy: null,
    sentToEmployeeAt: null,
    employeeSignedAt: null,
    values: {
      ZAMESTNAVATEL: "Four Bros s.r.o., IČO: xxxxxxxx, se sídlem xxxxxxxxxx",
      JMENO: "Ukázkový spolupracovník",
      POZICE: "Pracovní pozice",
      HODINOVA_SAZBA: "XXX Kč/hod",
      MAX_HODIN: "300",
      DATUM_NASTUPU: "1. 6. 2026",
      DATUM_UKONCENI: "31. 12. 2026",
      MISTO_PODPISU: "Brně",
      DATUM_PODPISU: "1. 5. 2026",
    },
    notes: "Ukázková smlouva — slouží jen pro náhled vizuálu.",
  },
]

// ── Interní směrnice ────────────────────────────────────────────────────────

export type DirectiveTheme = 'STANDARD' | 'IMPORTANT' | 'GDPR' | 'BOZP' | 'BENEFIT' | 'WELCOME'

export interface DirectiveTemplate {
  id: string
  name: string
  category: string
  theme: DirectiveTheme
  description: string
  body: string
  placeholders: string[]
  createdAt: Date
}

export interface DirectiveAcknowledgement {
  employeeId: string
  employeeName: string
  acknowledgedAt: Date
  /** jak člověk souhlas dal: odkliknutím, nebo elektronickým podpisem (DocuSeal) */
  method?: 'CHECKBOX' | 'ESIGN'
  /** ID podpisu u poskytovatele (DocuSeal submission id) */
  submissionId?: string
  /** otisk (SHA-256) přesného textu směrnice, se kterým člověk souhlasil */
  documentHash?: string
}

export interface Directive {
  id: string
  templateId: string
  title: string
  category: string
  theme: DirectiveTheme
  body: string
  publishedAt: Date
  validFrom: Date
  mustAcknowledge: boolean
  /** souhlas se dává elektronickým podpisem (DocuSeal), ne jen odkliknutím */
  requireESign?: boolean
  acknowledgements: DirectiveAcknowledgement[]
  createdBy: string
}

export const DIRECTIVE_TEMPLATES: DirectiveTemplate[] = [
  {
    id: 'dtpl-1',
    name: 'Obecná interní směrnice',
    category: 'Obecné',
    theme: 'STANDARD',
    description: 'Universální šablona pro interní firemní směrnice a pravidla.',
    placeholders: ['NAZEV', 'CISLO', 'DATUM', 'OBSAH', 'PLATNOST_OD'],
    createdAt: new Date('2024-01-01'),
    body: `<h2>Interní směrnice č. {{CISLO}} — {{NAZEV}}</h2>
<p><strong>Datum vydání:</strong> {{DATUM}}</p>
<h3>1. Účel a předmět směrnice</h3>
<p>Tato směrnice stanovuje závazná pravidla a postupy platné pro všechny zaměstnance společnosti Four Bros s.r.o. Jejím cílem je zajistit jednotný postup při řešení situací popsaných v tomto dokumentu a přispět k efektivnímu fungování celé organizace.</p>
<h3>2. Obsah směrnice</h3>
{{OBSAH}}
<h3>3. Závěrečná ustanovení</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>{{PLATNOST_OD}}</strong>. Všichni zaměstnanci jsou povinni se s touto směrnicí seznámit a řídit se jejími ustanoveními. Porušení směrnice může být považováno za porušení pracovní kázně.</p>
<p>Směrnici vydává a za její aktualizaci odpovídá oddělení HR ve spolupráci s vedením společnosti.</p>`,
  },
  {
    id: 'dtpl-2',
    name: 'Směrnice GDPR / ochrana dat',
    category: 'GDPR',
    theme: 'GDPR',
    description: 'Šablona pro směrnice týkající se ochrany osobních údajů dle GDPR.',
    placeholders: ['CISLO', 'DATUM', 'OBSAH_ZPRACOVANI', 'DOBA_ULOZENI', 'PLATNOST_OD'],
    createdAt: new Date('2024-01-01'),
    body: `<h2>Směrnice GDPR č. {{CISLO}} — Ochrana osobních údajů</h2>
<p><strong>Datum vydání:</strong> {{DATUM}}</p>
<h3>1. Účel a právní základ</h3>
<p>Tato směrnice upravuje pravidla zpracování osobních údajů ve společnosti Four Bros s.r.o. v souladu s nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů.</p>
<h3>2. Rozsah zpracování osobních údajů</h3>
{{OBSAH_ZPRACOVANI}}
<h3>3. Doba uložení dat</h3>
<p>{{DOBA_ULOZENI}}</p>
<h3>4. Práva subjektů údajů</h3>
<p>Každý zaměstnanec má právo na přístup ke svým osobním údajům, jejich opravu, výmaz nebo omezení zpracování. Žádosti je třeba podávat prostřednictvím oddělení HR. Na všechny žádosti bude odpovězeno nejpozději do 30 dnů od jejich doručení.</p>
<h3>5. Účinnost</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>{{PLATNOST_OD}}</strong> a ruší veškerá předchozí ustanovení týkající se ochrany osobních údajů.</p>`,
  },
  {
    id: 'dtpl-3',
    name: 'Bezpečnost a ochrana zdraví (BOZP)',
    category: 'BOZP',
    theme: 'BOZP',
    description: 'Šablona pro směrnice o bezpečnosti práce a ochraně zdraví při práci.',
    placeholders: ['CISLO', 'DATUM', 'POPIS_RIZIK', 'OCHRANA_OPATRENI', 'PLATNOST_OD'],
    createdAt: new Date('2024-01-01'),
    body: `<h2>Směrnice BOZP č. {{CISLO}} — Bezpečnost a ochrana zdraví při práci</h2>
<p><strong>Datum vydání:</strong> {{DATUM}}</p>
<h3>1. Úvod a účel</h3>
<p>Bezpečnost a ochrana zdraví při práci jsou pro společnost Four Bros s.r.o. prioritou. Tato směrnice vymezuje povinnosti zaměstnanců i zaměstnavatele v oblasti BOZP v souladu se zákonem č. 262/2006 Sb. (zákoník práce) a zákonem č. 309/2006 Sb.</p>
<h3>2. Identifikace rizik</h3>
{{POPIS_RIZIK}}
<h3>3. Ochranná opatření</h3>
{{OCHRANA_OPATRENI}}
<h3>4. Povinnosti zaměstnanců</h3>
<ul>
<li>Absolvovat vstupní a periodická školení BOZP</li>
<li>Používat přidělené osobní ochranné pracovní prostředky</li>
<li>Neprodleně hlásit pracovní úrazy a nebezpečné situace</li>
<li>Dodržovat technologické postupy a bezpečnostní předpisy</li>
</ul>
<h3>5. Účinnost</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>{{PLATNOST_OD}}</strong>. Školení BOZP musí absolvovat každý zaměstnanec nejpozději do 30 dnů od tohoto data.</p>`,
  },
  {
    id: 'dtpl-4',
    name: 'Benefity a odměňování',
    category: 'Odměňování',
    theme: 'BENEFIT',
    description: 'Šablona pro směrnice upravující zaměstnanecké benefity a systém odměňování.',
    placeholders: ['CISLO', 'DATUM', 'BENEFITY', 'PODMINKY', 'PLATNOST_OD'],
    createdAt: new Date('2024-01-01'),
    body: `<h2>Směrnice č. {{CISLO}} — Zaměstnanecké benefity a odměňování</h2>
<p><strong>Datum vydání:</strong> {{DATUM}}</p>
<h3>1. Úvod</h3>
<p>Společnost Four Bros s.r.o. si váží každého svého zaměstnance a usiluje o vytváření příjemného a motivujícího pracovního prostředí. Tato směrnice popisuje systém benefitů a dalšího odměňování, na které mají zaměstnanci nárok.</p>
<h3>2. Přehled benefitů</h3>
{{BENEFITY}}
<h3>3. Podmínky čerpání</h3>
{{PODMINKY}}
<h3>4. Účinnost</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>{{PLATNOST_OD}}</strong>. Změny v oblasti benefitů budou zaměstnancům oznamovány s předstihem minimálně 30 dnů.</p>`,
  },
  {
    id: 'dtpl-5',
    name: 'Onboardingová příručka / uvítání',
    category: 'Onboarding',
    theme: 'WELCOME',
    description: 'Uvítací příručka pro nové zaměstnance — vše, co potřebují vědět od prvního dne.',
    placeholders: ['CISLO', 'DATUM', 'VITEJTE_TEXT', 'KONTAKTY', 'PLATNOST_OD'],
    createdAt: new Date('2024-01-01'),
    body: `<h2>Příručka č. {{CISLO}} — Vítejte v Four Bros</h2>
<p><strong>Datum vydání:</strong> {{DATUM}}</p>
<h3>Uvítání od vedení</h3>
{{VITEJTE_TEXT}}
<h3>Důležité kontakty a informace</h3>
{{KONTAKTY}}
<h3>Vaše první kroky</h3>
<ol>
<li>Podepište pracovní smlouvu a předejte potřebné dokumenty oddělení HR</li>
<li>Vyplňte svůj profil v HR portálu a zkontrolujte osobní údaje</li>
<li>Absolvujte vstupní školení BOZP a seznamte se s prostory kanceláře</li>
<li>Připojte se na firemní Slack a představte se v kanálu #general</li>
<li>Naplánujte si úvodní schůzku s přímým nadřízeným</li>
</ol>
<h3>Platnost</h3>
<p>Tato příručka nabývá účinnosti dnem <strong>{{PLATNOST_OD}}</strong> a bude pravidelně aktualizována dle aktuálního dění ve společnosti.</p>`,
  },
]

export const DEMO_DIRECTIVES: Directive[] = [
  {
    id: 'dir-1',
    templateId: 'dtpl-5',
    title: 'Uvítací příručka Four Bros',
    category: 'Onboarding',
    theme: 'WELCOME',
    publishedAt: new Date('2024-01-01'),
    validFrom: new Date('2024-01-01'),
    mustAcknowledge: true,
    createdBy: 'Petra Nováková',
    acknowledgements: [
      {
        employeeId: 'demo-employee-1',
        employeeName: 'Jan Novák',
        acknowledgedAt: new Date('2024-01-16'),
      },
      { employeeId: 't3', employeeName: 'Marie Svobodová', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't5', employeeName: 'Lucie Kratochvílová', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't6', employeeName: 'Ondřej Mašek', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't7', employeeName: 'Klára Horáková', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't8', employeeName: 'Martin Beneš', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't9', employeeName: 'Veronika Jelínková', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't10', employeeName: 'Pavel Šimánek', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't13', employeeName: 'Michaela Červenková', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't14', employeeName: 'Radek Pospíšil', acknowledgedAt: new Date('2025-12-10') },
      { employeeId: 't15', employeeName: 'Tereza Müllerová', acknowledgedAt: new Date('2025-12-10') },
    ],
    body: `<h2>Příručka č. 1/2024 — Vítejte v Four Bros</h2>
<p><strong>Datum vydání:</strong> 1. 1. 2024</p>
<h3>Uvítání od vedení</h3>
<p>Vítejte v rodině Four Bros! Jsme nadšeni, že se k nám přidáváte, a těšíme se na společnou práci. Naše agentura je dynamické místo plné kreativních lidí, kteří každý den pracují na tom, aby přinášeli klientům měřitelné výsledky.</p>
<p>Věříme ve vzájemnou úctu, otevřenou komunikaci a profesionální růst každého člena týmu. Zde najdete vše, co potřebujete vědět pro hladký začátek vašeho působení u nás.</p>
<h3>Důležité kontakty a informace</h3>
<ul>
<li><strong>HR oddělení:</strong> Petra Nováková — petra.novakova@fourbros.cz</li>
<li><strong>IT podpora:</strong> it@fourbros.cz</li>
<li><strong>Finanční oddělení:</strong> finance@fourbros.cz</li>
<li><strong>Kancelář:</strong> Vinohradská 10, Praha 2</li>
</ul>
<h3>Vaše první kroky</h3>
<ol>
<li>Podepište pracovní smlouvu a předejte potřebné dokumenty oddělení HR</li>
<li>Vyplňte svůj profil v HR portálu a zkontrolujte osobní údaje</li>
<li>Absolvujte vstupní školení BOZP a seznamte se s prostory kanceláře</li>
<li>Připojte se na firemní Slack a představte se v kanálu #general</li>
<li>Naplánujte si úvodní schůzku s přímým nadřízeným</li>
</ol>
<h3>Platnost</h3>
<p>Tato příručka nabývá účinnosti dnem <strong>1. 1. 2024</strong> a bude pravidelně aktualizována dle aktuálního dění ve společnosti.</p>`,
  },
  {
    id: 'dir-2',
    templateId: 'dtpl-1',
    title: 'Směrnice č. 2/2025 — Pravidla homeoffice',
    category: 'Obecné',
    theme: 'STANDARD',
    publishedAt: new Date('2025-03-01'),
    validFrom: new Date('2025-03-01'),
    mustAcknowledge: true,
    createdBy: 'Petra Nováková',
    acknowledgements: [
      {
        employeeId: 'demo-employee-1',
        employeeName: 'Jan Novák',
        acknowledgedAt: new Date('2025-03-05'),
      },
      { employeeId: 't3', employeeName: 'Marie Svobodová', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't5', employeeName: 'Lucie Kratochvílová', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't7', employeeName: 'Klára Horáková', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't8', employeeName: 'Martin Beneš', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't9', employeeName: 'Veronika Jelínková', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't13', employeeName: 'Michaela Červenková', acknowledgedAt: new Date('2025-03-10') },
      { employeeId: 't14', employeeName: 'Radek Pospíšil', acknowledgedAt: new Date('2025-03-10') },
    ],
    body: `<h2>Interní směrnice č. 2/2025 — Pravidla homeoffice</h2>
<p><strong>Datum vydání:</strong> 1. 3. 2025</p>
<h3>1. Účel a předmět směrnice</h3>
<p>Tato směrnice stanovuje závazná pravidla a postupy platné pro všechny zaměstnance společnosti Four Bros s.r.o. při výkonu práce z domova (homeoffice). Jejím cílem je zajistit jednotný postup a efektivní fungování celé organizace i v podmínkách vzdálené práce.</p>
<h3>2. Obsah směrnice</h3>
<p>Zaměstnanci jsou oprávněni pracovat z domova na základě písemné dohody s přímým nadřízeným. Homeoffice je možné čerpat maximálně 3 dny v týdnu. Zaměstnanec je povinen být dostupný v pracovní době od 9:00 do 17:00 a reagovat na komunikaci do 30 minut.</p>
<ul>
<li>Pracovní místo musí splňovat požadavky BOZP</li>
<li>Zaměstnanec odpovídá za zabezpečení firemních dat a zařízení</li>
<li>Čerpání homeoffice je nutné hlásit v HR systému předem</li>
</ul>
<h3>3. Závěrečná ustanovení</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>1. 3. 2025</strong>. Všichni zaměstnanci jsou povinni se s touto směrnicí seznámit a řídit se jejími ustanoveními. Porušení směrnice může být považováno za porušení pracovní kázně.</p>
<p>Směrnici vydává a za její aktualizaci odpovídá oddělení HR ve spolupráci s vedením společnosti.</p>`,
  },
  {
    id: 'dir-3',
    templateId: 'dtpl-3',
    title: 'Směrnice č. 1/2026 — BOZP školení',
    category: 'BOZP',
    theme: 'BOZP',
    publishedAt: new Date('2026-05-01'),
    validFrom: new Date('2026-06-01'),
    mustAcknowledge: true,
    requireESign: true,
    createdBy: 'Petra Nováková',
    acknowledgements: [
      { employeeId: 't3', employeeName: 'Marie Svobodová', acknowledgedAt: new Date('2026-05-12') },
      { employeeId: 't8', employeeName: 'Martin Beneš', acknowledgedAt: new Date('2026-05-12') },
      { employeeId: 't13', employeeName: 'Michaela Červenková', acknowledgedAt: new Date('2026-05-12') },
    ],
    body: `<h2>Směrnice BOZP č. 1/2026 — Bezpečnost a ochrana zdraví při práci</h2>
<p><strong>Datum vydání:</strong> 1. 5. 2026</p>
<h3>1. Úvod a účel</h3>
<p>Bezpečnost a ochrana zdraví při práci jsou pro společnost Four Bros s.r.o. prioritou. Tato směrnice vymezuje povinnosti zaměstnanců i zaměstnavatele v oblasti BOZP v souladu se zákonem č. 262/2006 Sb. (zákoník práce) a zákonem č. 309/2006 Sb.</p>
<h3>2. Identifikace rizik</h3>
<p>Ve společnosti Four Bros s.r.o. jsou identifikována následující pracovní rizika: ergonomická rizika při práci s počítačem (přetížení zraku, bolesti zad a kloubů), rizika při pohybu v kancelářských prostorách a rizika vyplývající z práce v kancelářském prostředí (požár, únik plynu).</p>
<h3>3. Ochranná opatření</h3>
<ul>
<li>Pravidelné přestávky při práci s monitorem (min. 10 minut každé 2 hodiny)</li>
<li>Ergonomické vybavení pracovního místa (nastavitelná výška stolu a monitoru)</li>
<li>Pravidelná školení první pomoci a evakuačních postupů</li>
<li>Funkční hasicí přístroje a lékárnička na každém patře</li>
</ul>
<h3>4. Povinnosti zaměstnanců</h3>
<ul>
<li>Absolvovat vstupní a periodická školení BOZP</li>
<li>Používat přidělené osobní ochranné pracovní prostředky</li>
<li>Neprodleně hlásit pracovní úrazy a nebezpečné situace</li>
<li>Dodržovat technologické postupy a bezpečnostní předpisy</li>
</ul>
<h3>5. Účinnost</h3>
<p>Tato směrnice nabývá účinnosti dnem <strong>1. 6. 2026</strong>. Školení BOZP musí absolvovat každý zaměstnanec nejpozději do 30 dnů od tohoto data.</p>`,
  },
]


// ── Odvozená data — všechno se počítá z DEMO_TEAM, ať demo drží pohromadě ──────

const DAY_MS = 86400000
const demoToday = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })()
const relDay = (days: number) => new Date(demoToday.getTime() + days * DAY_MS)
const departmentOf = (name: string) => DEMO_TEAM.find((m) => m.name === name)?.department ?? 'Head office'

// Dovolené / home office / nemoc — jména a týmy přesně podle DEMO_TEAM.
// Pár záznamů je relativně k dnešku, ať dashboard („Jak to vypadá dnes ve firmě“) vždycky něco ukazuje.
const TEAM_LEAVE_SEEDS = [
  { id: "tl1", userName: "Jan Novák", type: "ANNUAL", startDate: new Date("2026-05-26"), endDate: new Date("2026-05-30"), status: "APPROVED" },
  { id: "tl2", userName: "Marie Svobodová", type: "ANNUAL", startDate: new Date("2026-06-09"), endDate: new Date("2026-06-20"), status: "APPROVED" },
  { id: "tl3", userName: "Tomáš Dvořák", type: "ANNUAL", startDate: new Date("2026-06-15"), endDate: new Date("2026-06-19"), status: "APPROVED" },
  { id: "tl4", userName: "Lucie Kratochvílová", type: "SICK", startDate: new Date("2026-06-02"), endDate: new Date("2026-06-03"), status: "APPROVED" },
  { id: "tl5", userName: "Radek Pospíšil", type: "ANNUAL", startDate: new Date("2026-07-07"), endDate: new Date("2026-07-18"), status: "APPROVED" },
  { id: "tl6", userName: "Jan Novák", type: "ANNUAL", startDate: new Date("2026-07-21"), endDate: new Date("2026-08-01"), status: "PENDING" },
  { id: "tl7", userName: "Marie Svobodová", type: "ANNUAL", startDate: new Date("2026-08-10"), endDate: new Date("2026-08-21"), status: "APPROVED" },
  { id: "tl8", userName: "Tomáš Dvořák", type: "PERSONAL", startDate: new Date("2026-05-12"), endDate: new Date("2026-05-12"), status: "APPROVED" },
  { id: "tl9", userName: "Lucie Kratochvílová", type: "ANNUAL", startDate: new Date("2026-09-01"), endDate: new Date("2026-09-12"), status: "PENDING" },
  { id: "tl10", userName: "Radek Pospíšil", type: "SICK", startDate: new Date("2026-05-05"), endDate: new Date("2026-05-06"), status: "APPROVED" },
  { id: "tl11", userName: "Jan Novák", type: "ANNUAL", startDate: new Date("2025-12-22"), endDate: new Date("2025-12-31"), status: "APPROVED" },
  { id: "tl12", userName: "Marie Svobodová", type: "ANNUAL", startDate: new Date("2025-12-27"), endDate: new Date("2025-12-31"), status: "APPROVED" },
  { id: "tl13", userName: "Lucie Kratochvílová", type: "HOMEOFFICE", startDate: new Date("2026-08-25"), endDate: new Date("2026-08-27"), status: "APPROVED" },
  { id: "tl14", userName: "Veronika Jelínková", type: "HOMEOFFICE", startDate: new Date("2026-08-27"), endDate: new Date("2026-08-27"), status: "APPROVED" },
  { id: "tl15", userName: "Tomáš Dvořák", type: "LEKAR", startDate: new Date("2026-08-27"), endDate: new Date("2026-08-27"), status: "APPROVED" },
  { id: "tl16", userName: "Klára Horáková", type: "HOMEOFFICE", startDate: relDay(0), endDate: relDay(0), status: "APPROVED" },
  { id: "tl17", userName: "Adéla Procházková", type: "HOMEOFFICE", startDate: relDay(0), endDate: relDay(1), status: "APPROVED" },
  { id: "tl18", userName: "Pavel Šimánek", type: "ANNUAL", startDate: relDay(-2), endDate: relDay(3), status: "APPROVED" },
  { id: "tl19", userName: "Martin Beneš", type: "SICK", startDate: relDay(0), endDate: relDay(1), status: "APPROVED" },
  { id: "tl20", userName: "Veronika Jelínková", type: "ANNUAL", startDate: relDay(7), endDate: relDay(11), status: "PENDING" },
]

export const DEMO_TEAM_LEAVES = TEAM_LEAVE_SEEDS.map((l) => ({
  id: l.id, userName: l.userName, department: departmentOf(l.userName),
  type: l.type, startDate: l.startDate, endDate: l.endDate, status: l.status,
}))

// Lidé, kteří za posledních 12 měsíců odešli — jen pro fluktuaci a vývoj počtu lidí.
const DEMO_DEPARTURES = [
  { name: "Filip Král", department: "Performance", employmentType: "ICO", startDate: new Date("2023-02-01"), endDate: new Date("2026-02-28") },
  { name: "Barbora Šťastná", department: "Creative", employmentType: "ICO", startDate: new Date("2024-04-01"), endDate: new Date("2026-06-30") },
  { name: "Lukáš Marek", department: "Head office", employmentType: "HPP", startDate: new Date("2025-09-01"), endDate: new Date("2026-09-15") },
]

const MONTH_SHORT = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čvn", "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro"]
// Posledních 12 měsíců končících tím aktuálním.
const LAST_12_MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(demoToday.getFullYear(), demoToday.getMonth() - 11 + i, 1)
  return { y: d.getFullYear(), m: d.getMonth() }
})
const monthEnd = (y: number, m: number) => new Date(y, m + 1, 0, 23, 59, 59)
const inMonth = (d: Date, y: number, m: number) => d.getFullYear() === y && d.getMonth() === m

/** Popisek období pro analytiku, např. „pro 2025 – lis 2026“. */
export const DEMO_ANALYTICS_PERIOD = (() => {
  const f = LAST_12_MONTHS[0], l = LAST_12_MONTHS[11]
  return `${MONTH_SHORT[f.m].toLowerCase()} ${f.y} – ${MONTH_SHORT[l.m].toLowerCase()} ${l.y}`
})()

export const DEMO_HEADCOUNT_TREND = LAST_12_MONTHS.map(({ y, m }) => {
  const end = monthEnd(y, m)
  const count =
    DEMO_TEAM.filter((p) => p.startDate <= end).length +
    DEMO_DEPARTURES.filter((d) => d.startDate <= end && d.endDate > end).length
  return { month: MONTH_SHORT[m], year: y, count }
})

export const DEMO_FLUCTUATION = LAST_12_MONTHS.map(({ y, m }) => ({
  month: MONTH_SHORT[m],
  nastupy: [...DEMO_TEAM, ...DEMO_DEPARTURES].filter((p) => inMonth(p.startDate, y, m)).length,
  odchody: DEMO_DEPARTURES.filter((d) => inMonth(d.endDate, y, m)).length,
}))

const avgHeadcount = DEMO_HEADCOUNT_TREND.reduce((s, x) => s + x.count, 0) / DEMO_HEADCOUNT_TREND.length
const round1 = (n: number) => Math.round(n * 10) / 10
const tenureMonths = (start: Date) =>
  Math.max(0, (demoToday.getFullYear() - start.getFullYear()) * 12 + demoToday.getMonth() - start.getMonth())

export const DEMO_TURNOVER_RATE = round1((DEMO_FLUCTUATION.reduce((s, x) => s + x.odchody, 0) / avgHeadcount) * 100)
export const DEMO_AVG_TENURE = round1(DEMO_TEAM.reduce((s, p) => s + tenureMonths(p.startDate), 0) / DEMO_TEAM.length)

export const DEMO_DEPARTMENT_HEADCOUNT = TEAM_DEPARTMENTS.map((department) => ({
  department, count: DEMO_TEAM.filter((m) => m.department === department).length,
}))

// Výkonnostní přehled pro analytiku (délka spolupráce, typy spolupráce) — všichni z DEMO_TEAM.
export const DEMO_EMPLOYEE_PERFORMANCE = DEMO_TEAM.map((p, i) => {
  const tenure = tenureMonths(p.startDate)
  const tasksTotal = 10 + ((i * 7) % 30)
  return {
    id: p.id,
    name: p.name,
    department: p.department,
    position: p.position,
    employmentType: p.employmentType,
    onboardingProgress: tenure < 3 ? 40 : tenure < 6 ? 80 : 100,
    leaveUsedPercent: (i * 13) % 70 + 10,
    tasksCompleted: tasksTotal - (i % 4),
    tasksTotal,
    attendanceRate: 90 + (i % 10),
    performanceScore: 75 + ((i * 11) % 24),
    lastReview: tenure < 6 ? null : new Date(demoToday.getFullYear(), (i * 5) % 12, 1),
    tenure,
  }
})

// Mzdové KPI pro admin — z platů / sazeb a hodin v DEMO_TEAM.
const EMPLOYER_LEVY = 1.338 // HPP: odvody zaměstnavatele
const monthlyCostOf = (p: PersonRecord) => {
  if (p.employmentType === "ICO") return (p.hourlyRate ?? 0) * (p.monthlyHours ?? 0) + (p.officeAmount ?? 0) + (p.refreshAmount ?? 0)
  if (p.employmentType === "HPP") return (p.monthlySalary ?? 0) * EMPLOYER_LEVY
  return p.monthlySalary ?? 0
}
const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0)

export const DEMO_HR_STATS = (() => {
  const people = DEMO_TEAM
  const paid = people.filter((p) => monthlyCostOf(p) > 0)
  const monthlyCost = Math.round(paid.reduce((s, p) => s + monthlyCostOf(p), 0))
  const totalHoursPerMonth = people.reduce((s, p) => s + (p.monthlyHours ?? 0), 0)
  const clientHoursPerMonth = people.reduce((s, p) => s + (p.clientHours ?? 0), 0)
  const n = people.length
  const countBy = (pred: (p: PersonRecord) => boolean) => people.filter(pred).length
  return {
    activePeople: n,
    paidPeople: paid.length,
    monthlyCost,
    annualCost: monthlyCost * 12,
    avgCostPerPerson: paid.length ? Math.round(monthlyCost / paid.length) : 0,
    totalHoursPerMonth,
    clientHoursPerMonth,
    efficiency: pct(clientHoursPerMonth, totalHoursPerMonth),
    costPerClientHour: clientHoursPerMonth ? Math.round(monthlyCost / clientHoursPerMonth) : 0,
    contractTypes: [
      { label: "HPP", value: "HPP" }, { label: "IČO", value: "ICO" }, { label: "DPP", value: "DPP" }, { label: "DPČ", value: "DPC" },
    ].map((t) => { const c = countBy((p) => p.employmentType === t.value); return { label: t.label, count: c, percent: pct(c, n) } }),
    seniority: [
      { label: "Junior", value: "JUNIOR" }, { label: "Medior", value: "MEDIOR" }, { label: "Senior", value: "SENIOR" }, { label: "Lead", value: "LEAD" },
    ].map((t) => { const c = countBy((p) => p.seniority === t.value); return { label: t.label, count: c, percent: pct(c, n) } }),
    departments: TEAM_DEPARTMENTS.map((d) => { const c = countBy((p) => p.department === d); return { label: d, count: c, percent: pct(c, n) } }),
  }
})()
