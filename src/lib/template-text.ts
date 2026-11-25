/**
 * Šablony smluv jako jednoduchý text — HR je píše / nahraje z Wordu a vpravo vidí náhled v šabloně 4Bros 2026.
 *
 * Formát textu (stejný princip jako md2doc.js v technicka_sablona):
 *   # Název dokumentu                → název (titulní strana, úvodní věta)
 *   ## Předmět smlouvy               → článek (číslo 1., 2. … doplní šablona sama)
 *   1.1 Text ustanovení              → číslovaný bod (číslo se přečísluje podle pořadí)
 *   - odrážka                        → odrážka ■
 *   běžný řádek                      → bod; v článku, který má body „1.1“, je to nečíslovaný odstavec
 *   **tučně**                        → tučné písmo
 *   [Jméno a příjmení]               → pole k doplnění (při vytváření smlouvy se vyplní, jinak žlutě)
 *   {{MZDA}}                         → pole k doplnění se systémovým klíčem
 *
 * Uloženo jako HTML: <h2>název</h2><h3>článek</h3><p class="pt|p|li">…</p>.
 */

export interface ParsedTemplate {
  body: string
  placeholders: string[]
  labels: Record<string, string>
  title: string
}

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function slug(s: string): string {
  const base = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  return `F_${base.slice(0, 40) || 'POLE'}`
}

