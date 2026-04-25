import React from 'react'
import { normalizeFace, randomFace } from '../../lib/faces'
import type { AvatarFaceInput, AvatarFaceConfig } from '../../lib/faces'

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// ...existing code...

interface AvatarProps {
  emoji?: string
  tone?: string
  face?: AvatarFaceInput
  photo?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

const SKIN_COLORS: Record<AvatarFaceConfig['skinTone'], string> = {
  porcelain: '#F9E6D8',
  warm: '#F0C7A6',
  golden: '#DFA26F',
  amber: '#B97150',
  deep: '#7A4637',
}

const HAIR_COLORS: Record<AvatarFaceConfig['hair'], string> = {
  buzz: '#2F241F',
  bob: '#4B3228',
  sidePart: '#2C2A3A',
  curly: '#5B3527',
  waves: '#7B4B34',
  locs: '#2B1B14',
}

const HAT_COLORS: Record<AvatarFaceConfig['hat'], string> = {
  none: 'transparent',
  beanie: '#D76C4A',
  cap: '#3D6FA8',
  headband: '#E4948A',
  kerchief: '#CF8A5C',
}

function FaceSvg({ face, size }: { face: AvatarFaceInput; size: number }) {
  const config = normalizeFace(face)
  const skin = SKIN_COLORS[config.skinTone]
  const hair = HAIR_COLORS[config.hair]
  const line = '#211D2D'
  const cheek = config.skinTone === 'porcelain' ? '#F7C7C5' : config.skinTone === 'deep' ? '#A85E55' : '#E79A8F'
  const bg = '#FBF8F3'

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
      <rect x="2" y="2" width="60" height="60" rx="14" fill={bg} />
      <circle cx="32" cy="32" r="26" fill="#F6EFE8" />
      <HatLayer hat={config.hat} color={HAT_COLORS[config.hat]} />
      <HairLayer hair={config.hair} color={hair} />
      <FaceBase shape={config.faceShape} skin={skin} line={line} />
      <AccessoryLayer accessory={config.accessory} line={line} accent={HAT_COLORS[config.hat] === 'transparent' ? '#E39A8B' : HAT_COLORS[config.hat]} />
      <BrowsLayer brows={config.brows} line={line} />
      <EyesLayer eyes={config.eyes} line={line} />
      <NoseLayer nose={config.nose} line={line} />
      <MouthLayer mouth={config.mouth} line={line} cheek={cheek} />
      <EyewearLayer eyewear={config.eyewear} line={line} />
    </svg>
  )
}

function FaceBase({ shape, skin, line }: { shape: AvatarFaceConfig['faceShape']; skin: string; line: string }) {
  if (shape === 'round') return <circle cx="32" cy="33" r="15" fill={skin} stroke={line} strokeWidth="1.6" />
  if (shape === 'square') return <rect x="17" y="18" width="30" height="31" rx="11" fill={skin} stroke={line} strokeWidth="1.6" />
  if (shape === 'oval') return <ellipse cx="32" cy="33" rx="14" ry="16" fill={skin} stroke={line} strokeWidth="1.6" />
  return <rect x="18" y="18" width="28" height="31" rx="13" fill={skin} stroke={line} strokeWidth="1.6" />
}

function HairLayer({ hair, color }: { hair: AvatarFaceConfig['hair']; color: string }) {
  if (hair === 'buzz') return <path d="M19 27c2-7 8-12 13-12s11 5 13 12c-8-4-18-4-26 0Z" fill={color} />
  if (hair === 'bob') return (
    <>
      <path d="M17 26c1-8 7-13 15-13s14 5 15 13v7c-2 7-7 12-15 12s-13-5-15-12Z" fill={color} />
      <path d="M17 27c4-4 10-6 15-6s11 2 15 6" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="1.4" />
    </>
  )
  if (hair === 'curly') return (
    <>
      {[19, 25, 32, 39, 45].map((cx) => <circle key={cx} cx={cx} cy={22 + (cx % 2)} r="6" fill={color} />)}
      <path d="M16 28c3-4 8-6 16-6s13 2 16 6" fill={color} />
    </>
  )
  if (hair === 'waves') return (
    <>
      <path d="M16 27c2-8 8-13 16-13s14 5 16 13c-3-3-6-4-10-4-2 0-4 1-6 2-2-1-4-2-6-2-4 0-7 1-10 4Z" fill={color} />
      <path d="M17 27c2 2 4 4 4 7 0 5 2 9 4 12" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M47 27c-2 2-4 4-4 7 0 5-2 9-4 12" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </>
  )
  if (hair === 'locs') return (
    <>
      <path d="M17 25c1-7 7-12 15-12s14 5 15 12c-4-3-9-5-15-5s-11 2-15 5Z" fill={color} />
      {[20, 25, 30, 35, 40, 45].map((x) => <rect key={x} x={x} y="22" width="3.8" height={x % 2 === 0 ? 22 : 18} rx="1.9" fill={color} />)}
    </>
  )
  return (
    <>
      <path d="M17 26c2-8 8-13 15-13 8 0 14 5 15 13-3-2-6-3-9-3-7 0-9 5-20 7-1-1-1-2-1-4Z" fill={color} />
      <path d="M37 17c4 1 7 4 9 9" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="1.4" strokeLinecap="round" />
    </>
  )
}

