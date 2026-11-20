import { redirect } from 'next/navigation'

export default function FakturyPage() {
  redirect('/admin/odmeny?sub=faktury')
}
