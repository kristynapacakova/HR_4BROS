'use client'

import { useRef, useState } from 'react'
import { Paperclip, X, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react'

const MAX_FILE_MB = 10

interface Attachment {
  name: string
  size: number
  kind: 'pdf' | 'image'
}

/**
 * Retroaktivní nahrání neschopenky u konkrétní žádosti v historii — většina
 * lidí ji při zakládání žádosti ještě nemá, dostanou ji až po skončení nemoci.
 */
export function SickNoteUpload({ requestId }: { requestId: string }) {
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isPdf = file.type === 'application/pdf'
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg'
    if (!isPdf && !isImage) { setError('Podporované formáty: PDF, PNG, JPG'); return }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`Soubor je moc velký (max ${MAX_FILE_MB} MB)`); return }
    setError(null)
    setAttachment({ name: file.name, size: file.size, kind: isPdf ? 'pdf' : 'image' })
  }

  if (attachment) {
    return (
      <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100 w-fit">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        <span className="text-xs text-green-700 truncate max-w-[160px]">{attachment.name}</span>
        <button
          type="button"
          onClick={() => setAttachment(null)}
          className="p-0.5 rounded-full text-green-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Odebrat neschopenku"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-violet bg-violet/10 hover:bg-violet hover:text-white transition-colors"
      >
        <Paperclip className="w-3 h-3" />
        Doplnit neschopenku
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        onChange={handlePick}
        className="hidden"
        data-request-id={requestId}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function AttachmentIcon({ kind }: { kind: 'pdf' | 'image' }) {
  return kind === 'pdf'
    ? <FileText className="w-4 h-4 text-red-400" />
    : <ImageIcon className="w-4 h-4 text-blue-400" />
}
