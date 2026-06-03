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

// ── HR Dashboard Stats ─────────────────────────────────────────────────────

export const DEMO_HR_STATS = {
  activePeople: 27,
  paidPeople: 24,          // placení (HPP + IČO + DPP/DPČ)
  monthlyCost: 1123115,    // Kč
  annualCost: 13477380,    // Kč
  avgCostPerPerson: 46796, // Kč (z placených)
  totalHoursPerMonth: 3132,
  clientHoursPerMonth: 1527,
  efficiency: 49,          // %
  costPerClientHour: 736,  // Kč
  contractTypes: [
    { label: 'HPP',  count: 4,  percent: 15 },
    { label: 'IČO',  count: 21, percent: 78 },
    { label: 'DPP',  count: 2,  percent: 7  },
  ],
  seniority: [
    { label: 'Junior', count: 9,  percent: 33 },
    { label: 'Medior', count: 10, percent: 37 },
    { label: 'Senior', count: 5,  percent: 19 },
    { label: 'Lead',   count: 0,  percent: 0  },
  ],
  departments: [
    { label: 'Creative',    count: 10, percent: 37 },
    { label: 'Performance', count: 8,  percent: 30 },
    { label: 'Account',     count: 3,  percent: 11 },
    { label: 'Sales',       count: 3,  percent: 11 },
    { label: 'Backoffice',  count: 2,  percent: 7  },
    { label: 'HR',          count: 1,  percent: 4  },
  ],
}

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
  // HR fields
  seniority: "MEDIOR",
  monthlyHours: 168,
  clientHours: 120,
  monthlySalary: 65000,
  hourlyRate: null as number | null,
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

// ── Team directory ──────────────────────────────────────────────────────────

export const TEAM_DEPARTMENTS = [
  'Creative', 'Performance', 'Account', 'Sales', 'Backoffice', 'HR',
]

export const DEMO_TEAM: {
  id: string; name: string; position: string; department: string
  seniority: string | null; employmentType: string; birthday: string | null
  bio: string | null; emoji: string
}[] = [
  { id: "t1",  name: "Petra Nováková",    position: "HR Manager",           department: "HR",          seniority: "SENIOR", employmentType: "HPP", birthday: "1988-03-15", bio: "Mám ráda lidi, kávu a pořádek.", emoji: "🌿" },
  { id: "t2",  name: "Jan Novák",          position: "Frontend Developer",   department: "Creative",    seniority: "MEDIOR", employmentType: "HPP", birthday: "1990-05-20", bio: "React, TypeScript a dobrý coffee.", emoji: "💻" },
  { id: "t3",  name: "Marie Svobodová",    position: "Social Media Manager", department: "Performance", seniority: "JUNIOR", employmentType: "DPP", birthday: "1997-11-03", bio: "Tvořím obsah, který lidi zastaví při scrollování.", emoji: "📱" },
  { id: "t4",  name: "Tomáš Dvořák",       position: "Account Manager",      department: "Account",     seniority: "SENIOR", employmentType: "ICO", birthday: "1985-07-22", bio: "Klienti jsou základ. Rád řeším výzvy.", emoji: "🤝" },
  { id: "t5",  name: "Lucie Kratochvílová",position: "Art Director",         department: "Creative",    seniority: "SENIOR", employmentType: "ICO", birthday: "1991-02-08", bio: "Vizuál je moje řeč. Pixely jsou moji přátelé.", emoji: "🎨" },
  { id: "t6",  name: "Ondřej Mašek",       position: "Performance Specialist",department:"Performance", seniority: "MEDIOR", employmentType: "ICO", birthday: "1993-09-14", bio: "PPC, data a ROAS. Čísla mě baví.", emoji: "📊" },
  { id: "t7",  name: "Klára Horáková",     position: "Copywriter",           department: "Creative",    seniority: "JUNIOR", employmentType: "ICO", birthday: "1999-04-01", bio: "Slova jsou moje superschopnost.", emoji: "✍️" },
  { id: "t8",  name: "Martin Beneš",       position: "Sales Manager",        department: "Sales",       seniority: "SENIOR", employmentType: "ICO", birthday: "1984-12-19", bio: "Obchod mi jde přirozeně. Rád poznávám nové lidi.", emoji: "🚀" },
  { id: "t9",  name: "Veronika Jelínková", position: "Project Manager",      department: "Account",     seniority: "MEDIOR", employmentType: "ICO", birthday: "1994-06-30", bio: "Deadline je pro mě výzva, ne hrozba.", emoji: "📋" },
  { id: "t10", name: "Pavel Šimánek",      position: "Motion Designer",      department: "Creative",    seniority: "MEDIOR", employmentType: "ICO", birthday: "1992-08-11", bio: "Video a animace. After Effects je můj hřiště.", emoji: "🎬" },
  { id: "t11", name: "Adéla Procházková",  position: "SEO Specialist",       department: "Performance", seniority: "JUNIOR", employmentType: "ICO", birthday: "1998-01-25", bio: "Google mě nezklame — já ho taky ne.", emoji: "🔍" },
  { id: "t12", name: "Jakub Veselý",       position: "Graphic Designer",     department: "Creative",    seniority: "JUNIOR", employmentType: "ICO", birthday: "2000-05-05", bio: "Figma, Illustrator a dobrá muzika v pozadí.", emoji: "🖌️" },
  { id: "t13", name: "Michaela Červenková",position: "Office Manager",       department: "Backoffice",  seniority: "MEDIOR", employmentType: "HPP", birthday: "1989-10-17", bio: "Kancelář šlape díky mně. A já to miluju.", emoji: "🏠" },
  { id: "t14", name: "Radek Pospíšil",     position: "Business Developer",   department: "Sales",       seniority: "MEDIOR", employmentType: "ICO", birthday: "1991-03-28", bio: "Nové příležitosti a partnerství jsou moje parketa.", emoji: "💼" },
  { id: "t15", name: "Tereza Müllerová",   position: "Email Marketing Spec.",department: "Performance", seniority: "JUNIOR", employmentType: "ICO", birthday: "1996-07-09", bio: "Každý e-mail je příběh. Otevírací rate mi to potvrdí.", emoji: "📧" },
]

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

