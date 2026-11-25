'use client'

import { useEffect, useState } from 'react'
import { DEMO_ADMIN, DEMO_TEAM, type Contract, type ContractTemplate } from './mock-data'
import type { DocCompany } from './contract-doc'
import { pushNotification } from './notifications-client'
import type { StoredContract } from './contract-file-client'

/**
 * Smlouvy vytvořené ze šablony a jejich cesta k podpisu:
 *   Návrh (DRAFT) → Odeslat jednateli (PENDING_MANAGEMENT) → jednatel podepíše (PENDING_EMPLOYEE)
 *   → smlouva přijde uživateli do Můj účet → Dokumenty → Smlouvy k podpisu (+ notifikace)
 *   → uživatel podepíše (SIGNED) → HR dostane notifikaci, smlouva je v Přehledu smluv a v Moje smlouvy (PDF).
 * HR za firmu nepodepisuje — podepisuje jednatel (jméno v Smlouvy → Vizuál PDF → Údaje firmy).
 * Demo: localStorage. Ostrá verze: tabulka Contract + e-podpis přes DocuSeal (src/lib/esign.ts), PDF z šablony na serveru.
 */
export interface FlowContract extends Contract {
  /** komu smlouva patří (id z týmu) */
  personId: string
  /** druh dokumentu = sloupec v Přehledu smluv (HPP, IČO, Mzdový výměr, Předávací protokol, GDPR, Dodatek…) */
  docType: string
  /** znění šablony a údaje firmy zmrazené při vytvoření — pozdější úprava šablony podepsanou smlouvu nezmění */
  snapshot?: Omit<ContractTemplate, 'createdAt'>
  company?: DocCompany
}

/** Podepsanou smlouvu nejde upravit ani smazat. */
export const isLocked = (c: Pick<Contract, 'status'>) => c.status === 'SIGNED'

const KEY = 'fb-flow-contracts'
export const FLOW_CONTRACTS_CHANGED_EVENT = 'fb-flow-contracts-changed'
const DATE_KEYS = ['createdAt', 'sentToManagementAt', 'managementSignedAt', 'sentToEmployeeAt', 'employeeSignedAt'] as const

function load(): FlowContract[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Record<string, unknown>[]
    return raw.map(c => {
      const out = { ...c } as Record<string, unknown>
      for (const k of DATE_KEYS) out[k] = c[k] ? new Date(c[k] as string) : null
      return out as unknown as FlowContract
    })
  } catch { return [] }
}
function write(list: FlowContract[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* noop */ }
  window.dispatchEvent(new Event(FLOW_CONTRACTS_CHANGED_EVENT))
}

export function addFlowContract(c: FlowContract) { write([c, ...load()]) }
export function removeFlowContract(id: string) { write(load().filter(c => c.id !== id || isLocked(c))) }

/** Úprava — u ukázkové smlouvy (seed) se při první změně uloží celá. */
export function updateFlowContract(id: string, patch: Partial<FlowContract>, seed?: FlowContract) {
  const list = load()
  if (list.some(c => c.id === id && isLocked(c))) return // podepsaná = zamčená
  if (list.some(c => c.id === id)) write(list.map(c => (c.id === id ? { ...c, ...patch } : c)))
  else if (seed) write([{ ...seed, ...patch }, ...list])
}

const personOf = (c: FlowContract) => DEMO_TEAM.find(m => m.id === c.personId)

export function sendToManagement(c: FlowContract) {
  updateFlowContract(c.id, { status: 'PENDING_MANAGEMENT', sentToManagementAt: new Date() }, c)
}

/** Jednatel podepsal → smlouva jde uživateli k podpisu + notifikace. */
export function signAsManagement(c: FlowContract, signer: string) {
  const now = new Date()
  updateFlowContract(c.id, { status: 'PENDING_EMPLOYEE', managementSignedAt: now, managementSignedBy: signer, sentToEmployeeAt: now }, c)
  const p = personOf(c)
  if (p) pushNotification({ recipientEmail: p.email, title: 'Máš smlouvu k podpisu', body: `${c.templateName} — najdeš ji v Můj účet → Dokumenty.`, href: '/profile?tab=dokumenty' })
}

/** Uživatel podepsal → hotovo, HR dostane notifikaci. */
export function signAsEmployee(c: FlowContract) {
  updateFlowContract(c.id, { status: 'SIGNED', employeeSignedAt: new Date() }, c)
  pushNotification({ recipientEmail: DEMO_ADMIN.email, title: 'Smlouva podepsána', body: `${c.employeeName} podepsal(a): ${c.templateName}.`, href: '/admin/smlouvy' })
}

export function useFlowContracts(seed: FlowContract[] = []): FlowContract[] {
  const [stored, setStored] = useState<FlowContract[]>([])
  useEffect(() => {
    const refresh = () => setStored(load())
    refresh()
    window.addEventListener(FLOW_CONTRACTS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(FLOW_CONTRACTS_CHANGED_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  return [...stored, ...seed.filter(s => !stored.some(c => c.id === s.id))]
}

export const isFlowItem = (c: StoredContract) => c.id.startsWith('flow-')
export const flowIdOf = (c: StoredContract) => c.id.replace(/^flow-/, '')

/** Smlouva ze šablony jako položka Přehledu smluv / Moje smlouvy (návrhy se nepočítají). */
export function flowAsStored(c: FlowContract): StoredContract | null {
  if (c.status === 'DRAFT' || !c.personId) return null
  const waitingFor = c.status === 'PENDING_MANAGEMENT' ? 'čeká na podpis jednatele' : c.status === 'PENDING_EMPLOYEE' ? 'čeká na podpis uživatele' : ''
  return {
    id: `flow-${c.id}`, personId: c.personId, name: c.templateName, type: c.docType,
    status: c.status === 'SIGNED' ? 'SIGNED' : 'UNSIGNED',
    signedAt: c.employeeSignedAt ? new Date(c.employeeSignedAt).toISOString().slice(0, 10) : null,
    notes: waitingFor, uploadedAt: new Date(c.createdAt).toISOString(),
    fileName: `${c.templateName}.pdf`, fileType: 'application/pdf', size: 0,
  }
}
