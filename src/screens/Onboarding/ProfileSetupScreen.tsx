import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../../lib/firebase'
import { useApp, useCurrentUser } from '../../contexts/AppContext'
import { Btn } from '../../components/ui'
import FaceEditor from '../../components/ui/FaceEditor'
import { FOOD_PREF_OPTIONS, VIBE_TAG_OPTIONS } from '../../lib/constants'
import { DEFAULT_FACE, normalizeFace } from '../../lib/faces'

type Step = 'basic' | 'food' | 'vibe' | 'done'

export default function ProfileSetupScreen() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const user = useCurrentUser()

  const [step, setStep] = useState<Step>('basic')
  const [name, setName] = useState(user?.name ?? '')
  const [age, setAge] = useState('')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [snapchat, setSnapchat] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [face, setFace] = useState(() => normalizeFace(user?.face ?? DEFAULT_FACE))
  const [foodPrefs, setFoodPrefs] = useState<string[]>([])
  const [vibeTags, setVibeTags] = useState<string[]>([])
  const [budget, setBudget] = useState<'$' | '$$' | '$$$'>('$$')

  const steps: Step[] = ['basic', 'food', 'vibe', 'done']
  const stepIndex = steps.indexOf(step)

  function toggleFood(tag: string) {
    setFoodPrefs((prev) => prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag])
  }

  function toggleVibe(tag: string) {
    setVibeTags((prev) => prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag])
  }

  async function finish() {
    if (!user) return
    const updates = {
      name: name.trim() || user.name,
      emoji, tone,
      age: age ? parseInt(age) : undefined,
      bio: bio.trim() || undefined,
      instagram: instagram.trim() || undefined,
      snapchat: snapchat.trim() || undefined,
      tiktok: tiktok.trim() || undefined,
      foodPrefs, vibeTags, budget,
      isOnboarded: true,
    }
    dispatch({ type: 'UPDATE_CURRENT_USER', updates })
    if (firebaseEnabled) {
      try {
        await setDoc(doc(db, 'users', user.id), { ...user, ...updates }, { merge: true })
      } catch (e) {
        console.error('Failed to save profile to Firestore:', e)
      }
    }
    navigate('/home')
  }

  return (
    <div className="h-full bg-paper flex flex-col">
      <div className="px-5 pt-14 pb-4">
        <div className="flex gap-1.5">
          {steps.slice(0, -1).map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= stepIndex ? 'var(--accent)' : '#E5DFD7' }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {step === 'basic' && (
          <div className="space-y-5">
            <div>
              <div className="font-display text-3xl text-ink">Set up your table.</div>
              <div className="text-ink-2 text-sm mt-1">Others will see this when you join their plan.</div>
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-2">PICK YOUR AVATAR</div>
              <FaceEditor value={face} onChange={setFace} />
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-1.5">NAME</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full wk-box px-4 py-3 text-sm bg-white outline-none placeholder-ink-3"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-1.5">AGE (18+)</div>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 20"
                type="number"
                min="18"
                max="99"
                className="w-full wk-box px-4 py-3 text-sm bg-white outline-none placeholder-ink-3"
              />
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-1.5">BIO (OPTIONAL)</div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A sentence about you and what you're craving..."
                rows={2}
                className="w-full wk-box px-4 py-3 text-sm bg-white outline-none resize-none placeholder-ink-3"
              />
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-2">SOCIAL HANDLES (OPTIONAL)</div>
              <div className="space-y-2">
                {[
                  { label: 'Instagram', val: instagram, set: setInstagram, placeholder: '@yourhandle' },
                  { label: 'Snapchat', val: snapchat, set: setSnapchat, placeholder: 'yoursnap' },
                  { label: 'TikTok', val: tiktok, set: setTiktok, placeholder: '@yourtiktok' },
                ].map(({ label, val, set, placeholder }) => (
                  <div key={label} className="flex items-center gap-2 wk-box px-4 py-3 bg-white">
                    <span className="text-ink-2 text-xs w-16 flex-shrink-0">{label}</span>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 text-sm outline-none placeholder-ink-3 bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Btn variant="primary" className="w-full mt-2" onClick={() => setStep('food')} disabled={!name.trim() || !age || parseInt(age, 10) < 18}>
              Next {'->'}
            </Btn>
          </div>
        )}

        {step === 'food' && (
          <div className="space-y-5">
            <div>
              <div className="font-display text-3xl text-ink">What are you into?</div>
              <div className="text-ink-2 text-sm mt-1">Pick as many as you like. We use these to match you.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FOOD_PREF_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFood(tag)}
                  className={`wk-pill text-xs transition-all active:scale-95 ${foodPrefs.includes(tag) ? 'wk-pill-accent' : ''}`}
                  style={{ color: foodPrefs.includes(tag) ? '#fff' : 'var(--ink)' }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="text-ink-3 text-xs text-center">{foodPrefs.length} selected</div>

            <div className="flex gap-3">
              <Btn className="flex-1" onClick={() => setStep('basic')}>Back</Btn>
              <Btn variant="primary" className="flex-1" onClick={() => setStep('vibe')} disabled={foodPrefs.length === 0}>
                Next {'->'}
              </Btn>
            </div>
          </div>
        )}

        {step === 'vibe' && (
          <div className="space-y-5">
            <div>
              <div className="font-display text-3xl text-ink">Your vibe.</div>
              <div className="text-ink-2 text-sm mt-1">Set the tags and budget you usually want.</div>
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-2">VIBE TAGS</div>
              <div className="flex flex-wrap gap-2">
                {VIBE_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleVibe(tag)}
                    className={`wk-pill text-xs transition-all active:scale-95 ${vibeTags.includes(tag) ? 'wk-pill-accent' : ''}`}
                    style={{ color: vibeTags.includes(tag) ? '#fff' : 'var(--ink)' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono-sm text-ink-2 mb-2">DEFAULT BUDGET</div>
              <div className="flex gap-2">
                {(['$', '$$', '$$$'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setBudget(option)}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 border"
                    style={{
                      borderWidth: '1.6px',
                      borderColor: 'var(--line)',
                      background: budget === option ? 'var(--accent)' : '#fff',
                      color: budget === option ? '#fff' : 'var(--ink)',
                      boxShadow: budget === option ? '2px 2px 0 var(--line)' : 'none',
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Btn className="flex-1" onClick={() => setStep('food')}>Back</Btn>
              <Btn variant="primary" className="flex-1" onClick={finish}>
                Done
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
