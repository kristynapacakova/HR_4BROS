'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'

const AVATAR_KEY = 'fb-avatar'

/** Downscales the picked image and stores it as a data URL. */
function processFile(file: File, cb: (dataUrl: string) => void) {
  const img = new Image()
  const reader = new FileReader()
  reader.onload = () => {
    img.onload = () => {
      const size = 160
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size)
      cb(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}

export function AvatarUpload({ initial }: { initial: string }) {
  const [avatar, setAvatar] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try { setAvatar(localStorage.getItem(AVATAR_KEY)) } catch { /* noop */ }
  }, [])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file, dataUrl => {
      try { localStorage.setItem(AVATAR_KEY, dataUrl) } catch { /* noop */ }
      setAvatar(dataUrl)
      window.dispatchEvent(new Event('fb-avatar-changed'))
    })
    e.target.value = ''
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative flex-shrink-0 group"
      title="Změnit profilovou fotku"
    >
      <div className="absolute -inset-1 rounded-full opacity-30" style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(6px)' }} />
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="Profilová fotka" className="relative w-16 h-16 rounded-full object-cover" />
      ) : (
        <div className="relative w-16 h-16 bg-navy rounded-full flex items-center justify-center">
          <span className="text-white font-headline text-2xl font-bold">{initial}</span>
        </div>
      )}
      <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-violet text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
        <Camera className="w-3 h-3" />
      </span>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
    </button>
  )
}

/** Small read-only avatar used in the top header — follows the uploaded photo. */
export function HeaderAvatar({ initial }: { initial: string }) {
  const [avatar, setAvatar] = useState<string | null>(null)

  useEffect(() => {
    const read = () => { try { setAvatar(localStorage.getItem(AVATAR_KEY)) } catch { /* noop */ } }
    read()
    window.addEventListener('fb-avatar-changed', read)
    return () => window.removeEventListener('fb-avatar-changed', read)
  }, [])

  return (
    <div className="relative flex-shrink-0">
      <div
        className="absolute -inset-0.5 rounded-full opacity-40"
        style={{ background: 'linear-gradient(135deg, #7e17e0, #9b45e8)', filter: 'blur(4px)' }}
      />
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white" />
      ) : (
        <div className="relative w-8 h-8 bg-violet rounded-full flex items-center justify-center ring-2 ring-white">
          <span className="text-white text-xs font-semibold">{initial}</span>
        </div>
      )}
    </div>
  )
}
