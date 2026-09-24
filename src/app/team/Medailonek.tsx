import type { PhotoPosition } from '@/lib/team-profile-client'

const DEFAULT_POS: PhotoPosition = { x: 50, y: 50, zoom: 100 }

export function WatercolorBackdrop({ className = '' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/watercolor.png"
      alt=""
      className={`absolute pointer-events-none select-none ${className}`}
    />
  )
}

/** Circular photo (with optional pan/zoom) centered on the brand watercolor stroke. */
export function Medailonek({
  photo, photoPos, emoji, name, size = 96,
}: {
  photo?: string | null
  photoPos?: PhotoPosition
  emoji: string
  name: string
  size?: number
}) {
  const pos = photoPos ?? DEFAULT_POS
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2.2, height: size * 1.5 }}>
      <WatercolorBackdrop className="w-full h-full object-contain" />
      <div
        className="relative rounded-full overflow-hidden ring-4 ring-white shadow-md flex items-center justify-center bg-[#F7F8FE] flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: `scale(${pos.zoom / 100})` }}
          />
        ) : (
          <span style={{ fontSize: size * 0.42 }}>{emoji}</span>
        )}
      </div>
    </div>
  )
}
