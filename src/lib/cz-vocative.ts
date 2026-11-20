/**
 * Hrubý odhad českého 5. pádu (oslovení) pro křestní jméno — pokrývá nejčastější
 * vzory, ne je to lingvisticky dokonalé. Používá se jen jako fallback, když si
 * člověk v profilu nenastaví vlastní přezdívku/oslovení.
 */
export function toVocativeCz(firstName: string): string {
  const name = firstName.trim()
  if (!name) return name

  // Marie, Julie, Lucie... — v oslovení beze změny
  if (/ie$/i.test(name)) return name

  // Petra, Jana, Eva, Lenka, Veronika... — nejčastější ženský vzor
  if (/a$/i.test(name)) return name.slice(0, -1) + 'o'

  // Pavel, Karel...
  if (/el$/i.test(name)) return name.slice(0, -2) + 'le'

  // Tomáš, Ondřej...
  if (/[šřčcj]$/i.test(name)) return name + 'i'

  // Petr, Alexandr...
  if (/r$/i.test(name)) return name.slice(0, -1) + 'ře'

  // David, Martin, Jakub, Michal, Václav, Adam...
  if (/[bdfghkmnptvzs]$/i.test(name)) return name + 'e'

  return name
}
