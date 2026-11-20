import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Demo: no-op
  return NextResponse.json({ success: true, demo: true })
}
