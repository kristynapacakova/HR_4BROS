import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, startDate, endDate, reason } = await req.json()

  if (!startDate || !endDate || !type) {
    return NextResponse.json({ error: 'Chybí povinné údaje' }, { status: 400 })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end < start) {
    return NextResponse.json({ error: 'Datum konce musí být po datu začátku' }, { status: 400 })
  }

  const leaveRequest = await db.leaveRequest.create({
    data: {
      userId: session.user.id,
      type,
      startDate: start,
      endDate: end,
      reason: reason || null,
      status: 'PENDING',
    },
  })

  return NextResponse.json(leaveRequest)
}
