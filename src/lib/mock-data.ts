// Demo mock data — no database required

// ── Team Leave Calendar ────────────────────────────────────────────────────

export const DEMO_TEAM_LEAVES = [
  // 2026 – current year leaves
  { id: "tl1", userName: "Jan Novák", department: "Vývoj", type: "ANNUAL", startDate: new Date("2026-05-26"), endDate: new Date("2026-05-30"), status: "APPROVED" },
  { id: "tl2", userName: "Marie Svobodová", department: "Marketing", type: "ANNUAL", startDate: new Date("2026-06-09"), endDate: new Date("2026-06-20"), status: "APPROVED" },
  { id: "tl3", userName: "Tomáš Dvořák", department: "Obchod", type: "ANNUAL", startDate: new Date("2026-06-15"), endDate: new Date("2026-06-19"), status: "APPROVED" },
  { id: "tl4", userName: "Lucie Kratochvílová", department: "Finance", type: "SICK", startDate: new Date("2026-06-02"), endDate: new Date("2026-06-03"), status: "APPROVED" },
  { id: "tl5", userName: "Ondřej Pospíšil", department: "Vývoj", type: "ANNUAL", startDate: new Date("2026-07-07"), endDate: new Date("2026-07-18"), status: "APPROVED" },
  { id: "tl6", userName: "Jan Novák", department: "Vývoj", type: "ANNUAL", startDate: new Date("2026-07-21"), endDate: new Date("2026-08-01"), status: "PENDING" },
  { id: "tl7", userName: "Marie Svobodová", department: "Marketing", type: "ANNUAL", startDate: new Date("2026-08-10"), endDate: new Date("2026-08-21"), status: "APPROVED" },
  { id: "tl8", userName: "Tomáš Dvořák", department: "Obchod", type: "PERSONAL", startDate: new Date("2026-05-12"), endDate: new Date("2026-05-12"), status: "APPROVED" },
  { id: "tl9", userName: "Lucie Kratochvílová", department: "Finance", type: "ANNUAL", startDate: new Date("2026-09-01"), endDate: new Date("2026-09-12"), status: "PENDING" },
  { id: "tl10", userName: "Ondřej Pospíšil", department: "Vývoj", type: "SICK", startDate: new Date("2026-05-05"), endDate: new Date("2026-05-06"), status: "APPROVED" },
  { id: "tl11", userName: "Jan Novák", department: "Vývoj", type: "ANNUAL", startDate: new Date("2025-12-22"), endDate: new Date("2025-12-31"), status: "APPROVED" },
  { id: "tl12", userName: "Marie Svobodová", department: "Marketing", type: "ANNUAL", startDate: new Date("2025-12-27"), endDate: new Date("2025-12-31"), status: "APPROVED" },
]

// ── Analytics ──────────────────────────────────────────────────────────────

export const DEMO_HEADCOUNT_TREND = [
  { month: "Led", year: 2024, count: 18 },
  { month: "Úno", year: 2024, count: 19 },
  { month: "Bře", year: 2024, count: 21 },
  { month: "Dub", year: 2024, count: 21 },
  { month: "Kvě", year: 2024, count: 23 },
  { month: "Čvn", year: 2024, count: 22 },
  { month: "Čvc", year: 2024, count: 22 },
  { month: "Srp", year: 2024, count: 24 },
  { month: "Zář", year: 2024, count: 25 },
  { month: "Říj", year: 2024, count: 26 },
  { month: "Lis", year: 2024, count: 26 },
  { month: "Pro", year: 2024, count: 27 },
]

export const DEMO_FLUCTUATION = [
  { month: "Led", nastupy: 2, odchody: 1 },
  { month: "Úno", nastupy: 1, odchody: 0 },
  { month: "Bře", nastupy: 3, odchody: 1 },
  { month: "Dub", nastupy: 1, odchody: 1 },
  { month: "Kvě", nastupy: 2, odchody: 0 },
  { month: "Čvn", nastupy: 0, odchody: 1 },
  { month: "Čvc", nastupy: 1, odchody: 1 },
  { month: "Srp", nastupy: 3, odchody: 1 },
  { month: "Zář", nastupy: 2, odchody: 1 },
  { month: "Říj", nastupy: 2, odchody: 1 },
  { month: "Lis", nastupy: 1, odchody: 1 },
  { month: "Pro", nastupy: 2, odchody: 1 },
]

