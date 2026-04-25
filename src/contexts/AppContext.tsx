import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { UserProfile, Plan, ChatMessage } from '../types'
import { MOCK_USERS, MOCK_PLANS } from '../lib/mockData'
import { firebaseEnabled, auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection, doc, setDoc, updateDoc, onSnapshot, getDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'

interface AppState {
  currentUser: UserProfile | null
  firebaseUid: string | null
  users: UserProfile[]
  plans: Plan[]
  isLoading: boolean
}

type Action =
  | { type: 'SET_FIREBASE_USER'; uid: string; profile: UserProfile | null }
  | { type: 'SET_CURRENT_USER'; user: UserProfile }
  | { type: 'UPDATE_CURRENT_USER'; updates: Partial<UserProfile> }
  | { type: 'SET_PLANS'; plans: Plan[] }
  | { type: 'SET_USERS'; users: UserProfile[] }
  | { type: 'ADD_PLAN'; plan: Plan }
  | { type: 'UPDATE_PLAN'; planId: string; updates: Partial<Plan> }
  | { type: 'ADD_CHAT_MESSAGE'; planId: string; message: ChatMessage }
  | { type: 'JOIN_PLAN'; planId: string; userId: string }
  | { type: 'REQUEST_JOIN'; planId: string; userId: string }
  | { type: 'APPROVE_JOIN'; planId: string; userId: string }
  | { type: 'DECLINE_JOIN'; planId: string; userId: string }
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'LOGOUT' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FIREBASE_USER':
      return { ...state, firebaseUid: action.uid, currentUser: action.profile, isLoading: false }

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.user }

    case 'UPDATE_CURRENT_USER':
      if (!state.currentUser) return state
      return { ...state, currentUser: { ...state.currentUser, ...action.updates } }

    case 'SET_PLANS':
      return { ...state, plans: action.plans }

    case 'SET_USERS':
      return { ...state, users: action.users }

    case 'ADD_PLAN':
      return { ...state, plans: [action.plan, ...state.plans] }

    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: state.plans.map(p => p.id === action.planId ? { ...p, ...action.updates } : p),
      }

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        plans: state.plans.map(p =>
          p.id === action.planId
            ? { ...p, chatMessages: [...p.chatMessages, action.message] }
            : p
        ),
      }

    case 'JOIN_PLAN': {
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderId: 'bot',
        content: `${state.users.find(u => u.id === action.userId)?.name ?? 'Someone'} just joined the table!`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      return {
        ...state,
        plans: state.plans.map(p => {
          if (p.id !== action.planId) return p
          const members = [...p.members, action.userId]
          const status = members.length >= p.groupSize ? 'full' : 'open'
          return { ...p, members, status, chatMessages: [...p.chatMessages, botMsg] }
        }),
      }
    }

    case 'REQUEST_JOIN':
      return {
        ...state,
        plans: state.plans.map(p =>
          p.id === action.planId && !p.joinRequests.includes(action.userId)
            ? { ...p, joinRequests: [...p.joinRequests, action.userId] }
            : p
        ),
      }

    case 'APPROVE_JOIN': {
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderId: 'bot',
        content: `${state.users.find(u => u.id === action.userId)?.name ?? 'Someone'} was added to the group!`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      return {
        ...state,
        plans: state.plans.map(p => {
          if (p.id !== action.planId) return p
          const members = [...p.members, action.userId]
          const joinRequests = p.joinRequests.filter(id => id !== action.userId)
          const status = members.length >= p.groupSize ? 'full' : 'open'
          return { ...p, members, joinRequests, status, chatMessages: [...p.chatMessages, botMsg] }
        }),
      }
    }

    case 'DECLINE_JOIN':
      return {
        ...state,
        plans: state.plans.map(p =>
          p.id === action.planId
            ? { ...p, joinRequests: p.joinRequests.filter(id => id !== action.userId) }
            : p
        ),
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.value }

    case 'LOGOUT':
      return { ...state, currentUser: null, firebaseUid: null }

    default:
      return state
  }
}

