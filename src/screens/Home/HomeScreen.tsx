import { useNavigate } from 'react-router-dom'
import { useCurrentUser, usePlans, useUsers, useApp } from '../../contexts/AppContext'
import { Avatar, PlanCard, Pill, SectionLabel } from '../../components/ui'
import TabBar from '../../components/layout/TabBar'
import { rankPlans } from '../../lib/matchScore'
import { MOCK_USERS } from '../../lib/mockData'
import { formatCountdown } from '../../lib/utils'

export default function HomeScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const plans = usePlans()
  const { state } = useApp()

  if (!user) return null

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'

  const openPlans = plans.filter(p => p.status === 'open')
  const myActivePlans = plans.filter(p => p.members.includes(user.id) && (p.status === 'open' || p.status === 'full' || p.status === 'in-progress'))
  const ranked = rankPlans(user, plans).slice(0, 4)

  // Past connections (unique users from past plans)
  const pastConnections = plans
    .filter(p => p.members.includes(user.id) && p.status === 'past')
    .flatMap(p => p.members)
    .filter((id, i, arr) => id !== user.id && arr.indexOf(id) === i)
    .slice(0, 6)
    .map(id => MOCK_USERS.find(u => u.id === id))
    .filter(Boolean)

  return (
    <div className="h-full bg-paper relative">
      <div className="screen-scroll px-5">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-14 pb-2">
          <div>
            <div className="font-mono-sm text-ink-2">{now.toLocaleDateString('en-US', { weekday: 'long' })} · {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
            <div className="font-display text-2xl text-ink mt-0.5">{greeting}, {user.name.split(' ')[0]}.</div>
          </div>
          <button onClick={() => navigate('/profile')} className="active:scale-90 transition-transform">
            <Avatar emoji={user.emoji} tone={user.tone} face={user.face} photo={user.photo} />
          </button>
        </div>

        {/* Live pulse counter */}
        <div className="wk-box-soft flex items-center gap-3 px-4 py-3 mt-3" style={{ borderRadius: 14 }}>
          <div className="relative flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <div className="ping absolute inset-0 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
          <div className="text-sm">
            <span className="font-display text-lg" style={{ color: 'var(--accent)' }}>{openPlans.length} plans</span>
            <span className="text-ink-2"> live near you in the next 6h</span>
          </div>
        </div>

        {/* My active plans */}
        {myActivePlans.length > 0 && (
          <div className="mt-5">
            <SectionLabel>YOUR PLANS</SectionLabel>
            <div className="space-y-2 mt-2">
              {myActivePlans.map(plan => (
                <div key={plan.id} onClick={() => navigate(`/plan/${plan.id}`)}
                  className="wk-box-accent px-4 py-3 cursor-pointer active:scale-[.99] transition-transform flex justify-between items-center"
                  style={{ boxShadow: '2px 2px 0 var(--line)' }}
                >
                  <div>
                    <div className="font-semibold text-sm">{plan.restaurant.name}</div>
                    <div className="text-ink-2 text-xs mt-0.5">{formatCountdown(plan.time)} · {plan.members.length}/{plan.groupSize} confirmed</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.hostId === user.id && state.plans.find(p => p.id === plan.id)?.joinRequests.length ? (
                      <Pill filled className="text-xs">{state.plans.find(p => p.id === plan.id)!.joinRequests.length} pending</Pill>
                    ) : null}
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/chat/${plan.id}`) }}
                      className="wk-pill text-xs"
                    >chat →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate('/start')}
            className="flex-1 rounded-2xl p-5 text-left active:scale-[.98] transition-transform relative overflow-hidden"
            style={{ background: 'var(--accent)', border: '1.6px solid var(--line)', boxShadow: '3px 3px 0 var(--line)' }}
          >
            <div className="font-display text-2xl text-white">Start a plan</div>
            <div className="text-white/80 text-xs mt-1">Pick a spot, drop a time.</div>
            <div className="absolute top-4 right-4 text-white/60 text-2xl">+</div>
          </button>
          <button
            onClick={() => navigate('/join')}
            className="flex-1 rounded-2xl p-5 text-left bg-white active:scale-[.98] transition-transform relative"
            style={{ border: '1.6px solid var(--line)', boxShadow: '3px 3px 0 var(--line)' }}
          >
            <div className="font-display text-2xl text-ink">Join a plan</div>
            <div className="text-ink-2 text-xs mt-1">{openPlans.length} groups open.</div>
            {/* Mini avatar stack */}
            <div className="flex mt-2 -space-x-2">
              {MOCK_USERS.slice(0, 4).map(u => (
                <Avatar key={u.id} emoji={u.emoji} tone={u.tone} face={u.face} size="sm" className="border-white" style={{ borderColor: '#fff' } as React.CSSProperties} />
              ))}
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] text-ink-2 font-bold" style={{ background: '#f0ebe3', border: '1.4px solid var(--line)' }}>
                +{Math.max(0, openPlans.reduce((s, p) => s + p.members.length, 0) - 4)}
              </div>
            </div>
          </button>
        </div>

        {/* Nearby plans feed */}
        {ranked.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>HAPPENING SOON</SectionLabel>
              <button onClick={() => navigate('/join')} className="text-xs text-ink-2 underline">see all</button>
            </div>
            <div className="space-y-2">
              {ranked.map(({ plan, score, reasons }) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  score={score}
                  scoreReasons={reasons}
                  currentUserId={user.id}
                  onClick={() => navigate(`/plan/${plan.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Past connections */}
        {(pastConnections.length > 0 || MOCK_USERS.slice(0, 4).length > 0) && (
          <div className="mt-6">
            <SectionLabel>PEOPLE YOU'VE EATEN WITH</SectionLabel>
            <div className="flex gap-3 mt-2 overflow-x-auto pb-1">
              {(pastConnections.length > 0 ? pastConnections : MOCK_USERS.slice(0, 5)).map(u => u && (
                <button key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-95 transition-transform">
                  <Avatar emoji={u.emoji} tone={u.tone} face={u.face} />
                  <span className="text-xs text-ink-2">{u.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      <TabBar />
    </div>
  )
}
