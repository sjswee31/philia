import type { AvatarFaceInput } from '../lib/faces'

export type BudgetTier = '$' | '$$' | '$$$'
export type JoinSetting = 'auto' | 'approval' | 'invite'
export type PlanStatus = 'open' | 'full' | 'in-progress' | 'closed-dms' | 'past'

export interface UserProfile {
  id: string
  name: string
  photo: string
  emoji: string
  tone: string
  face?: AvatarFaceInput
  age?: number
  bio?: string
  foodPrefs: string[]
  vibeTags: string[]
  budget: BudgetTier
  groupSizePref: [number, number]
  instagram?: string
  snapchat?: string
  tiktok?: string
  location?: { lat: number; lng: number }
  reliability: number   // 0–100
  dinnerCount: number
  flakeCount: number
  connections: string[] // user ids
  vibeFeedback: { tag: string; count: number }[]
  isVerified: boolean
  isOnboarded: boolean
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  cuisines: string[]
  price: BudgetTier
  rating?: number
  photo?: string
}

export interface Plan {
  id: string
  hostId: string
  restaurant: Restaurant
  time: string           // ISO string
  groupSize: number      // target max
  members: string[]      // user ids (includes host)
  joinRequests: string[] // user ids pending approval
  joinSetting: JoinSetting
  budget: BudgetTier
  vibeTags: string[]
  note?: string
  status: PlanStatus
  chatMessages: ChatMessage[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  senderId: 'bot' | string
  content: string
  type: 'bot' | 'system' | 'direct'
  timestamp: string
  quickReplies?: string[]
}

export interface VibeRating {
  planId: string
  fromUserId: string
  toUserId: string
  tags: string[]
  attended: boolean
  createdAt: string
}

export interface MatchResult {
  plan: Plan
  score: number   // 0–99
  reasons: string[]
}
