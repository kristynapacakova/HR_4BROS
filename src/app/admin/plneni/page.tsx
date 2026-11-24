import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { PageHero } from '@/components/layout/PageHero'
import { DEMO_ADMIN } from '@/lib/mock-data'
import { getHrSource } from '@/lib/hr/source'
import { complianceOf } from '@/lib/hr/model'
import { ComplianceClient, type ComplianceRow } from './ComplianceClient'

export default async function PlneniPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const src = getHrSource()
  const [people, contracts, directives, acknowledgements, bozp] = await Promise.all([
    src.people(), src.contracts(), src.directives(), src.acknowledgements(), src.bozpTrainings(),
  ])
  const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)
  const rows: ComplianceRow[] = people.map(p => {
    const c = complianceOf(p, { contracts, directives, acknowledgements, bozp })
    return {
      id: p.id,
      contract: { state: c.contract.state, endsAt: iso(c.contract.endsAt), daysLeft: c.contract.daysLeft, template: c.contract.contract?.templateName ?? null },
      directives: { required: c.directives.required, acknowledged: c.directives.acknowledged, missing: c.directives.missing.map(d => d.title.replace(/^Směrnice č\. [^—]+— /, '')) },
      bozp: { state: c.bozp.state, validUntil: iso(c.bozp.validUntil), daysLeft: c.bozp.daysLeft },
      issues: c.issues,
    }
  })

  return (
    <AppShell title="Přehled plnění" isAdmin userName={session.user.name} userEmail={session.user.email} employmentType={DEMO_ADMIN.employmentType}>
      <div className="w-full space-y-6">
        <PageHero kicker="Administrace" title="Přehled plnění">
          Kdo má co nesplněné: podpisy smluv, potvrzení směrnic, školení BOZP a blížící se konce smluv. Pravidla jsou na jednom místě, data se po napojení databáze vezmou odtamtud.
        </PageHero>
        <ComplianceClient rows={rows} />
      </div>
    </AppShell>
  )
}
