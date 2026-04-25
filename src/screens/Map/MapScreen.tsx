import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlans, useCurrentUser } from '../../contexts/AppContext'
import TabBar from '../../components/layout/TabBar'
import PhiliaMap from '../../components/map/PhiliaMap'
import { Avatar, PlanCard } from '../../components/ui'
import { MOCK_USERS } from '../../lib/mockData'
import { formatCountdown, spotsLeft } from '../../lib/utils'
import type { Plan } from '../../types'

export default function MapScreen() {
  const navigate = useNavigate()
  const plans = usePlans()
  const user = useCurrentUser()

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showList, setShowList] = useState(false)

  const openPlans = plans.filter(p => p.status === 'open' || p.status === 'full')
  const totalSpots = openPlans.filter(p => p.status === 'open').reduce((s, p) => s + spotsLeft(p), 0)

  return (
    <div className="h-full relative">
      {/* Full-screen map */}
      <PhiliaMap
        plans={openPlans}
        onPinClick={(plan) => { setSelectedPlan(plan); setShowList(false) }}
      />

      {/* Top chrome */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4" style={{ paddingTop: 52 }}>
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-sm"
            style={{ border: '1.6px solid var(--line)', boxShadow: '2px 2px 0 var(--line)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span className="text-ink-3">nearby plans</span>
          </div>

          <button
            onClick={() => { setShowList(!showList); setSelectedPlan(null) }}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white active:scale-90 transition-transform"
            style={{ border: '1.6px solid var(--line)', boxShadow: '2px 2px 0 var(--line)' }}
          >
            {showList ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"><polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            )}
          </button>

          <button
            onClick={() => navigate('/start')}
            className="w-10 h-10 flex items-center justify-center rounded-2xl active:scale-90 transition-transform"
            style={{ background: 'var(--accent)', border: '1.6px solid var(--line)', boxShadow: '2px 2px 0 var(--line)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute z-10" style={{ top: 110, right: 14 }}>
        <div className="wk-box bg-white p-2.5 text-xs space-y-1.5">
          <div className="font-mono-sm text-ink-2">NEXT 6H</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="text-ink-2">{openPlans.filter(p => p.status === 'open').length} open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-ink-2">you</span>
          </div>
        </div>
      </div>

      {/* Selected plan card */}
      {selectedPlan && !showList && (
        <div className="absolute z-10 bottom-20 left-4 right-4">
          <div className="wk-box bg-white p-4" style={{ boxShadow: '3px 3px 0 var(--line)' }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold">{selectedPlan.restaurant.name}</div>
                <div className="text-ink-2 text-xs mt-0.5">{formatCountdown(selectedPlan.time)} · {selectedPlan.members.length}/{selectedPlan.groupSize} confirmed</div>
              </div>
              <button onClick={() => setSelectedPlan(null)} className="text-ink-3 text-lg leading-none">×</button>
            </div>

            {/* Members */}
            <div className="flex items-center gap-1.5 mb-3">
              {selectedPlan.members.slice(0, 4).map(uid => {
                const u = MOCK_USERS.find(x => x.id === uid)
                return u ? <Avatar key={uid} emoji={u.emoji} tone={u.tone} face={u.face} size="sm" /> : null
              })}
              {spotsLeft(selectedPlan) > 0 && (
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-ink-2"
                  style={{ border: '1.4px dashed var(--ink-3)' }}>
                  +{spotsLeft(selectedPlan)}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelectedPlan(null)} className="flex-1 wk-box bg-white py-2.5 text-sm font-semibold text-center active:scale-95 transition-transform">Pass</button>
              <button onClick={() => navigate(`/plan/${selectedPlan.id}`)} className="flex-[2] py-2.5 text-sm font-semibold text-center text-white rounded-2xl active:scale-95 transition-transform"
                style={{ background: 'var(--accent)', border: '1.6px solid var(--line)', boxShadow: '2px 2px 0 var(--line)' }}>
                See plan →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini summary bar */}
      {!selectedPlan && !showList && (
        <div className="absolute z-10 bottom-20 left-4 right-4">
          <div className="wk-box bg-white px-4 py-3 flex items-center justify-between" style={{ boxShadow: '2px 2px 0 var(--line)' }}>
            <div>
              <div className="font-display text-lg">{openPlans.length} plans, next 6h</div>
              <div className="text-ink-2 text-xs">{totalSpots} spots open</div>
            </div>
            <button onClick={() => navigate('/join')} className="wk-pill wk-pill-accent text-xs" style={{ color: '#fff' }}>find a table</button>
          </div>
        </div>
      )}

      {/* List view overlay */}
      {showList && (
        <div className="absolute z-10 bottom-16 left-0 right-0 bg-white overflow-hidden" style={{ top: 100, borderTop: '1.6px solid var(--line)', borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
          <div className="w-10 h-1 rounded-full mx-auto mt-2.5 mb-2" style={{ background: 'var(--ink-3)' }} />
          <div className="px-4 pb-1 flex justify-between items-center">
            <div className="font-display text-xl">{openPlans.length} plans nearby</div>
            <button onClick={() => setShowList(false)} className="text-ink-2 text-sm">map ↑</button>
          </div>
          <div className="overflow-y-auto px-4 pb-4 space-y-2" style={{ maxHeight: 'calc(100% - 60px)' }}>
            {openPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} currentUserId={user?.id}
                onClick={() => { setSelectedPlan(plan); setShowList(false) }} />
            ))}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  )
}