export const DEMO_DEPARTMENT_HEADCOUNT = [
  { department: "Vývoj", count: 8 },
  { department: "Marketing", count: 4 },
  { department: "Obchod", count: 6 },
  { department: "HR", count: 2 },
  { department: "Finance", count: 3 },
  { department: "Operace", count: 4 },
]

export const DEMO_EMPLOYEE_PERFORMANCE = [
  {
    id: "demo-employee-1",
    name: "Jan Novák",
    department: "Vývoj",
    position: "Frontend Developer",
    employmentType: "HPP",
    onboardingProgress: 40,
    leaveUsedPercent: 25,
    tasksCompleted: 12,
    tasksTotal: 15,
    attendanceRate: 96,
    performanceScore: 88,
    lastReview: new Date("2024-09-01"),
    tenure: 11, // months
  },
  {
    id: "demo-employee-2",
    name: "Marie Svobodová",
    department: "Marketing",
    position: "Marketing Specialist",
    employmentType: "DPP",
    onboardingProgress: 100,
    leaveUsedPercent: 40,
    tasksCompleted: 28,
    tasksTotal: 30,
    attendanceRate: 99,
    performanceScore: 94,
    lastReview: new Date("2024-10-15"),
    tenure: 18,
  },
  {
    id: "demo-employee-3",
    name: "Tomáš Dvořák",
    department: "Obchod",
    position: "Sales Manager",
    employmentType: "ICO",
    onboardingProgress: 100,
    leaveUsedPercent: 60,
    tasksCompleted: 45,
    tasksTotal: 50,
    attendanceRate: 91,
    performanceScore: 79,
    lastReview: new Date("2024-08-01"),
    tenure: 27,
  },
  {
    id: "demo-employee-4",
    name: "Lucie Kratochvílová",
    department: "Finance",
    position: "Finanční analytik",
    employmentType: "HPP",
    onboardingProgress: 100,
    leaveUsedPercent: 50,
    tasksCompleted: 33,
    tasksTotal: 35,
    attendanceRate: 98,
    performanceScore: 91,
    lastReview: new Date("2024-11-01"),
    tenure: 14,
  },
  {
    id: "demo-employee-5",
    name: "Ondřej Pospíšil",
    department: "Vývoj",
    position: "Backend Developer",
    employmentType: "HPP",
    onboardingProgress: 80,
    leaveUsedPercent: 15,
    tasksCompleted: 8,
    tasksTotal: 12,
    attendanceRate: 94,
    performanceScore: 82,
    lastReview: null,
    tenure: 4,
  },
]

export const DEMO_TURNOVER_RATE = 8.3
export const DEMO_AVG_TENURE = 16.2
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

export const DEMO_EXPENSE_REQUESTS = [
  { id: "exp1", title: "Taxi na klientské jednání", amount: 350,  currency: "CZK", submittedAt: new Date("2026-05-28"), status: "PENDING",  category: "CESTOVNÉ" },
  { id: "exp2", title: "Oběd s klientem",           amount: 890,  currency: "CZK", submittedAt: new Date("2026-05-20"), status: "APPROVED", category: "REPREZENTACE" },
  { id: "exp3", title: "Nákup knih – školení",       amount: 1250, currency: "CZK", submittedAt: new Date("2026-05-10"), status: "APPROVED", category: "VZDĚLÁVÁNÍ" },
]

// ── Salary Raise Info ─────────────────────────────────────────────────────

export const DEMO_SALARY_INFO = {
  currentSalary: 65000,
  currency: "CZK",
  nextRaiseDate: new Date("2026-10-01"),
  nextRaiseAmount: 5000,
  lastRaiseDate: new Date("2025-10-01"),
}

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
  { value: "ICO", label: "IČO – Spolupráce na živnostenský list" },
  { value: "STAZ", label: "Stáž" },
]

