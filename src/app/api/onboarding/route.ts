import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, completed } = await req.json()

  // Verify task belongs to user
  const task = await db.onboardingTask.findFirst({
    where: { id: taskId, userId: session.user.id },
  })
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.onboardingTask.update({
    where: { id: taskId },
    data: { completed, completedAt: completed ? new Date() : null },
  })

  return NextResponse.json({ success: true })
}
