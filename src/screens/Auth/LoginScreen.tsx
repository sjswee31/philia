import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, googleProvider, db, firebaseEnabled } from '../../lib/firebase'
import { useApp } from '../../contexts/AppContext'
import type { UserProfile } from '../../types'
import { generateId } from '../../lib/utils'
import { EMOJI_OPTIONS, TONE_OPTIONS } from '../../lib/constants'

export default function LoginScreen() {
  const navigate = useNavigate()
  const { dispatch } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const { user } = result

      if (firebaseEnabled) {
        // Check if profile already exists in Firestore
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const existing = snap.data() as UserProfile
          dispatch({ type: 'SET_CURRENT_USER', user: existing })
          navigate(existing.isOnboarded ? '/home' : '/onboarding')
          return
        }
      }

      // New user — create profile
      const idx = Math.floor(Math.random() * EMOJI_OPTIONS.length)
      const profile: UserProfile = {
        id: user.uid,
        name: user.displayName ?? 'New User',
        photo: user.photoURL ?? '',
        emoji: EMOJI_OPTIONS[idx],
        tone: TONE_OPTIONS[idx % TONE_OPTIONS.length],
        foodPrefs: [],
        vibeTags: [],
        budget: '$$',
        groupSizePref: [2, 4],
        reliability: 100,
        dinnerCount: 0,
        flakeCount: 0,
        connections: [],
        vibeFeedback: [],
        isVerified: true,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
      }

      if (firebaseEnabled) {
        await setDoc(doc(db, 'users', user.uid), profile)
      }

      dispatch({ type: 'SET_CURRENT_USER', user: profile })
      navigate('/onboarding')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed'
      setError(msg)
      setLoading(false)
    }
  }

  // Demo bypass — creates a local-only profile without Firebase
  function handleDemoSignIn() {
    const idx = 3
    const profile: UserProfile = {
      id: `demo_${generateId()}`,
      name: 'You',
      photo: '',
      emoji: EMOJI_OPTIONS[idx],
      tone: TONE_OPTIONS[idx],
      foodPrefs: [],
      vibeTags: [],
      budget: '$$',
      groupSizePref: [2, 4],
      reliability: 100,
      dinnerCount: 0,
      flakeCount: 0,
      connections: [],
      vibeFeedback: [],
      isVerified: false,
      isOnboarded: false,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'SET_CURRENT_USER', user: profile })
    navigate('/onboarding')
  }

  return (
    <div className="h-full bg-paper flex flex-col relative overflow-hidden">
      {/* Background texture dots */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(var(--ink) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ background: 'var(--accent-soft)', opacity: 0.6 }} />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full" style={{ background: 'var(--apricot-soft)', opacity: 0.5 }} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="font-display text-6xl text-ink mb-2">φιλία</div>
          <div className="font-display text-2xl text-ink-2">Philia</div>
          <div className="text-ink-2 text-sm mt-3 leading-relaxed max-w-xs text-center">
            Spontaneous same-day dining.<br/>Find your table in under 30 seconds.
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {['2–6 people', 'next 6 hours', 'verified students', 'bot-coordinated'].map(t => (
            <span key={t} className="wk-pill text-xs">{t}</span>
          ))}
        </div>

        {/* Sign in */}
        <div className="w-full space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-ink bg-white active:scale-[.98] transition-transform disabled:opacity-60"
            style={{ border: '1.6px solid var(--line)', boxShadow: '3px 3px 0 var(--line)' }}
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-ink-3 border-t-ink animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <button
            onClick={handleDemoSignIn}
            className="w-full py-3.5 rounded-2xl text-sm text-ink-2 font-medium active:scale-[.98] transition-transform"
            style={{ border: '1.4px dashed var(--ink-3)' }}
          >
            Try demo (no account needed)
          </button>
        </div>

        {error && (
          <div className="mt-4 text-xs text-red-600 text-center bg-red-50 rounded-xl px-4 py-2">
            {error.includes('Firebase') ? 'Firebase not configured — use demo mode' : error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pb-10 px-8 text-center relative z-10">
        <div className="text-ink-3 text-xs leading-relaxed">
          18+ · By continuing you agree to our terms.<br/>
          <span className="text-ink-2">iPhone users: add to Home Screen for push notifications.</span>
        </div>
      </div>
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
