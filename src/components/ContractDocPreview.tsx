'use client'

import { useEffect, useRef, useState } from 'react'
import { buildContractDocHtml, type ContractDocModel } from '@/lib/contract-doc'

/**
 * Náhled smlouvy přesně tak, jak vyjde v PDF (šablona 4Bros 2026) — stejné HTML jako tisk, vykreslené v iframe.
 * A4 listy se zmenší na šířku kontejneru.
 */
export function ContractDocPreview({ model, className = '' }: { model: ContractDocModel; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(1200)
  const [html, setHtml] = useState('')

  useEffect(() => { setHtml(buildContractDocHtml(model)) }, [model])

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const A4_PX = 210 * 3.7795 + 32 // šířka listu + okraj náhledu
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / A4_PX)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const measure = () => {
    const doc = frame.current?.contentDocument
    if (!doc) return
    const h = doc.documentElement.scrollHeight
    if (h) setHeight(h)
    // dopočítat po načtení písem
    doc.fonts?.ready.then(() => setTimeout(() => setHeight(doc.documentElement.scrollHeight), 50))
  }

  return (
    <div ref={wrap} className={`w-full overflow-hidden ${className}`} style={{ height: height * scale }}>
      <iframe
        ref={frame}
        title="Náhled smlouvy"
        srcDoc={html}
        onLoad={measure}
        className="border-0 origin-top-left"
        style={{ width: `${100 / scale}%`, height, transform: `scale(${scale})` }}
      />
    </div>
  )
}
