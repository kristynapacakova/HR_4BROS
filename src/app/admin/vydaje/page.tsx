import { redirect } from 'next/navigation'

export default function VydajePage() {
  redirect('/admin?tab=odmeny&sub=doklady')
}
