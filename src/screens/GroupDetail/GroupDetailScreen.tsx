import { useParams, useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../../contexts/AppContext'
import Header from '../../components/layout/Header'
import { Avatar, Btn, Chip, Pill, CardAccent, SectionLabel, SafeStamp, MatchBadge } from '../../components/ui'
import { MOCK_USERS } from '../../lib/mockData'
import { formatTime, formatCountdown, spotsLeft, generateId } from '../../lib/utils'
import { scorePlan } from '../../lib/matchScore'
import type { ChatMessage } from '../../types'

export default function GroupDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const user = useCurrentUser()

  const planData = state.plans.find(p => p.id === id)
  if (!planData || !user) return <div className="h-full bg-paper flex items-center justify-center text-ink-2">Plan not found</div>

  // Non-nullable aliases safe for closures
  const plan = planData
  const u = user

  const host = MOCK_USERS.find(x => x.id === plan.hostId) ?? state.users.find(x => x.id === plan.hostId)
  const isHost = u.id === plan.hostId
  const isMember = plan.members.includes(u.id)
  const hasRequested = plan.joinRequests.includes(u.id)
  const spots = spotsLeft(plan)

  const matchResult = !isMember && !isHost ? scorePlan(u, plan) : null

  function handleJoin() {
    if (plan.joinSetting === 'auto') {
      const botMsg: ChatMessage = {
        id: `bot_${generateId()}`,
        senderId: 'bot',
        content: `${u.name} just joined the table! ${plan.members.length + 1}/${plan.groupSize} confirmed.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      void botMsg
      dispatch({ type: 'JOIN_PLAN', planId: plan.id, userId: u.id })
      navigate(`/chat/${plan.id}`)
    } else if (plan.joinSetting === 'approval') {
      dispatch({ type: 'REQUEST_JOIN', planId: plan.id, userId: u.id })
    }
  }

  function handleApprove(userId: string) {
    dispatch({ type: 'APPROVE_JOIN', planId: plan.id, userId })
  }

  function handleDecline(userId: string) {
    dispatch({ type: 'DECLINE_JOIN', planId: plan.id, userId })
  }

  function handleWrapUp() {
    dispatch({ type: 'UPDATE_PLAN', planId: plan.id, updates: { status: 'past' } })
    if ('Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification('How was dinner? 🍽️', {
          body: `Leave vibe tags for your ${plan.restaurant.name} crew!`,
          icon: '/pwa-192x192.png',
        })
      }, 60 * 60 * 1000)
    }
    navigate('/home')
  }

  function handleCloseToDMs() {
    dispatch({ type: 'UPDATE_PLAN', planId: plan.id, updates: { status: 'closed-dms' } })
  }

  const memberProfiles = plan.members.map(id =>
    MOCK_USERS.find(u => u.id === id) ?? state.users.find(u => u.id === id)
  ).filter(Boolean)

  const requestProfiles = plan.joinRequests.map(id =>
    MOCK_USERS.find(u => u.id === id) ?? state.users.find(u => u.id === id)
  ).filter(Boolean)

  return (
    <div className="h-full bg-paper relative">
      <Header
        right={<Pill className="text-xs"><ShieldIcon /> verified</Pill>}
      />

      <div className="screen-scroll" style={{ paddingTop: 88 }}>
        <div className="px-5 space-y-4 pb-6">

          {/* Hero card */}
          <CardAccent className="p-4 relative">
            <div className="font-mono-sm text-ink-2">TONIGHT · {formatCountdown(plan.time).toUpperCase()}</div>
            <div className="font-display text-2xl mt-1 leading-tight">{plan.restaurant.name}</div>
            <div className="text-ink-2 text-sm mt-1">{formatTime(plan.time)} · {plan.restaurant.address}</div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {plan.vibeTags.map(t => <Chip key={t}>{t}</Chip>)}
              <Chip>{plan.budget}</Chip>
            </div>
            {matchResult && (
              <div className="absolute top-4 right-4">
                <SafeStamp />
                <div className="mt-1 text-right">
                  <MatchBadge score={matchResult.score} />
                </div>
              </div>
            )}
            {plan.note && (
              <div className="mt-3 text-xs text-ink-2 italic">"{plan.note}"</div>
            )}
          </CardAccent>

          {/* JOIN REQUESTS — host only */}
          {isHost && requestProfiles.length > 0 && (
            <div>
              <SectionLabel>JOIN REQUESTS · {requestProfiles.length}</SectionLabel>
              <div className="space-y-2 mt-2">
                {requestProfiles.map(u => u && (
                  <div key={u.id} className="wk-box p-3 flex items-center gap-3">
                    <button onClick={() => navigate(`/profile/${u.id}`)}>
                      <Avatar emoji={u.emoji} tone={u.tone} face={u.face} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{u.name}</div>
                      <div className="text-ink-2 text-xs">{u.reliability}% reliable · {u.dinnerCount} dinners</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleDecline(u.id)} className="wk-pill text-xs px-3 py-1.5">✕</button>
                      <button onClick={() => handleApprove(u.id)} className="wk-pill wk-pill-accent text-xs px-3 py-1.5" style={{ color: '#fff' }}>✓ Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roster */}
          <div>
            <SectionLabel>WHO'S COMING ({plan.members.length}/{plan.groupSize})</SectionLabel>
            <div className="space-y-2.5 mt-2">
              {memberProfiles.map(u => u && (
                <div key={u.id} className="flex items-center gap-3">
                  <button onClick={() => navigate(`/profile/${u.id}`)}>
                    <Avatar emoji={u.emoji} tone={u.tone} face={u.face} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{u.name}{u.id === plan.hostId ? ' (host)' : ''}</div>
                    <div className="text-ink-2 text-xs">{u.reliability}% reliable · {u.dinnerCount} dinners</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {u.isVerified && <Pill className="text-[10px] px-1.5 py-0.5"><ShieldIcon size={9} /> verified</Pill>}
                    {u.connections.includes(user.id) && <Pill className="text-[10px] px-1.5 py-0.5">mutual</Pill>}
                  </div>
                </div>
              ))}
              {/* Empty seats */}
              {Array.from({ length: spots }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 opacity-50">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-2 font-bold" style={{ border: '1.4px dashed var(--ink-3)' }}>?</div>
                  <div className="text-ink-2 text-sm">1 spot open{isHost ? '' : ' — could be you'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bot summary (for joiners) */}
          {matchResult && matchResult.reasons.length > 0 && (
            <div className="wk-box p-4">
              <div className="flex items-center gap-2 mb-2">
                <BotIcon />
                <SectionLabel>BOT SUMMARY</SectionLabel>
              </div>
              <div className="text-sm text-ink leading-relaxed">
                Strong match — {matchResult.reasons.join(', ')}. Host is{' '}
                {host ? `${host.reliability}% reliable` : 'verified'}.
              </div>
            </div>
          )}

          {/* Mini map placeholder */}
          <div className="wk-box overflow-hidden relative" style={{ height: 100 }}>
            <div className="wk-map-placeholder absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <div className="absolute bottom-2 left-2">
              <span className="wk-pill text-[10px] px-2 py-1 bg-white">directions →</span>
            </div>
          </div>

          {/* HOST controls */}
          {isHost && (
            <div className="space-y-2">
              <Btn className="w-full" onClick={() => navigate(`/chat/${plan.id}`)}>
                <BotIcon /> Open group chat
              </Btn>
              {plan.status === 'open' && (
                <Btn className="w-full" onClick={handleCloseToDMs}>
                  Close — mark open to DMs
                </Btn>
              )}
              {(plan.status === 'full' || plan.status === 'open') && (
                <Btn variant="primary" className="w-full" onClick={handleWrapUp}>
                  Wrap up dinner ✓
                </Btn>
              )}
            </div>
          )}

          {/* JOINER controls */}
          {!isHost && !isMember && plan.status === 'open' && (
            <div>
              {hasRequested ? (
                <div className="wk-box-accent px-4 py-3 text-sm text-center">
                  Request sent — waiting for host approval 🕐
                </div>
              ) : (
                <div className="flex gap-3">
                  <Btn className="flex-1" onClick={() => navigate(-1)}>Pass</Btn>
                  <Btn variant="primary" className="flex-[2]" onClick={handleJoin} disabled={spots === 0}>
                    {plan.joinSetting === 'approval' ? 'Request to join' : `Join — claim seat`}
                    {spots > 0 && <span className="ml-1 opacity-80">({spots} left)</span>}
                  </Btn>
                </div>
              )}
              <div className="text-ink-3 text-xs text-center mt-2">
                {plan.joinSetting === 'auto'
                  ? 'Bot will intro you — takes ~20 seconds'
                  : 'Host will review your request'}
              </div>
            </div>
          )}

          {/* Already a member */}
          {isMember && !isHost && (
            <Btn variant="primary" className="w-full" onClick={() => navigate(`/chat/${plan.id}`)}>
              <BotIcon /> Open group chat →
            </Btn>
          )}

          {/* Closed / DMs */}
          {plan.status === 'closed-dms' && !isMember && (
            <div className="wk-box-soft px-4 py-3 text-sm text-center">
              This plan is full, but the host is open to direct messages.
              <button onClick={() => navigate(`/chat/${plan.id}`)} className="block mt-2 text-accent font-semibold">Message host →</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function ShieldIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><polyline points="9,12 11,14 15,10"/>
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="13" rx="3"/>
      <line x1="12" y1="3" x2="12" y2="7"/>
      <circle cx="9" cy="13" r="1.2" fill="currentColor"/>
      <circle cx="15" cy="13" r="1.2" fill="currentColor"/>
    </svg>
  )
}
