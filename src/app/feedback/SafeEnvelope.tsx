/**
 * Ilustrace pro Schránku důvěry — geometrická obálka se zámečkem.
 * Styl brandových ikon: ostré tahy (square/miter), vyplněné akcentní čtverečky.
 * Kreslí se na navy pozadí (tahy bílé).
 */
export function SafeEnvelope({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 104"
      fill="none"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    >
      {/* akcentní čtverečky okolo */}
      <rect x="4" y="6" width="8" height="8" fill="#834DFB" />
      <rect x="16" y="0" width="4" height="4" fill="#4DE791" />
      <rect x="114" y="10" width="6" height="6" fill="#F0E100" />

      {/* obálka */}
      <rect x="12" y="24" width="88" height="60" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M12 24L56 58L100 24" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M12 84L44 52M100 84L68 52" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="3" />

      {/* zámek: ostré hranaté oko + zlaté tělo s navy klíčovou dírkou */}
      <path d="M90 66V54H112V66" stroke="#834DFB" strokeWidth="4" />
      <rect x="82" y="66" width="38" height="30" fill="#F0E100" />
      <rect x="99" y="73" width="4" height="6" fill="#0D214F" />
      <rect x="100" y="79" width="2" height="8" fill="#0D214F" />
      <rect x="82" y="66" width="38" height="30" stroke="#0D214F" strokeWidth="2" />
    </svg>
  )
}
