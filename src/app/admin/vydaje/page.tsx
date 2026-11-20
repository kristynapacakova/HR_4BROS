import { redirect } from 'next/navigation'

export default function VydajePage() {
  redirect('/admin/odmeny?sub=doklady')
}
