/**
 * Brandová barva každého týmu — sdílená napříč aplikací (hlavička Tým, medailonek,
 * analytika). Barvy jen z 4B palety.
 */
export const DEPARTMENT_COLORS: Record<string, string> = {
  HR: '#F0E100',
  Creative: '#834DFB',
  Performance: '#4DE791',
  Account: '#b9cbf3',
  Sales: '#FFFFFF',
  Backoffice: '#a97cfc',
  'Vývoj': '#5c7bb5',
}

/** Barva týmu; neznámý tým dostane navy-400. */
export function departmentColor(dept: string): string {
  return DEPARTMENT_COLORS[dept] ?? '#5c7bb5'
}

/** Text, který je čitelný na barvě týmu. */
export function departmentInk(dept: string): string {
  const c = departmentColor(dept)
  return c === '#834DFB' || c === '#5c7bb5' || c === '#a97cfc' ? '#FFFFFF' : '#0d214f'
}
