import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, department, position, startDate } = await req.json()

  if (!email) return NextResponse.json({ error: 'E-mail je povinný' }, { status: 400 })

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Zaměstnanec s tímto e-mailem již existuje' }, { status: 409 })

  const employee = await db.user.create({
    data: {
      email,
      name: name || null,
      role: 'EMPLOYEE',
      department: department || null,
      position: position || null,
      startDate: startDate ? new Date(startDate) : null,
    },
  })

  // Create default onboarding tasks
  const defaultTasks = [
    { title: 'Vyplnit osobní informace', description: 'Doplňte všechny osobní údaje v profilu', order: 1 },
    { title: 'Podepsat pracovní smlouvu', description: 'Přečtěte a podepište svoji pracovní smlouvu', order: 2 },
    { title: 'Nahrát kopii občanského průkazu', description: 'Nahrajte scan nebo foto vašeho OP', order: 3 },
    { title: 'Vyplnit kontakt pro případ nouze', description: 'Přidejte kontakt na osobu blízkou', order: 4 },
    { title: 'Absolvovat BOZP školení', description: 'Dokončete online školení bezpečnosti práce', order: 5 },
  ]

  await db.onboardingTask.createMany({
    data: defaultTasks.map((t) => ({ ...t, userId: employee.id })),
  })

  // Create leave balance for current year
  await db.leaveBalance.create({
    data: {
      userId: employee.id,
      year: new Date().getFullYear(),
      annualTotal: 20,
      annualUsed: 0,
      sickTotal: 10,
      sickUsed: 0,
    },
  })

  return NextResponse.json(employee)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const employees = await db.user.findMany({
    where: { role: 'EMPLOYEE' },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(employees)
}