const initialState: AppState = {
  currentUser: null,
  firebaseUid: null,
  users: MOCK_USERS,
  plans: firebaseEnabled ? [] : MOCK_PLANS,
  isLoading: true,
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // ── Auth listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!firebaseEnabled) {
      const stored = localStorage.getItem('philia_user_profile')
      if (stored) {
        try {
          const profile: UserProfile = JSON.parse(stored)
          dispatch({ type: 'SET_FIREBASE_USER', uid: profile.id, profile })
        } catch {
          dispatch({ type: 'SET_LOADING', value: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', value: false })
      }
      return
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        const profile = snap.exists() ? (snap.data() as UserProfile) : null
        dispatch({ type: 'SET_FIREBASE_USER', uid: fbUser.uid, profile })
      } else {
        dispatch({ type: 'SET_LOADING', value: false })
      }
    })
    return unsub
  }, [])

  // ── Real-time plans listener ───────────────────────────────────
  useEffect(() => {
    if (!firebaseEnabled) return
    const unsub = onSnapshot(collection(db, 'plans'), (snap) => {
      const plans = snap.docs.map(d => d.data() as Plan)
      dispatch({ type: 'SET_PLANS', plans })
    })
    return unsub
  }, [])

  // ── Real-time users listener ───────────────────────────────────
  useEffect(() => {
    if (!firebaseEnabled) return
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(d => d.data() as UserProfile)
      dispatch({ type: 'SET_USERS', users })
    })
    return unsub
  }, [])

  // ── Persist demo user to localStorage (demo mode only) ─────────
  useEffect(() => {
    if (!firebaseEnabled && state.currentUser) {
      localStorage.setItem('philia_user_profile', JSON.stringify(state.currentUser))
    }
  }, [state.currentUser])

  // ── Firebase-aware dispatch ────────────────────────────────────
  function appDispatch(action: Action) {
    // Plan mutations in Firebase mode: write to Firestore only,
    // let the onSnapshot listener update local state
    const planMutations = ['ADD_PLAN', 'UPDATE_PLAN', 'ADD_CHAT_MESSAGE', 'JOIN_PLAN', 'REQUEST_JOIN', 'APPROVE_JOIN', 'DECLINE_JOIN']

    if (firebaseEnabled && planMutations.includes(action.type)) {
      writeToFirestore(action, state).catch(console.error)
    } else {
      dispatch(action)
      if (firebaseEnabled) {
        writeToFirestore(action, state).catch(console.error)
      }
    }
  }

  return <AppContext.Provider value={{ state, dispatch: appDispatch as React.Dispatch<Action> }}>{children}</AppContext.Provider>
}

async function writeToFirestore(action: Action, state: AppState) {
  if (!firebaseEnabled) return

  switch (action.type) {
    case 'ADD_PLAN':
      await setDoc(doc(db, 'plans', action.plan.id), action.plan)
      break

    case 'UPDATE_PLAN':
      await updateDoc(doc(db, 'plans', action.planId), action.updates as Record<string, unknown>)
      break

    case 'ADD_CHAT_MESSAGE':
      await updateDoc(doc(db, 'plans', action.planId), {
        chatMessages: arrayUnion(action.message),
      })
      break

    case 'JOIN_PLAN': {
      const plan = state.plans.find(p => p.id === action.planId)
      if (!plan) break
      const members = [...plan.members, action.userId]
      const status = members.length >= plan.groupSize ? 'full' : 'open'
      const userName = state.users.find(u => u.id === action.userId)?.name ?? 'Someone'
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderId: 'bot',
        content: `${userName} just joined the table! ${members.length}/${plan.groupSize} confirmed.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      await updateDoc(doc(db, 'plans', action.planId), {
        members: arrayUnion(action.userId),
        status,
        chatMessages: arrayUnion(botMsg),
      })
      break
    }

    case 'REQUEST_JOIN':
      await updateDoc(doc(db, 'plans', action.planId), {
        joinRequests: arrayUnion(action.userId),
      })
      break

    case 'APPROVE_JOIN': {
      const plan = state.plans.find(p => p.id === action.planId)
      if (!plan) break
      const members = [...plan.members, action.userId]
      const status = members.length >= plan.groupSize ? 'full' : 'open'
      const userName = state.users.find(u => u.id === action.userId)?.name ?? 'Someone'
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        senderId: 'bot',
        content: `${userName} was approved! ${members.length}/${plan.groupSize} confirmed.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      await updateDoc(doc(db, 'plans', action.planId), {
        members: arrayUnion(action.userId),
        joinRequests: arrayRemove(action.userId),
        status,
        chatMessages: arrayUnion(botMsg),
      })
      break
    }

    case 'DECLINE_JOIN':
      await updateDoc(doc(db, 'plans', action.planId), {
        joinRequests: arrayRemove(action.userId),
      })
      break

    case 'UPDATE_CURRENT_USER': {
      if (!state.currentUser) break
      await updateDoc(doc(db, 'users', state.currentUser.id), action.updates as Record<string, unknown>)
      break
    }
  }
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

export function useCurrentUser() {
  return useApp().state.currentUser
}

export function usePlans() {
  return useApp().state.plans
}

export function useUsers() {
  return useApp().state.users
}
