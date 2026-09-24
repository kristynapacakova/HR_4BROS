'use client'

export interface PhotoPosition {
  x: number // 0-100, % from left
  y: number // 0-100, % from top
  zoom: number // 100-300, %
}

export interface TeamProfileOverride {
  photo?: string | null
  photoPos?: PhotoPosition
  bio?: string | null
  interests?: string[]
  helpWith?: string | null
  personality?: string | null // 16 Personalities kód, např. "INFJ"
  gallery?: string[]
}

export const PERSONALITY_TYPES: Record<string, { name: string; desc: string }> = {
  INTJ: { name: 'Architekt', desc: 'Strategický myslitel s plánem na vše. Rád řeší komplexní problémy systematicky a nezávisle, drží si vlastní úsudek.' },
  INTP: { name: 'Logik', desc: 'Nenasytný hladovec po poznání. Miluje analýzu a hledání souvislostí, méně ho baví rutina a formality.' },
  ENTJ: { name: 'Velitel', desc: 'Odvážný a vynalézavý vůdce. Umí rozhýbat lidi i projekty, jde přímo k cíli a nebojí se rozhodovat.' },
  ENTP: { name: 'Hádavec', desc: 'Chytrý a zvídavý myslitel, miluje výzvy. Baví ho debata a hledání nových úhlů pohledu na věc.' },
  INFJ: { name: 'Obhájce', desc: 'Tichý idealista s pevnými principy. Vnímá souvislosti mezi lidmi a hodnotami, rád pomáhá smysluplně.' },
  INFP: { name: 'Mediátor', desc: 'Poetický a laskavý altruista. Řídí se vlastními hodnotami, oceňuje autenticitu a prostor na vlastní tempo.' },
  ENFJ: { name: 'Protagonista', desc: 'Charismatický a inspirativní vůdce. Umí motivovat tým a vycítit, co lidé kolem potřebují.' },
  ENFP: { name: 'Aktivista', desc: 'Nadšený a kreativní duch svobodný. Přináší energii a nové nápady, nesnáší škatulkování a rutinu.' },
  ISTJ: { name: 'Logistik', desc: 'Praktický a spolehlivý organizátor. Drží slovo, má rád jasná pravidla a promyšlené postupy.' },
  ISFJ: { name: 'Ochránce', desc: 'Oddaný a vřelý strážce. Všímá si detailů a potřeb ostatních, na kolegy je spoleh.' },
  ESTJ: { name: 'Výkonný ředitel', desc: 'Skvělý manažer věcí i lidí. Má rád strukturu, jasné cíle a efektivní řešení.' },
  ESFJ: { name: 'Konzul', desc: 'Pečující a společenský organizátor. Drží partu pohromadě a stará se, aby se všem dobře spolupracovalo.' },
  ISTP: { name: 'Virtuóz', desc: 'Odvážný experimentátor se vším náčiním. Řeší věci prakticky za pochodu, nemá rád zbytečné teoretizování.' },
  ISFP: { name: 'Dobrodruh', desc: 'Flexibilní a okouzlující umělec. Vnímá atmosféru a estetiku, pracuje nejlépe v klidu a bez tlaku.' },
  ESTP: { name: 'Podnikatel', desc: 'Chytrý, energický a vnímavý. Rychle reaguje na změny, baví ho akce a řešení věcí tady a teď.' },
  ESFP: { name: 'Bavič', desc: 'Spontánní, energický a nadšený. Rozjasní místnost, baví ho lidi a živá atmosféra kolem sebe.' },
}

const KEY = 'fb-team-profiles'
export const TEAM_PROFILE_CHANGED_EVENT = 'fb-team-profile-changed'

function loadAll(): Record<string, TeamProfileOverride> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAll(map: Record<string, TeamProfileOverride>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
    window.dispatchEvent(new Event(TEAM_PROFILE_CHANGED_EVENT))
  } catch { /* noop */ }
}

export function loadTeamProfiles(): Record<string, TeamProfileOverride> {
  return loadAll()
}

export function saveTeamProfile(memberId: string, override: TeamProfileOverride) {
  const all = loadAll()
  all[memberId] = { ...all[memberId], ...override }
  saveAll(all)
}