// tag: SMLOUVA | DODATEK | GDPR | NDA  (for contracts section)
// type: CONTRACT | PAYSLIP
export const DEMO_DOCUMENTS = [
  // Smlouvy
  { id: "c1", name: "Pracovní smlouva", type: "CONTRACT", tag: "SMLOUVA", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  { id: "c2", name: "Dodatek č. 1 — změna pozice", type: "CONTRACT", tag: "DODATEK", createdAt: new Date("2024-06-01"), uploadedAt: new Date("2024-06-01"), signedAt: new Date("2024-06-03"), url: "#" },
  { id: "c3", name: "GDPR souhlas se zpracováním osobních údajů", type: "CONTRACT", tag: "GDPR", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  { id: "c4", name: "NDA — dohoda o mlčenlivosti", type: "CONTRACT", tag: "NDA", createdAt: new Date("2024-01-10"), uploadedAt: new Date("2024-01-10"), signedAt: new Date("2024-01-12"), url: "#" },
  // Výplatní pásky (HPP only)
  { id: "p1",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 12, year: 2025, createdAt: new Date("2026-01-05"), uploadedAt: new Date("2026-01-05"), signedAt: null, url: "#" },
  { id: "p2",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 11, year: 2025, createdAt: new Date("2025-12-05"), uploadedAt: new Date("2025-12-05"), signedAt: null, url: "#" },
  { id: "p3",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 10, year: 2025, createdAt: new Date("2025-11-05"), uploadedAt: new Date("2025-11-05"), signedAt: null, url: "#" },
  { id: "p4",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 9,  year: 2025, createdAt: new Date("2025-10-05"), uploadedAt: new Date("2025-10-05"), signedAt: null, url: "#" },
  { id: "p5",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 8,  year: 2025, createdAt: new Date("2025-09-05"), uploadedAt: new Date("2025-09-05"), signedAt: null, url: "#" },
  { id: "p6",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 7,  year: 2025, createdAt: new Date("2025-08-05"), uploadedAt: new Date("2025-08-05"), signedAt: null, url: "#" },
  { id: "p7",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 6,  year: 2025, createdAt: new Date("2025-07-05"), uploadedAt: new Date("2025-07-05"), signedAt: null, url: "#" },
  { id: "p8",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 5,  year: 2025, createdAt: new Date("2025-06-05"), uploadedAt: new Date("2025-06-05"), signedAt: null, url: "#" },
  { id: "p9",  name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 4,  year: 2025, createdAt: new Date("2025-05-05"), uploadedAt: new Date("2025-05-05"), signedAt: null, url: "#" },
  { id: "p10", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 3,  year: 2025, createdAt: new Date("2025-04-05"), uploadedAt: new Date("2025-04-05"), signedAt: null, url: "#" },
  { id: "p11", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 2,  year: 2025, createdAt: new Date("2025-03-05"), uploadedAt: new Date("2025-03-05"), signedAt: null, url: "#" },
  { id: "p12", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 1,  year: 2025, createdAt: new Date("2025-02-05"), uploadedAt: new Date("2025-02-05"), signedAt: null, url: "#" },
  { id: "p13", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 12, year: 2024, createdAt: new Date("2025-01-05"), uploadedAt: new Date("2025-01-05"), signedAt: null, url: "#" },
  { id: "p14", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 11, year: 2024, createdAt: new Date("2024-12-05"), uploadedAt: new Date("2024-12-05"), signedAt: null, url: "#" },
  { id: "p15", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 10, year: 2024, createdAt: new Date("2024-11-05"), uploadedAt: new Date("2024-11-05"), signedAt: null, url: "#" },
  { id: "p16", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 9,  year: 2024, createdAt: new Date("2024-10-05"), uploadedAt: new Date("2024-10-05"), signedAt: null, url: "#" },
  { id: "p17", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 8,  year: 2024, createdAt: new Date("2024-09-05"), uploadedAt: new Date("2024-09-05"), signedAt: null, url: "#" },
  { id: "p18", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 7,  year: 2024, createdAt: new Date("2024-08-05"), uploadedAt: new Date("2024-08-05"), signedAt: null, url: "#" },
  { id: "p19", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 6,  year: 2024, createdAt: new Date("2024-07-05"), uploadedAt: new Date("2024-07-05"), signedAt: null, url: "#" },
  { id: "p20", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 5,  year: 2024, createdAt: new Date("2024-06-05"), uploadedAt: new Date("2024-06-05"), signedAt: null, url: "#" },
  { id: "p21", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 4,  year: 2024, createdAt: new Date("2024-05-05"), uploadedAt: new Date("2024-05-05"), signedAt: null, url: "#" },
  { id: "p22", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 3,  year: 2024, createdAt: new Date("2024-04-05"), uploadedAt: new Date("2024-04-05"), signedAt: null, url: "#" },
  { id: "p23", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 2,  year: 2024, createdAt: new Date("2024-03-05"), uploadedAt: new Date("2024-03-05"), signedAt: null, url: "#" },
  { id: "p24", name: "Výplatní páska", type: "PAYSLIP", tag: null, month: 1,  year: 2024, createdAt: new Date("2024-02-05"), uploadedAt: new Date("2024-02-05"), signedAt: null, url: "#" },
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
    department: "Creative",
    position: "Frontend Developer",
    employmentType: "HPP",
    startDate: new Date("2024-01-15"),
    seniority: "MEDIOR",
    monthlyHours: 168,
    clientHours: 120,
    monthlySalary: 65000,
    hourlyRate: null as number | null,
    leaveBalances: [{ annualTotal: 20, annualUsed: 5 }],
    onboardingTasks: DEMO_ONBOARDING_TASKS,
  },
  {
    id: "demo-employee-2",
    name: "Marie Svobodová",
    email: "marie.svobodova@fourbros.cz",
    department: "Performance",
    position: "Marketing Specialist",
    employmentType: "DPP",
    startDate: new Date("2023-06-01"),
    seniority: "JUNIOR",
    monthlyHours: 80,
    clientHours: 60,
    monthlySalary: 28000,
    hourlyRate: null as number | null,
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
    department: "Account",
    position: "Account Manager",
    employmentType: "ICO",
    startDate: new Date("2022-03-15"),
    seniority: "SENIOR",
    monthlyHours: 140,
    clientHours: 110,
    monthlySalary: null as number | null,
    hourlyRate: 1200,
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
<p>uzavřená podle § 33 zákona č. 262/2006 Sb., zákoníku práce, v platném znění</p>

<h3>Smluvní strany</h3>
<p><strong>Zaměstnavatel:</strong> Four Bros s.r.o., IČO: 12345678, se sídlem Náměstí Míru 5, Praha 2</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Předmět smlouvy</h3>
<p>Zaměstnavatel přijímá zaměstnance na pozici <strong>{{POZICE}}</strong> s místem výkonu práce Praha.</p>

<h3>Základní mzdové podmínky</h3>
<p>Zaměstnanci náleží základní měsíční mzda ve výši <strong>{{MZDA}} Kč</strong> hrubého.</p>

<h3>Nástup do práce</h3>
<p>Zaměstnanec nastupuje do práce dne <strong>{{DATUM_NASTUPU}}</strong>.</p>

<h3>Zkušební doba</h3>
<p>Sjednává se zkušební doba v délce 3 měsíců od nástupu do práce.</p>

<h3>Pracovní doba</h3>
<p>Týdenní pracovní doba činí {{TYDENNI_UVAZEK}} hodin.</p>

<p>V Praze dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["JMENO", "POZICE", "MZDA", "DATUM_NASTUPU", "TYDENNI_UVAZEK", "DATUM_PODPISU"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "tpl-2",
    name: "DPP Dohoda o provedení práce",
    type: "DPP",
    description: "Dohoda o provedení práce pro spolupráci na konkrétních projektech nebo úkolech.",
    body: `<h2>DOHODA O PROVEDENÍ PRÁCE</h2>
<p>uzavřená podle § 75 zákona č. 262/2006 Sb., zákoníku práce, v platném znění</p>

<h3>Smluvní strany</h3>
<p><strong>Zaměstnavatel:</strong> Four Bros s.r.o., IČO: 12345678, se sídlem Náměstí Míru 5, Praha 2</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Sjednaná práce</h3>
<p>Předmětem dohody je výkon práce na pozici <strong>{{POZICE}}</strong>.</p>

<h3>Odměna</h3>
<p>Za provedenou práci přísluší zaměstnanci odměna ve výši <strong>{{HODINOVA_SAZBA}} Kč/hod</strong>.</p>

<h3>Rozsah práce</h3>
<p>Rozsah práce nepřesáhne {{MAX_HODIN}} hodin za rok.</p>

<h3>Doba trvání dohody</h3>
<p>Dohoda se sjednává od {{DATUM_NASTUPU}} do {{DATUM_UKONCENI}}.</p>

<p>V Praze dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["JMENO", "POZICE", "HODINOVA_SAZBA", "MAX_HODIN", "DATUM_NASTUPU", "DATUM_UKONCENI", "DATUM_PODPISU"],
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
<p><strong>Zaměstnavatel:</strong> Four Bros s.r.o., IČO: 12345678, se sídlem Náměstí Míru 5, Praha 2</p>
<p><strong>Zaměstnanec:</strong> {{JMENO}}</p>

<h3>Předmět dodatku</h3>
<p>Smluvní strany se dohodly na následující změně pracovní smlouvy ze dne {{DATUM_PUVODNI_SMLOUVY}}:</p>

<h3>Změna podmínek</h3>
<p>{{POPIS_ZMENY}}</p>

<h3>Nová mzda</h3>
<p>S účinností od <strong>{{DATUM_UCINNOSTI}}</strong> se mzda stanovuje na <strong>{{NOVA_MZDA}} Kč</strong> hrubého měsíčně.</p>

<p>Ostatní podmínky pracovní smlouvy zůstávají v platnosti.</p>

<p>V Praze dne {{DATUM_PODPISU}}</p>`,
    placeholders: ["CISLO_DODATKU", "JMENO", "DATUM_PUVODNI_SMLOUVY", "POPIS_ZMENY", "DATUM_UCINNOSTI", "NOVA_MZDA", "DATUM_PODPISU"],
    createdAt: new Date("2024-01-01"),
  },
]

export const DEMO_CONTRACTS: Contract[] = [
  {
    id: "c1",
    templateId: "tpl-1",
    templateName: "HPP Pracovní smlouva",
    employeeId: "demo-employee-1",
    employeeName: "Jan Novák",
    status: "DRAFT",
    createdAt: new Date("2026-05-20"),
    sentToManagementAt: null,
    managementSignedAt: null,
    managementSignedBy: null,
    sentToEmployeeAt: null,
    employeeSignedAt: null,
    values: {
      JMENO: "Jan Novák",
      POZICE: "Frontend Developer",
      MZDA: "70 000",
      DATUM_NASTUPU: "1. 6. 2026",
      TYDENNI_UVAZEK: "40",
      DATUM_PODPISU: "20. 5. 2026",
    },
    notes: "Navýšení mzdy po uplynutí zkušební doby.",
  },
  {
    id: "c2",
    templateId: "tpl-2",
    templateName: "DPP Dohoda o provedení práce",
    employeeId: "demo-employee-2",
    employeeName: "Marie Svobodová",
    status: "PENDING_MANAGEMENT",
    createdAt: new Date("2026-05-15"),
    sentToManagementAt: new Date("2026-05-16"),
    managementSignedAt: null,
    managementSignedBy: null,
    sentToEmployeeAt: null,
    employeeSignedAt: null,
    values: {
      JMENO: "Marie Svobodová",
      POZICE: "Social Media Specialist",
      HODINOVA_SAZBA: "350",
      MAX_HODIN: "300",
      DATUM_NASTUPU: "1. 6. 2026",
      DATUM_UKONCENI: "31. 12. 2026",
      DATUM_PODPISU: "15. 5. 2026",
    },
    notes: null,
  },
  {
    id: "c3",
    templateId: "tpl-3",
    templateName: "Dodatek ke smlouvě",
    employeeId: "demo-employee-1",
    employeeName: "Jan Novák",
    status: "PENDING_EMPLOYEE",
    createdAt: new Date("2026-04-01"),
    sentToManagementAt: new Date("2026-04-02"),
    managementSignedAt: new Date("2026-04-05"),
    managementSignedBy: "Petra Nováková",
    sentToEmployeeAt: new Date("2026-04-06"),
    employeeSignedAt: null,
    values: {
      CISLO_DODATKU: "1",
      JMENO: "Jan Novák",
      DATUM_PUVODNI_SMLOUVY: "15. 1. 2024",
      POPIS_ZMENY: "Změna pracovní pozice na Senior Frontend Developer.",
      DATUM_UCINNOSTI: "1. 5. 2026",
      NOVA_MZDA: "75 000",
      DATUM_PODPISU: "1. 4. 2026",
    },
    notes: "Povýšení po vyhodnocení výkonu Q1 2026.",
  },
  {
    id: "c4",
    templateId: "tpl-1",
    templateName: "HPP Pracovní smlouva",
    employeeId: "demo-employee-3",
    employeeName: "Tomáš Dvořák",
    status: "SIGNED",
    createdAt: new Date("2026-01-10"),
    sentToManagementAt: new Date("2026-01-11"),
    managementSignedAt: new Date("2026-01-15"),
    managementSignedBy: "Petra Nováková",
    sentToEmployeeAt: new Date("2026-01-16"),
    employeeSignedAt: new Date("2026-01-20"),
    values: {
      JMENO: "Tomáš Dvořák",
      POZICE: "Account Manager",
      MZDA: "85 000",
      DATUM_NASTUPU: "1. 2. 2026",
      TYDENNI_UVAZEK: "40",
      DATUM_PODPISU: "10. 1. 2026",
    },
    notes: null,
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
    createdBy: 'Petra Nováková',
    acknowledgements: [],
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
