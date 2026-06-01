import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, phone, address, city, bankAccount, ecName, ecPhone, ecRelationship } = body

  await db.user.update({
    where: { id: session.user.id },
    data: { name, phone, address, city, bankAccount },
  })

  if (ecName && ecPhone) {
    await db.emergencyContact.upsert({
      where: { userId: session.user.id },
      update: { name: ecName, phone: ecPhone, relationship: ecRelationship },
      create: { userId: session.user.id, name: ecName, phone: ecPhone, relationship: ecRelationship },
    })
  }

  return NextResponse.json({ success: true })
}
