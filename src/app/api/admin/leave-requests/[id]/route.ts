import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { action, note } = await req.json()

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

  const leaveRequest = await db.leaveRequest.update({
    where: { id: params.id },
    data: { status, note: note || null },
  })

  // Update leave balance if approved
  if (status === 'APPROVED' && leaveRequest.type === 'ANNUAL') {
    const days = Math.ceil(
      (leaveRequest.endDate.getTime() - leaveRequest.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

    await db.leaveBalance.upsert({
      where: { userId_year: { userId: leaveRequest.userId, year: leaveRequest.startDate.getFullYear() } },
      update: { annualUsed: { increment: days } },
      create: {
        userId: leaveRequest.userId,
        year: leaveRequest.startDate.getFullYear(),
        annualTotal: 20,
        annualUsed: days,
        sickTotal: 10,
        sickUsed: 0,
      },
    })
  }

  return NextResponse.json(leaveRequest)
}
