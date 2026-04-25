import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser, useApp } from '../../contexts/AppContext'
import Header from '../../components/layout/Header'
import { Btn, Chip, Pill } from '../../components/ui'
import { RESTAURANTS, VIBE_TAG_OPTIONS } from '../../lib/constants'
import { generateId, formatTime } from '../../lib/utils'
import type { Plan, Restaurant, JoinSetting } from '../../types'

function getTimeSlots(): { label: string; iso: string }[] {
  const slots = []
  const now = new Date()
  const rounded = new Date(now)
  rounded.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0)

  slots.push({ label: 'NOW', iso: new Date().toISOString() })
  for (let i = 1; i <= 14; i++) {
    const t = new Date(rounded.getTime() + i * 15 * 60 * 1000)
    const end = new Date(now.getTime() + 6 * 60 * 60 * 1000)
    if (t <= end) {
      slots.push({ label: t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), iso: t.toISOString() })
    }
  }
  return slots
}

export default function StartPlanScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { dispatch } = useApp()

  const [restaurantQuery, setRestaurantQuery] = useState('')
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [showRestaurantList, setShowRestaurantList] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [groupSize, setGroupSize] = useState(3)
  const [budget, setBudget] = useState<'$' | '$$' | '$$$'>(user?.budget ?? '$$')
  const [vibeTags, setVibeTags] = useState<string[]>([])
  const [joinSetting, setJoinSetting] = useState<JoinSetting>('auto')
  const [note, setNote] = useState('')

  const timeSlots = useMemo(() => getTimeSlots(), [])

  const filteredRestaurants = useMemo(() =>
    RESTAURANTS.filter(r =>
      r.name.toLowerCase().includes(restaurantQuery.toLowerCase()) ||
      r.cuisines.some(c => c.toLowerCase().includes(restaurantQuery.toLowerCase()))
    ), [restaurantQuery]
  )

  function toggleVibe(tag: string) {
    setVibeTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])
  }

  function canSubmit() {
    return selectedRestaurant && selectedTime && user
  }

  function createPlan() {
    if (!canSubmit() || !user || !selectedRestaurant || !selectedTime) return
    const plan: Plan = {
      id: `p_${generateId()}`,
      hostId: user.id,
      restaurant: selectedRestaurant,
      time: selectedTime,
      groupSize,
      members: [user.id],
      joinRequests: [],
      joinSetting,
      budget,
      vibeTags,
      note: note.trim() || undefined,
      status: 'open',
      chatMessages: [{
        id: `bot_${generateId()}`,
        senderId: 'bot',
        content: `Plan created! You're looking for ${groupSize - 1} more at ${selectedRestaurant.name}, ${formatTime(selectedTime)}. I'll notify you when someone wants to join${joinSetting === 'approval' ? " — you'll need to approve them" : ''}.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_PLAN', plan })
    navigate(`/plan/${plan.id}`)
  }

  return (
    <div className="h-full bg-paper relative">
      <Header title="New plan" />

      <div className="screen-scroll" style={{ paddingTop: 90 }}>
        <div className="px-5 space-y-5 pb-6">

          {/* Restaurant */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">WHERE</div>
            {selectedRestaurant ? (
              <div className="wk-box px-4 py-3 flex items-center justify-between" style={{ boxShadow: '2px 2px 0 var(--line)' }}>
                <div>
                  <div className="font-semibold text-sm">{selectedRestaurant.name}</div>
                  <div className="text-ink-2 text-xs mt-0.5">{selectedRestaurant.address} · {selectedRestaurant.price}</div>
                </div>
                <button onClick={() => { setSelectedRestaurant(null); setRestaurantQuery('') }} className="text-ink-2 text-xs underline">change</button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={restaurantQuery}
                  onChange={e => { setRestaurantQuery(e.target.value); setShowRestaurantList(true) }}
                  onFocus={() => setShowRestaurantList(true)}
                  placeholder="Search Ithaca restaurants…"
                  className="w-full wk-box bg-white px-4 py-3 text-sm outline-none placeholder-ink-3"
                />
                {showRestaurantList && restaurantQuery && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 wk-box bg-white overflow-hidden max-h-48 overflow-y-auto" style={{ boxShadow: '3px 3px 0 var(--line)' }}>
                    {filteredRestaurants.length === 0 ? (
                      <div className="px-4 py-3 text-ink-2 text-sm">No matches — try a different search</div>
                    ) : filteredRestaurants.map(r => (
                      <button key={r.id} onClick={() => { setSelectedRestaurant(r); setRestaurantQuery(r.name); setShowRestaurantList(false) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-paper active:bg-paper-soft flex justify-between"
                        style={{ borderBottom: '1px solid var(--ink-3)', borderBottomColor: 'rgba(0,0,0,0.06)' }}
                      >
                        <div>
                          <div className="text-sm font-medium">{r.name}</div>
                          <div className="text-ink-2 text-xs">{r.cuisines.slice(0, 2).join(' · ')}</div>
                        </div>
                        <div className="text-ink-2 text-xs self-center">{r.price}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">WHEN</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {timeSlots.map(slot => (
                <button key={slot.iso} onClick={() => setSelectedTime(slot.iso)}
                  className="wk-pill flex-shrink-0 px-4 py-2 text-sm transition-all active:scale-95"
                  style={{
                    background: selectedTime === slot.iso ? 'var(--accent)' : '#fff',
                    color: selectedTime === slot.iso ? '#fff' : 'var(--ink)',
                    boxShadow: selectedTime === slot.iso ? '2px 2px 0 var(--line)' : 'none',
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {selectedTime && (
              <div className="mt-2 text-xs text-ink-2 text-center">
                Selected: <span className="font-semibold text-ink">{formatTime(selectedTime)}</span>
              </div>
            )}
          </div>

          {/* Group size */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">GROUP SIZE (INCLUDING YOU)</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setGroupSize(s => Math.max(2, s - 1))}
                className="w-10 h-10 wk-box bg-white flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">
                −
              </button>
              <div className="font-display text-3xl flex-1 text-center">{groupSize}</div>
              <button onClick={() => setGroupSize(s => Math.min(6, s + 1))}
                className="w-10 h-10 wk-box bg-white flex items-center justify-center text-xl font-bold active:scale-90 transition-transform">
                +
              </button>
            </div>
            <div className="text-ink-3 text-xs text-center mt-1">2–6 people</div>
          </div>

          {/* Budget */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">BUDGET PER PERSON</div>
            <div className="flex gap-2">
              {(['$', '$$', '$$$'] as const).map(b => (
                <button key={b} onClick={() => setBudget(b)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border"
                  style={{
                    borderWidth: '1.6px', borderColor: 'var(--line)',
                    background: budget === b ? 'var(--accent)' : '#fff',
                    color: budget === b ? '#fff' : 'var(--ink)',
                    boxShadow: budget === b ? '2px 2px 0 var(--line)' : 'none',
                  }}
                >{b}</button>
              ))}
            </div>
          </div>

          {/* Vibe tags */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">VIBE (PICK 1–3)</div>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAG_OPTIONS.map(tag => (
                <button key={tag} onClick={() => toggleVibe(tag)}
                  className={`wk-pill text-xs transition-all active:scale-95 ${vibeTags.includes(tag) ? 'wk-pill-accent' : ''}`}
                  style={{ color: vibeTags.includes(tag) ? '#fff' : 'var(--ink)' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Join setting */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">WHO CAN JOIN</div>
            <div className="space-y-2">
              {([
                { value: 'auto',     label: 'Auto-join',       desc: 'Anyone can join instantly — fastest filling' },
                { value: 'approval', label: 'Host approval',    desc: 'You approve each person before they join' },
                { value: 'invite',   label: 'Invite only',      desc: 'You invite specific people directly' },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => setJoinSetting(opt.value)}
                  className="w-full wk-box px-4 py-3 text-left flex items-center gap-3 active:scale-[.99] transition-transform"
                  style={{ background: joinSetting === opt.value ? 'var(--accent-soft)' : '#fff' }}
                >
                  <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ border: `2px solid ${joinSetting === opt.value ? 'var(--accent)' : 'var(--ink-3)'}` }}
                  >
                    {joinSetting === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-ink-2 text-xs">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="font-mono-sm text-ink-2 mb-2">NOTE TO JOINERS (OPTIONAL)</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="post-prelim comfort food run 😮‍💨"
              className="w-full wk-box bg-white px-4 py-3 text-sm outline-none resize-none placeholder-ink-3"
            />
          </div>

          {/* Estimate */}
          {selectedRestaurant && groupSize > 0 && (
            <div className="wk-box-accent px-4 py-3">
              <div className="font-mono-sm text-ink-2">BOT WILL FIND</div>
              <div className="font-display text-xl mt-1">~{Math.floor(Math.random() * 8) + 3} strong matches</div>
              <div className="text-ink-2 text-xs mt-0.5">verified, 90%+ reliability, similar vibe</div>
            </div>
          )}

          <Btn variant="primary" className="w-full" onClick={createPlan} disabled={!canSubmit()}>
            Drop the plan
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3,3 21,12 3,21 6,12"/>
            </svg>
          </Btn>
        </div>
      </div>
    </div>
  )
}
