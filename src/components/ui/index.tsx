import React from 'react'

// ── Avatar ──────────────────────────────────────────────────
interface AvatarProps {
  emoji: string
  tone: string
  photo?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}
export function Avatar({ emoji, tone, photo, size = 'md', className = '', style }: AvatarProps) {
  const dims = size === 'sm' ? 'w-7 h-7 text-sm rounded-md' : size === 'lg' ? 'w-16 h-16 text-3xl rounded-xl' : 'w-9 h-9 text-lg rounded-lg'
  if (photo) {
    return <img src={photo} className={`${dims} object-cover border border-line ${className}`} alt="avatar" style={{ borderWidth: '1.4px', ...style }} />
  }
  return (
    <div
      className={`${dims} flex items-center justify-center border flex-shrink-0 ${className}`}
      style={{ background: tone, borderColor: 'var(--line)', borderWidth: '1.4px', ...style }}
    >
      {emoji}
    </div>
  )
}

// ── ReliabilityRing ──────────────────────────────────────────
export function ReliabilityRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#fff" strokeWidth={size * 0.12}/>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={size * 0.12}
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        className="reliability-ring"
      />
    </svg>
  )
}

// ── Btn ──────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}
export function Btn({ variant = 'outline', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'flex items-center justify-center gap-2 font-semibold rounded-2xl transition-transform active:scale-[.97] cursor-pointer border'
  const sz = size === 'sm' ? 'px-4 py-2 text-sm' : 'px-5 py-3.5 text-sm'
  const variants = {
    primary: 'bg-accent text-white border-line shadow-hard',
    outline: 'bg-white text-ink border-line',
    ghost:   'bg-transparent text-ink border-line',
  }
  return (
    <button className={`${base} ${sz} ${variants[variant]} ${className}`} style={{ borderWidth: '1.6px' }} {...props}>
      {children}
    </button>
  )
}

// ── Pill ─────────────────────────────────────────────────────
interface PillProps {
  children: React.ReactNode
  filled?: boolean
  onClick?: () => void
  className?: string
}
export function Pill({ children, filled, onClick, className = '' }: PillProps) {
  return (
    <span
      onClick={onClick}
      className={`wk-pill ${filled ? 'wk-pill-accent' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </span>
  )
}

// ── Chip ─────────────────────────────────────────────────────
export function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`wk-chip ${className}`}>{children}</span>
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, className = '', style, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return <div className={`wk-box ${className}`} style={style} onClick={onClick}>{children}</div>
}
export function CardSoft({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`wk-box-soft ${className}`}>{children}</div>
}
export function CardAccent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`wk-box-accent ${className}`}>{children}</div>
}

// ── MatchBadge ───────────────────────────────────────────────
export function MatchBadge({ score }: { score: number }) {
  return (
    <div className="text-center flex-shrink-0">
      <div className="font-display text-xl leading-none" style={{ color: 'var(--accent)' }}>{score}%</div>
      <div className="font-mono-sm text-ink-2 mt-0.5">match</div>
    </div>
  )
}

// ── BudgetBadge ──────────────────────────────────────────────
export function BudgetBadge({ budget }: { budget: string }) {
  return <Pill filled className="text-xs">{budget}</Pill>
}

// ── SafeStamp ────────────────────────────────────────────────
export function SafeStamp() {
  return (
    <span
      className="inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
      style={{ border: '1.4px solid var(--accent)', color: 'var(--accent)', transform: 'rotate(-3deg)', display: 'inline-block' }}
    >
      safe to meet
    </span>
  )
}

// ── Section label ────────────────────────────────────────────
export function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-mono-sm text-ink-2 tracking-widest uppercase ${className}`}>{children}</div>
}

// ── Divider ──────────────────────────────────────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-line opacity-20 ${className}`} />
}

// ── PlanCard ─────────────────────────────────────────────────
import type { Plan } from '../../types'
import { MOCK_USERS } from '../../lib/mockData'
import { formatTime, spotsLeft } from '../../lib/utils'

interface PlanCardProps {
  plan: Plan
  score?: number
  scoreReasons?: string[]
  onClick?: () => void
  currentUserId?: string
}
export function PlanCard({ plan, score, scoreReasons, onClick, currentUserId }: PlanCardProps) {
  const host = MOCK_USERS.find(u => u.id === plan.hostId)
  const isHost = currentUserId === plan.hostId
  const spots = spotsLeft(plan)

  return (
    <Card className="p-3.5 cursor-pointer active:scale-[.99] transition-transform shadow-hard-sm" style={{ boxShadow: '2px 2px 0 var(--line)' }} onClick={onClick}>
      <div className="flex justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{plan.restaurant.name}</div>
          <div className="text-ink-2 text-xs mt-0.5">{formatTime(plan.time)} · {plan.restaurant.address.split(',')[0]}</div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {score !== undefined && <MatchBadge score={score} />}
          {spots > 0 && !isHost && (
            <Pill filled className="text-[10px] px-2 py-0.5">+{spots} spot{spots > 1 ? 's' : ''}</Pill>
          )}
          {isHost && <Pill className="text-[10px] px-2 py-0.5">hosting</Pill>}
        </div>
      </div>

      {scoreReasons && scoreReasons.length > 0 && (
        <div className="text-ink-2 text-xs mt-1.5">↳ {scoreReasons[0]}</div>
      )}

      <div className="flex gap-1.5 mt-2.5 flex-wrap">
        {plan.vibeTags.map(t => <Chip key={t}>{t}</Chip>)}
        <Chip>{plan.budget}</Chip>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          {host && <Avatar emoji={host.emoji} tone={host.tone} size="sm" />}
          <span className="text-ink-2 text-xs">
            {isHost ? 'your plan' : `${host?.name} · `}
            <span className="font-semibold text-ink">{plan.members.length}/{plan.groupSize}</span>
          </span>
        </div>
        <div className="flex gap-0.5">
          {plan.members.slice(0, 4).map(uid => {
            const u = MOCK_USERS.find(x => x.id === uid)
            return u ? <Avatar key={uid} emoji={u.emoji} tone={u.tone} size="sm" className="-ml-1.5 first:ml-0" style={{ transform: 'rotate(2deg)' } as React.CSSProperties} /> : null
          })}
        </div>
      </div>
    </Card>
  )
}
