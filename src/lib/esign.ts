/**
 * Elektronický podpis dokumentů (směrnice, později i smlouvy).
 *
 * Dnes: `demoESign` — simulace v prohlížeči (nic se nikam neposílá).
 * Po napojení: `docusealESign` na serveru přes DocuSeal API (docuseal.com / docuseal.eu, nebo vlastní
 * instalace — DocuSeal je open source a jde provozovat i na vlastním serveru):
 *   1. šablona: POST /api/templates/html (text směrnice jako HTML s podpisovým polem) — jednou za verzi směrnice
 *   2. podpis: POST /api/submissions { template_id, send_email: false, submitters: [{ email, name, external_id: personId }] }
 *      → `slug` podepisujícího; v portálu se vloží podpisový formulář (`@docuseal/react` → <DocusealForm src=".../s/{slug}" />),
 *      takže člověk podepíše přímo tady, bez odcházení
 *   3. webhook `form.completed` → server uloží Acknowledgement { method: 'ESIGN', submissionId, documentHash }
 *      a do úložiště podepsané PDF + auditní záznam (audit log) z DocuSeal
 * API klíč (hlavička X-Auth-Token) patří jen na server, nikdy do prohlížeče.
 */

export interface ESignRequest {
  documentId: string
  documentTitle: string
  /** text dokumentu — z něj se počítá otisk a generuje PDF */
  documentHtml: string
  signer: { name: string; email: string }
}

export interface ESignResult {
  submissionId: string
  signedAt: Date
  /** SHA-256 otisk podepsaného textu (hex) */
  documentHash: string
  provider: 'DocuSeal'
}

export interface ESignProvider {
  /** otevře podepisování a vrátí výsledek po dokončení podpisu */
  sign(req: ESignRequest): Promise<ESignResult>
}

/** SHA-256 otisk textu — prokazuje, se kterou přesnou verzí dokumentu člověk souhlasil. */
export async function documentHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Simulace DocuSeal — chvíli „podepisuje“ a vrátí vymyšlené ID podpisu. */
export const demoESign: ESignProvider = {
  async sign(req) {
    const hash = await documentHash(req.documentHtml)
    await new Promise(r => setTimeout(r, 1600))
    const rand = Math.random().toString(16).slice(2, 10).toUpperCase()
    return { submissionId: `DEMO-${rand}`, signedAt: new Date(), documentHash: hash, provider: 'DocuSeal' }
  },
}

/** Přepínač poskytovatele — po napojení vrátí serverovou implementaci DocuSeal. */
export function getESignProvider(): ESignProvider {
  return demoESign
}