export const DEMO_USER = {
  id: "demo-employee-1",
  email: "jan.novak@fourbros.cz",
  name: "Jan Novák",
  role: "EMPLOYEE",
  department: "Vývoj",
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
  offboardingUnlocked: false,
}

export const DEMO_ADMIN = {
  id: "demo-admin-1",
  email: "admin@fourbros.cz",
  name: "Petra Nováková",
  role: "ADMIN",
  department: "HR",
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
}

export const DEMO_ONBOARDING_TASKS = [
  { id: "1", title: "Vyplnit osobní údaje", description: "Doplňte všechny osobní údaje v profilu", completed: true, completedAt: new Date("2024-01-16"), order: 1 },
  { id: "2", title: "Podepsat pracovní smlouvu", description: "Přečtěte a podepište svoji pracovní smlouvu", completed: true, completedAt: new Date("2024-01-17"), order: 2 },
  { id: "3", title: "Nahrát kopii občanského průkazu", description: "Nahrajte scan nebo foto vašeho OP", completed: false, completedAt: null, order: 3 },
  { id: "4", title: "Nastavit bankovní účet pro výplatu", description: "Doplňte bankovní účet v sekci Profil", completed: false, completedAt: null, order: 4 },
  { id: "5", title: "Absolvovat BOZP školení", description: "Dokončete online školení bezpečnosti práce", completed: false, completedAt: null, order: 5 },
]

export const DEMO_OFFBOARDING_TASKS = [
  { id: "off-1", title: "Vrátit firemní vybavení", description: "Notebook, telefon, klíče a veškeré firemní vybavení předejte osobně na HR.", completed: false, completedAt: null, order: 1 },
  { id: "off-2", title: "Předat přístupy a hesla", description: "Předejte správci IT všechna hesla, přístupy a API klíče, ke kterým máte přístup.", completed: false, completedAt: null, order: 2 },
  { id: "off-3", title: "Dokončit předávací protokol klientů", description: "Předejte klienty a projekty určenému kolegovi dle pokynů teamleadera.", completed: false, completedAt: null, order: 3 },
  { id: "off-4", title: "Podepsat výstupní dokumenty", description: "Přečtěte a podepište výstupní dokumenty (dohoda o ukončení, NDA apod.).", completed: false, completedAt: null, order: 4 },
  { id: "off-5", title: "Smazat firemní data z osobních zařízení", description: "Odstraňte veškeré firemní aplikace, dokumenty a přístupy ze svých osobních zařízení.", completed: false, completedAt: null, order: 5 },
  { id: "off-6", title: "Poslední výplatní páska / faktura", description: "Zkontrolujte závěrečné vyúčtování a potvrďte správnost poslední výplaty nebo faktury.", completed: false, completedAt: null, order: 6 },
  { id: "off-7", title: "Exit interview s HR", description: "Absolvujte závěrečný rozhovor s HR. Vaše zpětná vazba je pro nás cenná.", completed: false, completedAt: null, order: 7 },
]

