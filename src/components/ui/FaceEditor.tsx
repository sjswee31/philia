import { useMemo, useState } from 'react'
import { Avatar } from './index'
import {
  FACE_EDITOR_CATEGORIES,
  FACE_OPTION_GROUPS,
  normalizeFace,
  randomFace,
  updateFace,
} from '../../lib/faces'
import type { AvatarFaceConfig, AvatarFaceInput } from '../../lib/faces'

interface FaceEditorProps {
  value?: AvatarFaceInput
  onChange: (next: AvatarFaceConfig) => void
  previewSize?: 'md' | 'lg'
}

export default function FaceEditor({ value, onChange, previewSize = 'lg' }: FaceEditorProps) {
  const face = useMemo(() => normalizeFace(value), [value])
  const [activeCategory, setActiveCategory] = useState<keyof AvatarFaceConfig>('skinTone')
  const options = FACE_OPTION_GROUPS[activeCategory]

  return (
    <div className="space-y-3">
      <div className="wk-box bg-white p-4">
        <div className="flex items-center gap-4">
          <Avatar face={face} size={previewSize} />
          <div className="min-w-0">
            <div className="font-display text-2xl text-ink">Build your face.</div>
            <div className="text-ink-2 text-sm mt-1">create your own personalized avatar</div>
          </div>
          <button
            type="button"
            onClick={() => onChange(randomFace())}
            className="wk-pill text-xs ml-auto flex-shrink-0"
          >
            shuffle
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FACE_EDITOR_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`wk-pill text-xs whitespace-nowrap ${activeCategory === category.id ? 'wk-pill-accent' : ''}`}
            style={{ color: activeCategory === category.id ? '#fff' : 'var(--ink)' }}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const preview = updateFace(face, activeCategory, option.id)
          const isSelected = face[activeCategory] === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(preview)}
              className="wk-box bg-white px-2 py-3 flex flex-col items-center gap-2 transition-transform active:scale-95"
              style={{
                outline: isSelected ? '2px solid var(--accent)' : 'none',
                boxShadow: isSelected ? '2px 2px 0 var(--accent-soft)' : undefined,
              }}
            >
              <Avatar face={preview} size="md" />
              <span className="text-[11px] leading-tight text-center text-ink">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