export function templateTextToHtml(text: string): ParsedTemplate {
  const labels: Record<string, string> = {}
  const placeholders: string[] = []
  const addKey = (k: string, label?: string) => {
    if (!placeholders.includes(k)) placeholders.push(k)
    if (label && !labels[k]) labels[k] = label
  }
  const inline = (s: string) => escHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\{\{(\w+)\}\}/g, (m, k) => { addKey(k); return m })
    .replace(/\[([^\]]{1,80})\]/g, (_, label) => { const k = slug(label); addKey(k, label.trim()); return `{{${k}}}` })

  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim())
  let title = ''
  type Item = { kind: 'pt' | 'p' | 'li' | 'auto'; html: string }
  const arts: { title: string; items: Item[] }[] = []
  let cur: { title: string; items: Item[] } | null = null
  for (const l of lines) {
    if (!l || /^_{4,}/.test(l)) continue
    let m: RegExpMatchArray | null
    if ((m = l.match(/^#\s+(.+)/)) && !l.startsWith('##')) { title = m[1].replace(/\*\*/g, ''); continue }
    if ((m = l.match(/^##\s+(?:\d+\.\s*)?(.+)/))) { cur = { title: m[1].replace(/\*\*/g, ''), items: [] }; arts.push(cur); continue }
    if (!cur) { cur = { title: 'Úvodní ustanovení', items: [] }; arts.push(cur) }
    if ((m = l.match(/^(?:\*\*)?\d+\.\d+\.?(?:\*\*)?\s+(.+)/))) { cur.items.push({ kind: 'pt', html: inline(m[1]) }); continue }
    if ((m = l.match(/^[-•■*]\s+(.+)/))) { cur.items.push({ kind: 'li', html: inline(m[1]) }); continue }
    cur.items.push({ kind: 'auto', html: inline(l) })
  }
  const body = [
    title ? `<h2>${escHtml(title)}</h2>` : '',
    ...arts.map(a => {
      const numbered = a.items.some(i => i.kind === 'pt')
      return `<h3>${inline(a.title)}</h3>\n` + a.items.map(i => {
        const kind = i.kind === 'auto' ? (numbered ? 'p' : 'pt') : i.kind
        return `<p class="${kind}">${i.html}</p>`
      }).join('\n')
    }),
  ].filter(Boolean).join('\n\n')
  return { body, placeholders, labels, title }
}

/** HTML šablony → text pro editor (i pro vestavěné šablony). */
export function templateHtmlToText(html: string, labels: Record<string, string> = {}): string {
  const out: string[] = []
  const strip = (s: string) => s
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (labels[k] ? `[${labels[k]}]` : m))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim()
  const re = /<(h2|h3|p)([^>]*)>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null
  let n = 0, k = 0
  let numberedArt = false
  while ((m = re.exec(html))) {
    const [, tag, attrs, inner] = m
    const t = strip(inner)
    if (!t) continue
    if (tag === 'h2') { out.push(`# ${t}`, ''); continue }
    if (tag === 'h3') { n++; k = 0; numberedArt = false; out.push('', `## ${t}`); continue }
    const cls = attrs.match(/class="(\w+)"/)?.[1]
    if (cls === 'li') out.push(`- ${t}`)
    else if (cls === 'p') out.push(t)
    else if (cls === 'pt' || !cls) { k++; numberedArt = true; out.push(`${n}.${k} ${t}`) }
  }
  void numberedArt
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/* ── Word (.docx) → text, bez knihovny: .docx je zip, word/document.xml se rozbalí přes DecompressionStream ── */

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([data.slice().buffer as ArrayBuffer]).stream().pipeThrough(ds)
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function readZipEntry(buf: ArrayBuffer, name: string): Promise<string | null> {
  const dv = new DataView(buf)
  const u8 = new Uint8Array(buf)
  // konec centrálního adresáře
  let eocd = -1
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) return null
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) return null
    const method = dv.getUint16(p + 10, true)
    const csize = dv.getUint32(p + 20, true)
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true)
    const local = dv.getUint32(p + 42, true)
    const fname = dec.decode(u8.subarray(p + 46, p + 46 + nlen))
    if (fname === name) {
      const lnlen = dv.getUint16(local + 26, true), lxlen = dv.getUint16(local + 28, true)
      const start = local + 30 + lnlen + lxlen
      const raw = u8.subarray(start, start + csize)
      const data = method === 0 ? raw : await inflateRaw(raw)
      return dec.decode(data)
    }
    p += 46 + nlen + xlen + clen
  }
  return null
}

/**
 * Word → text šablony. Bere jen znění smlouvy: titulní stranu („Připraveno pro/kým“), smluvní strany
 * („Popisek: údaj“, „(dále jen …)“, „a“), věty velkými písmeny a podpisy („V … dne …“) vynechá — ty šablona 4Bros vytváří sama.
 * Nadpisy (styl Nadpis/Heading, celý tučný krátký odstavec, „Článek 1“, „1. Název“) → „## článek“, „1.1“ / číslování 2. úrovně → body.
 * Výsledek HR doladí v editoru s náhledem.
 */
export async function docxToTemplateText(file: File): Promise<string> {
  const xml = await readZipEntry(await file.arrayBuffer(), 'word/document.xml')
  if (!xml) throw new Error('Soubor se nepodařilo přečíst jako Word (.docx).')
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
  const body = doc.getElementsByTagNameNS(W, 'body')[0]
  if (!body) throw new Error('Ve Wordu jsem nenašla žádný text.')

  type P = { text: string; allBold: boolean; heading: boolean; numPr: boolean; ilvl: number }
  const readP = (p: Element): P => {
    let text = '', boldChars = 0, allChars = 0
    for (const r of Array.from(p.getElementsByTagNameNS(W, 'r'))) {
      const t = Array.from(r.getElementsByTagNameNS(W, 't')).map(x => x.textContent ?? '').join('') + (r.getElementsByTagNameNS(W, 'tab').length ? ' ' : '')
      if (!t) continue
      const b = r.getElementsByTagNameNS(W, 'b')[0]
      const isBold = !!b && !['0', 'false'].includes(b.getAttributeNS(W, 'val') ?? '')
      allChars += t.trim().length
      if (isBold) boldChars += t.trim().length
      text += isBold && t.trim() ? `**${t.trim()}** ` : t
    }
    const style = p.getElementsByTagNameNS(W, 'pStyle')[0]?.getAttributeNS(W, 'val') ?? ''
    const numPr = p.getElementsByTagNameNS(W, 'numPr')[0]
    const allBold = allChars > 0 && boldChars / allChars > 0.8
    text = text.replace(/\*\*\s*\*\*/g, '').replace(/\s+/g, ' ').trim()
    if (allBold) text = text.replace(/\*\*/g, '')
    return {
      text, allBold, heading: /heading|nadpis|title|název/i.test(style), numPr: !!numPr,
      ilvl: Number(numPr?.getElementsByTagNameNS(W, 'ilvl')[0]?.getAttributeNS(W, 'val') ?? '0'),
    }
  }

  // odstavce v pořadí; tabulky: „Popisek: údaj“ (strany) vynechat, jiné řádky jako odstavce
  const items: P[] = []
  for (const el of Array.from(body.children)) {
    if (el.localName === 'p') items.push(readP(el))
    else if (el.localName === 'tbl') {
      for (const tr of Array.from(el.getElementsByTagNameNS(W, 'tr'))) {
        const cells = Array.from(tr.getElementsByTagNameNS(W, 'tc')).map(tc => Array.from(tc.getElementsByTagNameNS(W, 'p')).map(p => readP(p).text.replace(/\*\*/g, '')).join(' ').trim())
        if (cells.length === 2 && /:$/.test(cells[0])) continue
        if (cells.some(c => /_{4,}/.test(c) || /^V\s.+\sdne\s/.test(c))) continue
        const line = cells.filter(Boolean).join(' – ')
        if (line) items.push({ text: line, allBold: false, heading: false, numPr: false, ilvl: 0 })
      }
    }
  }

  const out: string[] = []
  let haveTitle = false, skipNext = false, inBody = false
  for (const it of items) {
    const text = it.text
    const plain = text.replace(/\*\*/g, '')
    if (!plain || /^_{4,}/.test(plain)) continue
    if (skipNext) { skipNext = false; continue }
    if (/^Připraveno (pro|kým):?\s*$/i.test(plain)) { skipNext = true; continue }
    if (/^Připraveno (pro|kým):/i.test(plain)) continue
    if (/^V\s.+\sdne\s/.test(plain) && inBody) break // podpisy dělá šablona
    if (/^\(dále jen/i.test(plain) || /^a$/i.test(plain) || (/:$/.test(plain) && plain.length < 40 && !inBody)) continue
    const caps = plain === plain.toUpperCase() && /[A-ZÁ-Ž]{3}/.test(plain)
    const short = plain.length < 90 && !/[.;,]$/.test(plain)
    // název = první odstavec dokumentu (titulní strana), pokud není velkými písmeny ani číslovaný
    if (!haveTitle && !inBody && !caps && plain.length < 120 && !/^\d/.test(plain)) { out.push(`# ${plain}`, ''); haveTitle = true; continue }
    if (caps && !/^(článek|čl\.)/i.test(plain)) continue // úvodní / uvozující / závěrečná věta
    if (/^\d+\.\d+\.?\s/.test(plain)) { out.push(text.replace(/^\*\*(\d+\.\d+\.?)\*\*/, '$1')); inBody = true; continue }
    if (/^(článek|čl\.)\s*[\dIVX]+/i.test(plain) || (/^\d+\.\s+\S/.test(plain) && short)) {
      out.push('', `## ${plain.replace(/^(článek|čl\.)\s*[\dIVX]+\.?\s*[-–:]?\s*/i, '').replace(/^\d+\.\s+/, '')}`); inBody = true; continue
    }
    if ((it.heading || (it.allBold && short)) && !(it.numPr && it.ilvl > 0)) { out.push('', `## ${plain}`); inBody = true; continue }
    if (!inBody) continue // text mezi titulkem a prvním článkem = smluvní strany
    if (it.numPr && it.ilvl >= 1) { out.push(`0.0 ${text}`); continue }
    if (/^[•■▪–-]\s/.test(plain)) { out.push(`- ${text.replace(/^[•■▪–-]\s/, '')}`); continue }
    out.push(text)
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Čistý text (.txt / .md) — beze změny. */
export async function plainFileToTemplateText(file: File): Promise<string> {
  return (await file.text()).replace(/\r/g, '')
}
