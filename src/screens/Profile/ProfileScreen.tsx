import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser, useApp } from '../../contexts/AppContext'
import TabBar from '../../components/layout/TabBar'
import { Avatar, ReliabilityRing, Pill, Chip, SectionLabel, Divider, Btn } from '../../components/ui'
import { MOCK_USERS } from '../../lib/mockData'
import { FOOD_PREF_OPTIONS, VIBE_TAG_OPTIONS, EMOJI_OPTIONS, TONE_OPTIONS } from '../../lib/constants'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { dispatch, state } = useApp()
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user?.bio ?? '')
  const [instagram, setInstagram] = useState(user?.instagram ?? '')
  const [snapchat, setSnapchat] = useState(user?.snapchat ?? '')
  const [tiktok, setTiktok] = useState(user?.tiktok ?? '')
  const [foodPrefs, setFoodPrefs] = useState<string[]>(user?.foodPrefs ?? [])
  const [vibeTags, setVibeTags] = useState<string[]>(user?.vibeTags ?? [])
  const [budget, setBudget] = useState<'$' | '$$' | '$$$'>(user?.budget ?? '$$')

  if (!user) return null

  function saveEdits() {
    dispatch({ type: 'UPDATE_CURRENT_USER', updates: { bio, instagram, snapchat, tiktok, foodPrefs, vibeTags, budget } })
    setEditing(false)
  }

  function logout() {
    localStorage.removeItem('philia_user_profile')
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  const pastConnections = state.plans
    .filter(p => p.members.includes(user.id))
    .flatMap(p => p.members)
    .filter((id, i, arr) => id !== user.id && arr.indexOf(id) === i)
    .slice(0, 8)
    .map(id => MOCK_USERS.find(u => u.id === id))
    .filter(Boolean)

  const displayConnections = pastConnections.length > 0 ? pastConnections : MOCK_USERS.slice(0, 5)

  return (
    <div className="h-full bg-paper relative">
      <div className="screen-scroll px-5">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-14 pb-2">
          <div className="font-display text-2xl">profile</div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="wk-pill text-xs">cancel</button>
                <button onClick={saveEdits} className="wk-pill wk-pill-accent text-xs" style={{ color: '#fff' }}>save</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="wk-pill text-xs">edit</button>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="mt-2">
          {editing ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {EMOJI_OPTIONS.map((e, i) => (
                <button key={e} onClick={() => dispatch({ type: 'UPDATE_CURRENT_USER', updates: { emoji: e, tone: TONE_OPTIONS[i % TONE_OPTIONS.length] } })}
                  className={`transition-transform active:scale-90 ${user.emoji === e ? 'scale-110' : ''}`}
                  style={{ outline: user.emoji === e ? '2.5px solid var(--accent)' : 'none', borderRadius: 10 }}
                >
                  <Avatar emoji={e} tone={TONE_OPTIONS[i % TONE_OPTIONS.length]} />
                </button>
              ))}
            </div>
          ) : (
            <Avatar emoji={user.emoji} tone={user.tone} photo={user.photo} size="lg" />
          )}
          <div className="font-display text-3xl mt-3">{user.name}</div>
          {user.age && <div className="text-ink-2 text-sm mt-0.5">{user.age} · {user.isVerified ? 'verified' : 'unverified'}</div>}
        </div>

        {/* Reliability score */}
        <div className="wk-box-accent p-4 mt-4">
          <div className="flex justify-between items-end">
            <div>
              <SectionLabel>RELIABILITY</SectionLabel>
              <div className="font-display text-4xl mt-1" style={{ color: 'var(--accent)' }}>{user.reliability}%</div>
              <div className="text-ink-2 text-xs mt-1">
                {user.dinnerCount} attended · {user.flakeCount} flake{user.flakeCount !== 1 ? 's' : ''}
              </div>
            </div>
            <ReliabilityRing score={user.reliability} />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <SectionLabel>BIO</SectionLabel>
          {editing ? (
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
              placeholder="A sentence about you and what you're craving…"
              className="w-full wk-box bg-white px-4 py-3 text-sm outline-none resize-none placeholder-ink-3 mt-2"
            />
          ) : (
            <div className="text-sm text-ink mt-1.5 leading-relaxed">{user.bio || <span className="text-ink-3 italic">No bio yet — tap edit to add one</span>}</div>
          )}
        </div>

        {/* Social handles */}
        {(user.instagram || user.snapchat || user.tiktok || editing) && (
          <div className="mt-4">
            <SectionLabel>SOCIALS</SectionLabel>
            {editing ? (
              <div className="space-y-2 mt-2">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, placeholder: '@handle' },
                  { label: 'Snapchat',  val: snapchat,  set: setSnapchat,  placeholder: 'username' },
                  { label: 'TikTok',    val: tiktok,    set: setTiktok,    placeholder: '@handle' },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label} className="flex items-center gap-2 wk-box px-4 py-2.5 bg-white">
                    <span className="text-ink-2 text-xs w-16 flex-shrink-0">{label}</span>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                      className="flex-1 text-sm outline-none placeholder-ink-3 bg-transparent" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.instagram && <Pill className="text-xs">ig: {user.instagram}</Pill>}
                {user.snapchat && <Pill className="text-xs">snap: {user.snapchat}</Pill>}
                {user.tiktok && <Pill className="text-xs">tt: {user.tiktok}</Pill>}
              </div>
            )}
          </div>
        )}

        <Divider className="my-4" />

        {/* Food preferences */}
        <div>
          <SectionLabel>FOOD</SectionLabel>
          {editing ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {FOOD_PREF_OPTIONS.map(tag => (
                <button key={tag} onClick={() => setFoodPrefs(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])}
                  className={`wk-pill text-xs transition-all active:scale-95 ${foodPrefs.includes(tag) ? 'wk-pill-accent' : ''}`}
                  style={{ color: foodPrefs.includes(tag) ? '#fff' : 'var(--ink)' }}
                >{tag}</button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {(user.foodPrefs.length > 0 ? user.foodPrefs : ['nothing set yet']).map(t => <Pill key={t} className="text-xs">{t}</Pill>)}
            </div>
          )}
        </div>

        {/* Vibe tags */}
        <div className="mt-4">
          <SectionLabel>VIBE</SectionLabel>
          {editing ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {VIBE_TAG_OPTIONS.map(tag => (
                <button key={tag} onClick={() => setVibeTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])}
                  className={`wk-pill text-xs transition-all active:scale-95 ${vibeTags.includes(tag) ? 'wk-pill-accent' : ''}`}
                  style={{ color: vibeTags.includes(tag) ? '#fff' : 'var(--ink)' }}
                >{tag}</button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {(user.vibeTags.length > 0 ? user.vibeTags : ['nothing set yet']).map(t => <Chip key={t}>{t}</Chip>)}
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="mt-4">
          <SectionLabel>DEFAULT BUDGET</SectionLabel>
          {editing ? (
            <div className="flex gap-2 mt-2">
              {(['$', '$$', '$$$'] as const).map(b => (
                <button key={b} onClick={() => setBudget(b)}
                  className="flex-1 py-2.5 rounded-2xl font-bold text-sm border transition-all"
                  style={{
                    borderWidth: '1.6px', borderColor: 'var(--line)',
                    background: budget === b ? 'var(--accent)' : '#fff',
                    color: budget === b ? '#fff' : 'var(--ink)',
                  }}>{b}</button>
              ))}
            </div>
          ) : (
            <div className="mt-2">
              <Pill filled className="text-xs">{user.budget}</Pill>
            </div>
          )}
        </div>

        {/* Vibe feedback from others */}
        {user.vibeFeedback.length > 0 && (
          <div className="mt-4">
            <SectionLabel>SAID BY PAST DINNER CREW</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.vibeFeedback.map(({ tag, count }) => (
                <Pill key={tag} className="text-xs">
                  {tag} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>×{count}</span>
                </Pill>
              ))}
            </div>
          </div>
        )}

        <Divider className="my-4" />

        {/* Connections */}
        <div>
          <SectionLabel>PAST CONNECTIONS · {displayConnections.length}</SectionLabel>
          <div className="flex flex-wrap gap-3 mt-2">
            {displayConnections.map(u => u && (
              <button key={u.id} onClick={() => navigate(`/profile/${u.id}`)} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                <Avatar emoji={u.emoji} tone={u.tone} />
                <span className="text-xs text-ink-2">{u.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <button onClick={logout} className="w-full py-3 text-sm text-ink-2 font-medium rounded-2xl active:scale-[.98] transition-transform"
            style={{ border: '1.4px dashed var(--ink-3)' }}>
            Sign out
          </button>
        </div>

        <div className="h-4" />
      </div>
      <TabBar />
    </div>
  )
}