function HatLayer({ hat, color }: { hat: AvatarFaceConfig['hat']; color: string }) {
  if (hat === 'none') return null
  if (hat === 'beanie') return (
    <>
      <path d="M18 24c2-8 8-13 14-13s12 5 14 13H18Z" fill={color} />
      <rect x="18" y="22" width="28" height="6" rx="3" fill="#F8EDE2" opacity="0.8" />
    </>
  )
  if (hat === 'cap') return (
    <>
      <path d="M18 24c2-7 7-12 14-12s12 5 14 12H18Z" fill={color} />
      <path d="M34 23c7-1 11 1 14 5-4 1-10 1-15-1Z" fill={color} />
    </>
  )
  if (hat === 'headband') return <rect x="18" y="22" width="28" height="5" rx="2.5" fill={color} />
  return (
    <>
      <path d="M17 24c3-7 8-12 15-12s12 5 15 12c-3-2-7-4-15-4s-12 2-15 4Z" fill={color} />
      <circle cx="42" cy="18" r="3" fill="#F8EDE2" />
    </>
  )
}

function AccessoryLayer({ accessory, line, accent }: { accessory: AvatarFaceConfig['accessory']; line: string; accent: string }) {
  if (accessory === 'earring') return <circle cx="44" cy="40" r="1.8" fill={accent} stroke={line} strokeWidth="1" />
  if (accessory === 'starClip') return <path d="M20 19l1.2 2.3 2.5.4-1.8 1.8.4 2.5-2.3-1.2-2.3 1.2.4-2.5-1.8-1.8 2.5-.4Z" fill={accent} stroke={line} strokeWidth="0.8" />
  if (accessory === 'sparkles') return (
    <>
      <path d="M19 18l.8 1.7 1.8.3-1.3 1.3.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.3 1.8-.3Z" fill={accent} />
      <path d="M45 20l.7 1.4 1.5.2-1.1 1.1.2 1.5-1.3-.7-1.3.7.2-1.5-1.1-1.1 1.5-.2Z" fill={accent} />
    </>
  )
  if (accessory === 'freckles') return (
    <>
      {[24, 27, 37, 40].map((x, i) => <circle key={x} cx={x} cy={i < 2 ? 37 : 36} r="0.8" fill={line} opacity="0.45" />)}
    </>
  )
  return null
}

