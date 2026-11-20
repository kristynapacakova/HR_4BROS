/** Čtyři barevné čtverce — oficiální značka 4Bros (stejná jako favicon na 4bros.cz). */
export function FourBrosMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} aria-hidden="true">
      <rect x="0" y="21" width="7" height="7" fill="#1d356d" />
      <rect x="7" y="14" width="7" height="7" fill="#f0e100" />
      <rect x="14" y="7" width="7" height="7" fill="#834dfb" />
      <rect x="21" y="0" width="7" height="7" fill="#4de791" />
    </svg>
  )
}
