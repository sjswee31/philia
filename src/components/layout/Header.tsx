import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title?: string
  subtitle?: string
  onBack?: () => void
  right?: React.ReactNode
  transparent?: boolean
}

export default function Header({ title, subtitle, onBack, right, transparent }: HeaderProps) {
  const navigate = useNavigate()
  const handleBack = onBack ?? (() => navigate(-1))

  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 px-4 flex items-center justify-between"
      style={{ paddingTop: 52, paddingBottom: 10, background: transparent ? 'transparent' : 'var(--paper)' }}
    >
      <div className="w-9">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white active:scale-95 transition-transform"
          style={{ border: '1.4px solid var(--line)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="11,6 5,12 11,18"/>
          </svg>
        </button>
      </div>

      <div className="text-center">
        {title && <div className="font-display text-xl leading-none">{title}</div>}
        {subtitle && <div className="text-ink-2 text-xs mt-0.5">{subtitle}</div>}
      </div>

      <div className="w-9 flex justify-end">
        {right}
      </div>
    </div>
  )
}