function BrowsLayer({ brows, line }: { brows: AvatarFaceConfig['brows']; line: string }) {
  if (brows === 'straight') return (
    <>
      <path d="M22 26h7" stroke={line} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M35 26h7" stroke={line} strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
  if (brows === 'arched') return (
    <>
      <path d="M21 27c2-2 5-3 8-2" stroke={line} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M35 25c3-1 6 0 8 2" stroke={line} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </>
  )
  if (brows === 'bold') return (
    <>
      <path d="M21 27c2-2 5-3 9-2" stroke={line} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M34 25c4-1 7 0 9 2" stroke={line} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </>
  )
  return (
    <>
      <path d="M22 27c2-1 4-2 7-1" stroke={line} strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M35 26c3-1 5 0 7 1" stroke={line} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </>
  )
}

function EyesLayer({ eyes, line }: { eyes: AvatarFaceConfig['eyes']; line: string }) {
  if (eyes === 'smile') return (
    <>
      <path d="M22 31c1.5 1.8 4.5 1.8 6 0" stroke={line} strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path d="M36 31c1.5 1.8 4.5 1.8 6 0" stroke={line} strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </>
  )
  if (eyes === 'almond') return (
    <>
      <path d="M21 31c2-2 5-2 7 0-2 2-5 2-7 0Z" fill="#fff" stroke={line} strokeWidth="1.2" />
      <path d="M36 31c2-2 5-2 7 0-2 2-5 2-7 0Z" fill="#fff" stroke={line} strokeWidth="1.2" />
      <circle cx="25" cy="31" r="1.5" fill={line} />
      <circle cx="39" cy="31" r="1.5" fill={line} />
    </>
  )
  if (eyes === 'spark') return (
    <>
      <circle cx="25" cy="31" r="2.3" fill="#fff" stroke={line} strokeWidth="1.2" />
      <circle cx="39" cy="31" r="2.3" fill="#fff" stroke={line} strokeWidth="1.2" />
      <circle cx="25" cy="31" r="1.2" fill={line} />
      <circle cx="39" cy="31" r="1.2" fill={line} />
      <circle cx="26" cy="30" r="0.4" fill="#fff" />
      <circle cx="40" cy="30" r="0.4" fill="#fff" />
    </>
  )
  if (eyes === 'wink') return (
    <>
      <circle cx="25" cy="31" r="2" fill={line} />
      <path d="M36 31h6" stroke={line} strokeWidth="1.8" strokeLinecap="round" />
    </>
  )
  return (
    <>
      <circle cx="25" cy="31" r="1.8" fill={line} />
      <circle cx="39" cy="31" r="1.8" fill={line} />
    </>
  )
}

function NoseLayer({ nose, line }: { nose: AvatarFaceConfig['nose']; line: string }) {
  if (nose === 'bridge') return <path d="M32 31v6c0 1 1 2 2 2" stroke={line} strokeWidth="1.4" strokeLinecap="round" fill="none" />
  if (nose === 'round') return <circle cx="32" cy="38" r="1.8" fill="none" stroke={line} strokeWidth="1.3" />
  if (nose === 'long') return <path d="M32 30v8c0 1.5 1.2 2.5 3 2.5" stroke={line} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  return <path d="M32 33v5" stroke={line} strokeWidth="1.3" strokeLinecap="round" />
}

function MouthLayer({ mouth, line, cheek }: { mouth: AvatarFaceConfig['mouth']; line: string; cheek: string }) {
  return (
    <>
      <circle cx="24" cy="39" r="2.6" fill={cheek} opacity="0.35" />
      <circle cx="40" cy="39" r="2.6" fill={cheek} opacity="0.35" />
      {mouth === 'soft' && <path d="M26 44c2 1 8 1 10 0" stroke={line} strokeWidth="1.5" strokeLinecap="round" fill="none" />}
      {mouth === 'grin' && <path d="M25 43c2 3 12 3 14 0" stroke={line} strokeWidth="1.8" strokeLinecap="round" fill="none" />}
      {mouth === 'open' && <ellipse cx="32" cy="44" rx="3.2" ry="2.2" fill={line} />}
      {mouth === 'smile' && <path d="M25 43c2 2 4 3 7 3s5-1 7-3" stroke={line} strokeWidth="1.7" strokeLinecap="round" fill="none" />}
    </>
  )
}

function EyewearLayer({ eyewear, line }: { eyewear: AvatarFaceConfig['eyewear']; line: string }) {
  if (eyewear === 'none') return null
  if (eyewear === 'tint') {
    return (
      <>
        <rect x="20" y="27" width="10" height="8" rx="4" fill="#D7A96A" fillOpacity="0.35" stroke={line} strokeWidth="1.4" />
        <rect x="34" y="27" width="10" height="8" rx="4" fill="#D7A96A" fillOpacity="0.35" stroke={line} strokeWidth="1.4" />
        <path d="M30 31h4" stroke={line} strokeWidth="1.2" />
      </>
    )
  }
  if (eyewear === 'square') {
    return (
      <>
        <rect x="20" y="27" width="10" height="8" rx="2" fill="none" stroke={line} strokeWidth="1.4" />
        <rect x="34" y="27" width="10" height="8" rx="2" fill="none" stroke={line} strokeWidth="1.4" />
        <path d="M30 31h4" stroke={line} strokeWidth="1.2" />
      </>
    )
  }
  return (
    <>
      <circle cx="25" cy="31" r="5" fill="none" stroke={line} strokeWidth="1.4" />
      <circle cx="39" cy="31" r="5" fill="none" stroke={line} strokeWidth="1.4" />
      <path d="M30 31h4" stroke={line} strokeWidth="1.2" />
    </>
  )
}

export function Avatar({ emoji, tone: _tone, face, photo, size = 'md', className = '', style }: AvatarProps) {
  const dims = size === 'sm' ? 'w-7 h-7 text-sm rounded-md' : size === 'lg' ? 'w-16 h-16 text-3xl rounded-xl' : 'w-9 h-9 text-lg rounded-lg'

  if (photo) {
    return <img src={photo} className={`${dims} object-cover border border-line ${className}`} alt="avatar" style={{ borderWidth: '1.4px', ...style }} />
  }

  const resolvedFace = face ?? randomFace(emoji ? hashString(emoji) : 0)
  const px = size === 'sm' ? 28 : size === 'lg' ? 64 : 36
  return (
    <div className={`${dims} flex items-center justify-center border flex-shrink-0 ${className}`} style={{ borderColor: 'var(--line)', borderWidth: '1.4px', background: '#fff', ...style }}>
      <FaceSvg face={resolvedFace} size={px} />
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
          {host && <Avatar emoji={host.emoji} tone={host.tone} face={host.face} size="sm" />}
          <span className="text-ink-2 text-xs">
            {isHost ? 'your plan' : `${host?.name} · `}
            <span className="font-semibold text-ink">{plan.members.length}/{plan.groupSize}</span>
          </span>
        </div>
        <div className="flex gap-0.5">
          {plan.members.slice(0, 4).map(uid => {
            const u = MOCK_USERS.find(x => x.id === uid)
            return u ? <Avatar key={uid} emoji={u.emoji} tone={u.tone} face={u.face} size="sm" className="-ml-1.5 first:ml-0" style={{ transform: 'rotate(2deg)' } as React.CSSProperties} /> : null
          })}
        </div>
      </div>
    </Card>
  )
}
