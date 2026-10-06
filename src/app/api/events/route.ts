import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

interface ParsedEvent {
  title: string
  date: string // ISO yyyy-mm-dd
}

/** Unfold ICS lines (continuation lines start with a space) */
function unfold(ics: string): string[] {
  return ics
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
}

function parseIcsDate(value: string): Date | null {
  // 20260815 or 20260815T170000Z / 20260815T170000
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Parses VEVENTs from an ICS feed. Yearly recurring events (birthdays,
 * anniversaries) are shifted to their next occurrence.
 */
function parseIcs(ics: string): ParsedEvent[] {
  const lines = unfold(ics)
  const events: ParsedEvent[] = []
  let inEvent = false
  let summary = ''
  let dtstart: Date | null = null
  let yearly = false

  const today = new Date(); today.setHours(0, 0, 0, 0)

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; summary = ''; dtstart = null; yearly = false; continue }
    if (line === 'END:VEVENT') {
      inEvent = false
      if (summary && dtstart) {
        let d = dtstart
        if (yearly) {
          d = new Date(today.getFullYear(), dtstart.getMonth(), dtstart.getDate())
          if (d < today) d = new Date(today.getFullYear() + 1, dtstart.getMonth(), dtstart.getDate())
        }
        events.push({ title: summary, date: toIso(d) })
      }
      continue
    }
    if (!inEvent) continue
    if (line.startsWith('SUMMARY')) summary = line.slice(line.indexOf(':') + 1).replace(/\\,/g, ',').replace(/\\;/g, ';').trim()
    else if (line.startsWith('DTSTART')) dtstart = parseIcsDate(line.slice(line.indexOf(':') + 1))
    else if (line.startsWith('RRULE') && line.includes('FREQ=YEARLY')) yearly = true
  }
  return events
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'Chybí URL kalendáře' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return Response.json({ error: 'Neplatná URL' }, { status: 400 })
  }
  // Only Google Calendar ICS feeds are allowed
  if (parsed.protocol !== 'https:' || !/(^|\.)calendar\.google\.com$/.test(parsed.hostname)) {
    return Response.json({ error: 'Povolen je jen odkaz z calendar.google.com (Tajná adresa ve formátu iCal)' }, { status: 400 })
  }

  try {
    const res = await fetch(parsed.toString(), { cache: 'no-store' })
    if (!res.ok) return Response.json({ error: `Kalendář vrátil chybu ${res.status}` }, { status: 502 })
    const ics = await res.text()

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const horizon = new Date(today); horizon.setDate(horizon.getDate() + 60)

    const events = parseIcs(ics)
      .filter(e => {
        const d = new Date(e.date)
        return d >= today && d <= horizon
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 20)

    return Response.json({ events }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'Kalendář se nepodařilo načíst' }, { status: 502 })
  }
}