export const DEMO_DOCUMENTS = [
  { id: "1", name: "Pracovní smlouva 2024", type: "CONTRACT", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  { id: "2", name: "GDPR souhlas", type: "OTHER", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: null, url: "#" },
  { id: "3", name: "Výplatní páska Leden 2024", type: "PAYSLIP", createdAt: new Date("2024-02-01"), uploadedAt: new Date("2024-02-01"), signedAt: null, url: "#" },
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

export const DEMO_PAYSLIPS = [
  // 2026 — future (planned salary, no payslip yet)
  { id: "f12", month: 12, year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f11", month: 11, year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f10", month: 10, year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f9",  month: 9,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f8",  month: 8,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f7",  month: 7,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f6",  month: 6,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f5",  month: 5,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f4",  month: 4,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f3",  month: 3,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f2",  month: 2,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  { id: "f1",  month: 1,  year: 2026, grossAmount: 70000, netAmount: 51200, currency: "CZK", fileUrl: null, planned: true },
  // 2025 — current year
  { id: "25-12", month: 12, year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-11", month: 11, year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-10", month: 10, year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-9",  month: 9,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-8",  month: 8,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-7",  month: 7,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-6",  month: 6,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-5",  month: 5,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-4",  month: 4,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-3",  month: 3,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-2",  month: 2,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  { id: "25-1",  month: 1,  year: 2025, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null, planned: false },
  // 2024 — previous year
  { id: "24-12", month: 12, year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-11", month: 11, year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-10", month: 10, year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-9",  month: 9,  year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-8",  month: 8,  year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-7",  month: 7,  year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-6",  month: 6,  year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-5",  month: 5,  year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-4",  month: 4,  year: 2024, grossAmount: 60000, netAmount: 44200, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-3",  month: 3,  year: 2024, grossAmount: 60000, netAmount: 44200, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-2",  month: 2,  year: 2024, grossAmount: 60000, netAmount: 44200, currency: "CZK", fileUrl: null, planned: false },
  { id: "24-1",  month: 1,  year: 2024, grossAmount: 60000, netAmount: 44200, currency: "CZK", fileUrl: null, planned: false },
  // 2023
  { id: "23-12", month: 12, year: 2023, grossAmount: 58000, netAmount: 42600, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-11", month: 11, year: 2023, grossAmount: 58000, netAmount: 42600, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-10", month: 10, year: 2023, grossAmount: 58000, netAmount: 42600, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-9",  month: 9,  year: 2023, grossAmount: 58000, netAmount: 42600, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-8",  month: 8,  year: 2023, grossAmount: 58000, netAmount: 42600, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-7",  month: 7,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-6",  month: 6,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-5",  month: 5,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-4",  month: 4,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-3",  month: 3,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-2",  month: 2,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
  { id: "23-1",  month: 1,  year: 2023, grossAmount: 55000, netAmount: 40500, currency: "CZK", fileUrl: null, planned: false },
]

export const DEMO_EMPLOYEES = [
  {
    id: "demo-employee-1",
    name: "Jan Novák",
    email: "jan.novak@fourbros.cz",
    department: "Vývoj",
    position: "Frontend Developer",
    employmentType: "HPP",
    startDate: new Date("2024-01-15"),
    leaveBalances: [{ annualTotal: 20, annualUsed: 5 }],
    onboardingTasks: DEMO_ONBOARDING_TASKS,
  },
  {
    id: "demo-employee-2",
    name: "Marie Svobodová",
    email: "marie.svobodova@fourbros.cz",
    department: "Marketing",
    position: "Marketing Specialist",
    employmentType: "DPP",
    startDate: new Date("2023-06-01"),
    leaveBalances: [{ annualTotal: 20, annualUsed: 8 }],
    onboardingTasks: [
      { id: "6", title: "Vyplnit osobní údaje", completed: true, completedAt: new Date("2023-06-02"), order: 1 },
      { id: "7", title: "Podepsat pracovní smlouvu", completed: true, completedAt: new Date("2023-06-03"), order: 2 },
      { id: "8", title: "Nahrát kopii občanského průkazu", completed: true, completedAt: new Date("2023-06-04"), order: 3 },
      { id: "9", title: "Absolvovat BOZP školení", completed: true, completedAt: new Date("2023-06-10"), order: 4 },
    ],
  },
  {
    id: "demo-employee-3",
    name: "Tomáš Dvořák",
    email: "tomas.dvorak@fourbros.cz",
    department: "Obchod",
    position: "Sales Manager",
    employmentType: "ICO",
    startDate: new Date("2022-03-15"),
    leaveBalances: [{ annualTotal: 20, annualUsed: 12 }],
    onboardingTasks: [
      { id: "10", title: "Vyplnit osobní údaje", completed: true, completedAt: new Date("2022-03-16"), order: 1 },
      { id: "11", title: "Podepsat pracovní smlouvu", completed: true, completedAt: new Date("2022-03-17"), order: 2 },
    ],
  },
]

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
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Vývoj" },
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
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Vývoj" },
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
    user: { name: "Jan Novák", email: "jan.novak@fourbros.cz", department: "Vývoj" },
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
    user: { name: "Marie Svobodová", email: "marie.svobodova@fourbros.cz", department: "Marketing" },
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
    user: { name: "Tomáš Dvořák", email: "tomas.dvorak@fourbros.cz", department: "Obchod" },
  },
]
