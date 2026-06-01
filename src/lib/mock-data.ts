// Demo mock data — no database required

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
  { id: "1", month: 5, year: 2024, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null },
  { id: "2", month: 4, year: 2024, grossAmount: 65000, netAmount: 47800, currency: "CZK", fileUrl: null },
  { id: "3", month: 3, year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null },
  { id: "4", month: 2, year: 2024, grossAmount: 62000, netAmount: 45500, currency: "CZK", fileUrl: null },
  { id: "5", month: 1, year: 2024, grossAmount: 60000, netAmount: 44200, currency: "CZK", fileUrl: null },
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
