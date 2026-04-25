import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { UserProfile, Plan, ChatMessage } from '../types'
import { MOCK_USERS, MOCK_PLANS } from '../lib/mockData'

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

const STORAGE_KEY = 'philia_user_profile'

const initialState: AppState = {
  currentUser: null,
  firebaseUid: null,
  users: MOCK_USERS,
  plans: MOCK_PLANS,
  isLoading: true,
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<Action>
} | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load persisted profile on mount (demo mode — no real Firebase Firestore needed)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
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
  }, [])

  // Persist current user whenever it changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.currentUser))
    }
  }, [state.currentUser])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
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
