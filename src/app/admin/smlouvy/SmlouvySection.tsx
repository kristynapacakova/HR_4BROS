import { CONTRACT_TEMPLATES, DEMO_CONTRACTS, DEMO_DIRECTIVES, DIRECTIVE_TEMPLATES } from '@/lib/mock-data'
import { ContractsClient } from './ContractsClient'
import { DirectivesAdminClient } from '../smernice/DirectivesAdminClient'

export function SmlouvySection() {
  return (
    <div className="space-y-10">
      <ContractsClient templates={CONTRACT_TEMPLATES} contracts={DEMO_CONTRACTS} />

      <div>
        <h3 className="font-headline text-lg font-semibold text-navy mb-4">Interní směrnice</h3>
        <DirectivesAdminClient directives={DEMO_DIRECTIVES} templates={DIRECTIVE_TEMPLATES} />
      </div>
    </div>
  )
}
