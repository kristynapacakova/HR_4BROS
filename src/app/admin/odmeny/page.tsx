import { redirect } from 'next/navigation'

export default function OdmenyPage() {
  redirect('/admin?tab=odmeny&sub=odmeny')
}
