import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser, usePlans } from '../../contexts/AppContext'
import TabBar from '../../components/layout/TabBar'
import PhiliaMap from '../../components/map/PhiliaMap'
import { PlanCard, SectionLabel, Pill } from '../../components/ui'
import { rankPlans } from '../../lib/matchScore'
import { FOOD_PREF_OPTIONS } from '../../lib/constants'
import { useGeolocation } from '../../lib/useGeolocation'
import type { Plan } from '../../types'

type ViewMode = 'split' | 'map' | 'list'

export default function JoinScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const plans = usePlans()
  const userLocation = useGeolocation()

  const [view, setView] = useState<ViewMode>('split')
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [budgetFilter, setBudgetFilter] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  if (!user) return null

  const filtered = useMemo(() => {
    const open = plans.filter(p => p.status === 'open' && !p.members.includes(user.id))
    return open.filter(p => {
      if (query) {
        const q = query.toLowerCase()
        if (!p.restaurant.name.toLowerCase().includes(q) &&
            !p.restaurant.cuisines.some(c => c.includes(q)) &&
            !p.vibeTags.some(t => t.includes(q))) return false
      }
      if (selectedTags.length > 0 && !selectedTags.some(t => p.vibeTags.includes(t) || p.restaurant.cuisines.includes(t))) return false
      if (budgetFilter && p.budget !== budgetFilter) return false
      return true
    })
  }, [plans, user.id, query, selectedTags, budgetFilter])

  const ranked = useMemo(() => rankPlans(user, filtered.length > 0 ? filtered : plans), [user, filtered, plans])

  function toggleTag(tag: string) {
    setSelectedTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])
  }

  return (
    <div className="h-full bg-paper relative flex flex-col">
      {/* Top search bar — floats over map */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4" style={{ paddingTop: 52 }}>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl text-sm"
            style={{ border: '1.6px solid var(--line)', boxShadow: '2px 2px 0 var(--line)' }}
          >
            <SearchIcon />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="ramen, vegetarian, chill…"
              className="flex-1 outline-none text-sm placeholder-ink-3 bg-transparent"
            />
          </div>
          {/* View toggle */}
          <div className="flex gap-1 bg-white rounded-2xl p-1" style={{ border: '1.6px solid var(--line)' }}>
            {([['split', '⊡'], ['map', '🗺'], ['list', '≡']] as [ViewMode, string][]).map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)}
                className="w-8 h-8 rounded-xl text-sm transition-all"
                style={{ background: view === v ? 'var(--accent)' : 'transparent', color: view === v ? '#fff' : 'var(--ink-2)' }}
              >{icon}</button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {(['$', '$$', '$$$'] as const).map(b => (
            <button key={b} onClick={() => setBudgetFilter(budgetFilter === b ? null : b)}
              className={`wk-pill text-xs flex-shrink-0 ${budgetFilter === b ? 'wk-pill-accent' : ''}`}
              style={{ color: budgetFilter === b ? '#fff' : 'var(--ink)' }}
            >{b}</button>
          ))}
          {['chill', 'post-class', 'quiet', 'loud'].map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className={`wk-pill text-xs flex-shrink-0 ${selectedTags.includes(tag) ? 'wk-pill-accent' : ''}`}
              style={{ color: selectedTags.includes(tag) ? '#fff' : 'var(--ink)' }}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* Map (shown in split or map view) */}
      {(view === 'split' || view === 'map') && (
        <div style={{ position: 'absolute', top: view === 'split' ? 130 : 0, left: 0, right: 0, height: view === 'split' ? '42%' : '100%' }}>
          <PhiliaMap
            plans={filtered.length > 0 ? filtered : plans.filter(p => p.status === 'open')}
            onPinClick={(plan) => {
              setSelectedPlan(plan)
              if (view === 'map') setView('split')
            }}
            currentUserLocation={userLocation ?? undefined}
          />
          {view === 'map' && (
            <div className="absolute top-16 right-3">
              <div className="wk-box bg-white p-2 text-xs">
                <div className="font-mono-sm text-ink-2">NEXT 6H</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                  <span className="text-ink-2">active</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-ink-2">you</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom sheet (split) or full list (list view) */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-white overflow-hidden flex flex-col"
        style={{
          top: view === 'list' ? 120 : view === 'split' ? '44%' : undefined,
          borderTop: '1.6px solid var(--line)',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          display: view === 'map' ? 'none' : 'flex',
        }}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'var(--ink-3)' }} />
        </div>

        <div className="px-4 pb-1 flex items-center justify-between flex-shrink-0">
          <div className="font-display text-xl">
            {filtered.length} match{filtered.length !== 1 ? 'es' : ''} near you
          </div>
          <div className="font-mono-sm text-ink-2">AI ranked</div>
        </div>

        {/* Selected plan quick card */}
        {selectedPlan && (
          <div className="px-4 mb-2 flex-shrink-0">
            <div className="wk-box-accent px-3 py-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{selectedPlan.restaurant.name}</div>
                <div className="text-ink-2 text-xs">tapped on map</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedPlan(null)} className="wk-pill text-xs">clear</button>
                <button onClick={() => navigate(`/plan/${selectedPlan.id}`)} className="wk-pill wk-pill-accent text-xs" style={{ color: '#fff' }}>view →</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-2">
          {ranked.length === 0 ? (
            <div className="text-center py-8 text-ink-2 text-sm">No open plans match your filters.</div>
          ) : ranked.map(({ plan, score, reasons }) => (
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

      <TabBar />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
