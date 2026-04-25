import type { UserProfile, Plan, ChatMessage } from '../types'
import { RESTAURANTS } from './constants'

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u_nico', name: 'Nico T.', photo: '', emoji: '🌿', tone: '#EAE3F4',
    age: 20, bio: 'CS junior, into climbing and late-night ramen runs. Low key, always down for good food.',
    foodPrefs: ['ramen', 'indian', 'japanese', 'vegetarian'],
    vibeTags: ['chill', 'post-class', 'quiet'], budget: '$$', groupSizePref: [2, 4],
    instagram: '@nico.tables', reliability: 100, dinnerCount: 18, flakeCount: 0,
    connections: ['u_avi', 'u_priya', 'u_wen'],
    vibeFeedback: [{ tag: 'punctual', count: 16 }, { tag: 'great host', count: 12 }, { tag: 'chill', count: 18 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'u_avi', name: 'Avi S.', photo: '', emoji: '🎧', tone: '#E6F0E2',
    age: 19, bio: 'Econ soph. Very much here for the KBBQ and boba.',
    foodPrefs: ['korean', 'bbq', 'boba', 'chinese'],
    vibeTags: ['loud', 'post-class', 'friend group'], budget: '$$$', groupSizePref: [3, 6],
    instagram: '@avindinner', snapchat: 'avisss', reliability: 96, dinnerCount: 12, flakeCount: 0,
    connections: ['u_nico', 'u_priya'],
    vibeFeedback: [{ tag: 'funny', count: 10 }, { tag: 'adventurous eater', count: 9 }, { tag: 'always orders well', count: 11 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'u_priya', name: 'Priya M.', photo: '', emoji: '🍓', tone: '#FDE6E6',
    age: 21, bio: 'Bio junior. I eat everything but anchovies. Big fan of hidden gem spots.',
    foodPrefs: ['indian', 'thai', 'vegetarian', 'korean'],
    vibeTags: ['chill', 'first-dates ok', 'quiet'], budget: '$$', groupSizePref: [2, 5],
    instagram: '@priyaeats', reliability: 92, dinnerCount: 15, flakeCount: 1,
    connections: ['u_nico', 'u_avi'],
    vibeFeedback: [{ tag: 'food knowledge', count: 14 }, { tag: 'great convo', count: 11 }, { tag: 'on time', count: 13 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'u_reni', name: 'Reni O.', photo: '', emoji: '📚', tone: '#F4ECDA',
    age: 22, bio: 'English senior, always studying but always eating. Loves bagels at 11pm.',
    foodPrefs: ['bagels', 'coffee', 'mediterranean', 'cheap eats'],
    vibeTags: ['study-after', 'quiet', 'chill'], budget: '$', groupSizePref: [2, 3],
    snapchat: 'reni_o', reliability: 88, dinnerCount: 9, flakeCount: 1,
    connections: ['u_nico'],
    vibeFeedback: [{ tag: 'bookworm', count: 8 }, { tag: 'low key', count: 10 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'u_sam', name: 'Sam W.', photo: '', emoji: '🐝', tone: '#F4ECDA',
    age: 20, bio: 'Arch student. I live in the library but emerge for ramen.',
    foodPrefs: ['ramen', 'japanese', 'korean', 'cheap eats'],
    vibeTags: ['post-class', 'chill', 'first-dates ok'], budget: '$', groupSizePref: [2, 4],
    instagram: '@samarch', reliability: 94, dinnerCount: 11, flakeCount: 0,
    connections: ['u_priya'],
    vibeFeedback: [{ tag: 'creative', count: 9 }, { tag: 'funny', count: 7 }, { tag: 'chill', count: 12 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'u_jules', name: 'Jules K.', photo: '', emoji: '🌊', tone: '#E2EBF1',
    age: 19, bio: 'Freshman figuring it out. Love sushi and meeting new people.',
    foodPrefs: ['sushi', 'japanese', 'boba', 'korean'],
    vibeTags: ['chill', 'friend group'], budget: '$$', groupSizePref: [3, 6],
    instagram: '@julesk_itha', reliability: 90, dinnerCount: 5, flakeCount: 0,
    connections: [],
    vibeFeedback: [{ tag: 'easy hang', count: 4 }, { tag: 'great energy', count: 5 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'u_wen', name: 'Wen L.', photo: '', emoji: '🦊', tone: '#FCEAE3',
    age: 21, bio: 'ORIE junior. Weekend chef, weekday takeout. Always down for something spicy.',
    foodPrefs: ['chinese', 'korean', 'indian', 'ramen'],
    vibeTags: ['chill', 'post-class', 'loud'], budget: '$$', groupSizePref: [2, 5],
    instagram: '@weneat', reliability: 98, dinnerCount: 20, flakeCount: 0,
    connections: ['u_nico', 'u_avi'],
    vibeFeedback: [{ tag: 'reliable', count: 18 }, { tag: 'good recommendations', count: 12 }, { tag: 'spice tolerance', count: 15 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'u_luna', name: 'Luna C.', photo: '', emoji: '🌙', tone: '#EAE3F4',
    age: 22, bio: 'Philosophy senior. Looking for real conversation and good food.',
    foodPrefs: ['mediterranean', 'vegetarian', 'japanese', 'boba'],
    vibeTags: ['chill', 'quiet', 'first-dates ok'], budget: '$$$', groupSizePref: [2, 4],
    instagram: '@lunac_cornell', reliability: 97, dinnerCount: 25, flakeCount: 0,
    connections: ['u_priya', 'u_wen'],
    vibeFeedback: [{ tag: 'deep convo', count: 20 }, { tag: 'always on time', count: 22 }, { tag: 'easy hang', count: 16 }],
    isVerified: true, isOnboarded: true, createdAt: '2025-12-01T00:00:00Z',
  },
]

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 60 * 60 * 1000).toISOString()
}
function minsFromNow(m: number): string {
  return new Date(Date.now() + m * 60 * 1000).toISOString()
}

function botMsg(id: string, content: string, mins = 0, quickReplies?: string[]): ChatMessage {
  return { id, senderId: 'bot', content, type: 'bot', timestamp: minsFromNow(-mins), quickReplies }
}

export const MOCK_PLANS: Plan[] = [
  {
    id: 'p1', hostId: 'u_nico',
    restaurant: RESTAURANTS[0], // Mehak
    time: hoursFromNow(1.5), groupSize: 4, budget: '$$',
    members: ['u_nico', 'u_avi', 'u_priya'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['chill', 'post-class'],
    note: 'post-prelim comfort food run 😮‍💨', status: 'open',
    createdAt: minsFromNow(-20),
    chatMessages: [
      botMsg('m1', "Plan created! 3/4 confirmed for Mehak Indian Cuisine at 7:00 pm. Looking for 1 more — I'll notify you when someone joins.", 20),
    ],
  },
  {
    id: 'p2', hostId: 'u_avi',
    restaurant: RESTAURANTS[1], // Koko KBBQ
    time: hoursFromNow(2), groupSize: 4, budget: '$$$',
    members: ['u_avi', 'u_jules'], joinRequests: ['u_sam'],
    joinSetting: 'approval', vibeTags: ['loud', 'friend group'],
    note: 'let\'s get the full AYCE experience', status: 'open',
    createdAt: minsFromNow(-35),
    chatMessages: [
      botMsg('m1', "Plan created! 2/4 confirmed for Koko Korean BBQ at 7:30 pm. Host approval is on — I'll ping you when someone wants to join.", 35),
      botMsg('m2', 'Sam W. wants to join your table. 94% match — same food prefs, chill vibe. Accept or decline?', 5, ['✅ Accept', '❌ Decline']),
    ],
  },
  {
    id: 'p3', hostId: 'u_reni',
    restaurant: RESTAURANTS[2], // CTB
    time: hoursFromNow(3.5), groupSize: 3, budget: '$',
    members: ['u_reni'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['study-after', 'quiet'],
    note: 'late night bagels after the library. bring your laptop if you want', status: 'open',
    createdAt: minsFromNow(-10),
    chatMessages: [
      botMsg('m1', 'Plan created! 1/3 confirmed for Collegetown Bagels at 9:30 pm. Looking for 2 more!', 10),
    ],
  },
  {
    id: 'p4', hostId: 'u_wen',
    restaurant: RESTAURANTS[8], // Plum Tree Japanese
    time: hoursFromNow(2.5), groupSize: 4, budget: '$$',
    members: ['u_wen', 'u_luna'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['chill', 'quiet'],
    status: 'open', createdAt: minsFromNow(-15),
    chatMessages: [
      botMsg('m1', 'Plan set! 2/4 at Plum Tree Japanese, 8:00 pm. 2 spots open.', 15),
    ],
  },
  {
    id: 'p5', hostId: 'u_sam',
    restaurant: RESTAURANTS[12], // Pho & Beyond
    time: hoursFromNow(1), groupSize: 3, budget: '$',
    members: ['u_sam', 'u_priya', 'u_jules'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['post-class', 'chill'],
    status: 'full', createdAt: minsFromNow(-45),
    chatMessages: [
      botMsg('m1', 'Group is full! 3/3 confirmed for Pho & Beyond at 6:00 pm. See you there 🍜', 45),
      botMsg('m2', 'Heads up — 30 mins to go. Vibe check time! How are you feeling?', 15, ['🟢 still in', '🟡 running 5', '🔴 can\'t make it']),
    ],
  },
]
