import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fourbros.cz' },
    update: {},
    create: {
      email: 'admin@fourbros.cz',
      name: 'HR Administrator',
      role: 'ADMIN',
      department: 'HR',
      position: 'HR Manager',
      startDate: new Date('2020-01-01'),
      phone: '+420 777 000 001',
    },
  })
  console.log('Created admin:', admin.email)

  // Create sample employee
  const employee = await prisma.user.upsert({
    where: { email: 'jan.novak@fourbros.cz' },
    update: {},
    create: {
      email: 'jan.novak@fourbros.cz',
      name: 'Jan Novák',
      role: 'EMPLOYEE',
      department: 'Vývoj',
      position: 'Senior Developer',
      startDate: new Date('2023-03-15'),
      phone: '+420 777 123 456',
      city: 'Praha',
      country: 'CZ',
    },
  })
  console.log('Created employee:', employee.email)

  // Create onboarding tasks for employee
  const tasks = [
    { title: 'Vyplnit osobní informace', description: 'Doplňte všechny osobní údaje v profilu', order: 1 },
    { title: 'Podepsat pracovní smlouvu', description: 'Přečtěte a podepište svoji pracovní smlouvu', order: 2 },
    { title: 'Nahrát kopii občanského průkazu', description: 'Nahrajte scan nebo foto vašeho OP', order: 3 },
    { title: 'Vyplnit kontakt pro případ nouze', description: 'Přidejte kontakt na osobu blízkou', order: 4 },
    { title: 'Absolvovat BOZP školení', description: 'Dokončete online školení bezpečnosti práce', order: 5, completed: true, completedAt: new Date() },
  ]

  for (const task of tasks) {
    await prisma.onboardingTask.upsert({
      where: { id: `seed-task-${task.order}-${employee.id}` },
      update: {},
      create: {
        id: `seed-task-${task.order}-${employee.id}`,
        userId: employee.id,
        title: task.title,
        description: task.description,
        order: task.order,
        completed: task.completed ?? false,
        completedAt: task.completedAt ?? null,
      },
    })
  }

  // Create leave balance for current year
  const currentYear = new Date().getFullYear()
  await prisma.leaveBalance.upsert({
    where: { userId_year: { userId: employee.id, year: currentYear } },
    update: {},
    create: {
      userId: employee.id,
      year: currentYear,
      annualTotal: 20,
      annualUsed: 5,
      sickTotal: 10,
      sickUsed: 2,
    },
  })

  // Create sample leave request
  await prisma.leaveRequest.create({
    data: {
      userId: employee.id,
      type: 'ANNUAL',
      startDate: new Date('2025-07-14'),
      endDate: new Date('2025-07-18'),
      status: 'APPROVED',
      reason: 'Letní dovolená',
    },
  }).catch(() => {}) // ignore if already exists

  // Create sample payslips
  const months = [
    { month: 1, year: 2025, grossAmount: 85000, netAmount: 62340 },
    { month: 2, year: 2025, grossAmount: 85000, netAmount: 62340 },
    { month: 3, year: 2025, grossAmount: 87500, netAmount: 64120 },
    { month: 4, year: 2025, grossAmount: 87500, netAmount: 64120 },
    { month: 5, year: 2025, grossAmount: 87500, netAmount: 64120 },
  ]

  for (const payslip of months) {
    await prisma.payslip.upsert({
      where: { userId_month_year: { userId: employee.id, month: payslip.month, year: payslip.year } },
      update: {},
      create: {
        userId: employee.id,
        ...payslip,
        currency: 'CZK',
      },
    })
  }

  // Create sample document
  await prisma.document.create({
    data: {
      userId: employee.id,
      name: 'Pracovní smlouva 2023',
      type: 'CONTRACT',
      url: '/documents/contract-2023.pdf',
      uploadedBy: admin.id,
    },
  }).catch(() => {})

  // Create emergency contact
  await prisma.emergencyContact.upsert({
    where: { userId: employee.id },
    update: {},
    create: {
      userId: employee.id,
      name: 'Marie Nováková',
      phone: '+420 777 654 321',
      relationship: 'Manželka',
    },
  })

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
