/**
 * Elektronický podpis dokumentů (směrnice, později i smlouvy).
 *
 * Dnes: `demoESign` — simulace v prohlížeči (nic se nikam neposílá).
 * Po napojení: `docusignESign` na serveru přes DocuSign eSignature REST API:
 *   1. createSigningSession → POST /envelopes (dokument = PDF směrnice, signer = člověk, clientUserId
 *      pro „embedded signing“) a POST /envelopes/{id}/views/recipient → signingUrl (podpis přímo v portálu)
 *   2. DocuSign Connect (webhook) pošle `envelope-completed` → server uloží Acknowledgement
 *      { method: 'ESIGN', envelopeId, documentHash } a podepsané PDF + certifikát o dokončení do úložiště.
 * Přístupové údaje (integration key, account id, RSA klíč pro JWT) patří jen na server, nikdy do prohlížeče.
 */

export interface ESignRequest {
  documentId: string
  documentTitle: string
  /** text dokumentu — z něj se počítá otisk a generuje PDF */
  documentHtml: string
  signer: { name: string; email: string }
}

export interface ESignResult {
  envelopeId: string
  signedAt: Date
  /** SHA-256 otisk podepsaného textu (hex) */
  documentHash: string
  provider: 'DocuSign'
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

/** Simulace DocuSign — chvíli „podepisuje“ a vrátí vymyšlené ID obálky. */
export const demoESign: ESignProvider = {
  async sign(req) {
    const hash = await documentHash(req.documentHtml)
    await new Promise(r => setTimeout(r, 1600))
    const rand = Math.random().toString(16).slice(2, 10).toUpperCase()
    return { envelopeId: `DEMO-${rand}`, signedAt: new Date(), documentHash: hash, provider: 'DocuSign' }
  },
}

/** Přepínač poskytovatele — po napojení vrátí serverovou implementaci DocuSign. */
export function getESignProvider(): ESignProvider {
  return demoESign
}
