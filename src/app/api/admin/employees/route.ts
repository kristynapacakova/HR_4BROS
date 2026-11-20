import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Demo: no-op
  return NextResponse.json({ id: 'demo-new', demo: true })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(DEMO_EMPLOYEES)
}
