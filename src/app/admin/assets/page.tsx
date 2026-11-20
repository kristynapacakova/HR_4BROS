import { redirect } from 'next/navigation'

export default function AdminAssetsPage() {
  redirect('/admin?tab=majetek')
}
