import { CONTRACT_TEMPLATES, DEMO_CONTRACTS } from '@/lib/mock-data'
import { ContractsClient } from './ContractsClient'

export function SmlouvySection() {
  return <ContractsClient templates={CONTRACT_TEMPLATES} contracts={DEMO_CONTRACTS} />
}
