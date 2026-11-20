import { redirect } from 'next/navigation'

export default function FakturyPage() {
  redirect('/admin?tab=odmeny&sub=faktury')
}
