import type { UserProfile, Plan, ChatMessage } from '../types'
import { RESTAURANTS } from './constants'
import { randomFace } from './faces'

const RAW_MOCK_USERS: UserProfile[] = [
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
  {
    id: 'u_kai', name: 'Kai R.', photo: '', emoji: '🌶️', tone: '#FCEAE3',
    age: 23, bio: 'Mech eng grad student. Spicy food enthusiast, will rate any szechuan place 1-10.',
    foodPrefs: ['chinese', 'thai', 'indian', 'korean'],
    vibeTags: ['adventurous', 'foodies only', 'loud'], budget: '$$', groupSizePref: [3, 6],
    instagram: '@kai.eats.spice', reliability: 95, dinnerCount: 22, flakeCount: 1,
    connections: ['u_wen', 'u_luna'],
    vibeFeedback: [{ tag: 'adventurous eater', count: 19 }, { tag: 'great rec list', count: 14 }, { tag: 'fun energy', count: 13 }],
    isVerified: true, isOnboarded: true, createdAt: '2025-11-12T00:00:00Z',
  },
  {
    id: 'u_mira', name: 'Mira H.', photo: '', emoji: '🌸', tone: '#FDE6E6',
    age: 20, bio: 'HotelEx soph. Will judge your pasta but lovingly.',
    foodPrefs: ['italian', 'mediterranean', 'pizza', 'coffee'],
    vibeTags: ['first-dates ok', 'quiet', 'foodies only'], budget: '$$$', groupSizePref: [2, 4],
    instagram: '@mira.tastes', reliability: 93, dinnerCount: 14, flakeCount: 1,
    connections: ['u_luna', 'u_jules'],
    vibeFeedback: [{ tag: 'great palate', count: 11 }, { tag: 'thoughtful host', count: 9 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'u_theo', name: 'Theo B.', photo: '', emoji: '🎲', tone: '#E2EBF1',
    age: 21, bio: 'Math jr. Board games + pho is my ideal Friday.',
    foodPrefs: ['vietnamese', 'ramen', 'cheap eats', 'boba'],
    vibeTags: ['chill', 'friend group', 'post-class'], budget: '$', groupSizePref: [3, 5],
    snapchat: 'theo.b', reliability: 91, dinnerCount: 10, flakeCount: 1,
    connections: ['u_sam', 'u_jules'],
    vibeFeedback: [{ tag: 'funny', count: 8 }, { tag: 'easy hang', count: 11 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'u_zara', name: 'Zara F.', photo: '', emoji: '⚡', tone: '#F0E6F4',
    age: 22, bio: 'Gov senior, debate team. Loud opinions, louder dinners.',
    foodPrefs: ['mexican', 'american', 'bbq', 'late-night'],
    vibeTags: ['loud', 'foodies only', 'adventurous'], budget: '$$', groupSizePref: [4, 8],
    instagram: '@zaraf', reliability: 89, dinnerCount: 16, flakeCount: 2,
    connections: ['u_avi', 'u_kai'],
    vibeFeedback: [{ tag: 'great convo', count: 13 }, { tag: 'big personality', count: 10 }, { tag: 'fun', count: 14 }],
    isVerified: true, isOnboarded: true, createdAt: '2025-10-22T00:00:00Z',
  },
  {
    id: 'u_devon', name: 'Devon P.', photo: '', emoji: '🎵', tone: '#E6F0E2',
    age: 20, bio: 'Music tech soph. Vinyl + late-night dumplings.',
    foodPrefs: ['chinese', 'japanese', 'korean', 'late-night'],
    vibeTags: ['chill', 'post-class', 'quiet'], budget: '$$', groupSizePref: [2, 4],
    instagram: '@devon.tracks', reliability: 96, dinnerCount: 13, flakeCount: 0,
    connections: ['u_reni', 'u_theo'],
    vibeFeedback: [{ tag: 'great taste', count: 9 }, { tag: 'low key', count: 11 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-30T00:00:00Z',
  },
  {
    id: 'u_ines', name: 'Inès G.', photo: '', emoji: '🍜', tone: '#F4E6DA',
    age: 21, bio: 'French exchange student. Convinced ramen is better than soupe à l\'oignon.',
    foodPrefs: ['ramen', 'japanese', 'sushi', 'coffee'],
    vibeTags: ['first-dates ok', 'chill', 'foodies only'], budget: '$$', groupSizePref: [2, 3],
    instagram: '@ines.atithaca', reliability: 94, dinnerCount: 8, flakeCount: 0,
    connections: ['u_mira'],
    vibeFeedback: [{ tag: 'curious eater', count: 7 }, { tag: 'sweet', count: 6 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'u_omar', name: 'Omar K.', photo: '', emoji: '🐉', tone: '#E6F4EC',
    age: 23, bio: 'PhD CS, halal-friendly. Knows every late-night spot in collegetown.',
    foodPrefs: ['halal', 'mediterranean', 'indian', 'late-night'],
    vibeTags: ['chill', 'foodies only', 'study-after'], budget: '$$', groupSizePref: [2, 5],
    instagram: '@omar.eats', reliability: 99, dinnerCount: 30, flakeCount: 0,
    connections: ['u_priya', 'u_kai', 'u_luna'],
    vibeFeedback: [{ tag: 'always on time', count: 28 }, { tag: 'great recommendations', count: 22 }, { tag: 'thoughtful', count: 19 }],
    isVerified: true, isOnboarded: true, createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'u_chloe', name: 'Chloé V.', photo: '', emoji: '🫐', tone: '#E6E6F4',
    age: 19, bio: 'AEM freshman. Bubble tea connoisseur. Currently rating boba shops.',
    foodPrefs: ['boba', 'thai', 'vietnamese', 'sushi'],
    vibeTags: ['chill', 'friend group', 'first-dates ok'], budget: '$', groupSizePref: [2, 4],
    instagram: '@chloe.boba', reliability: 87, dinnerCount: 6, flakeCount: 1,
    connections: ['u_jules'],
    vibeFeedback: [{ tag: 'sweet', count: 5 }, { tag: 'easy hang', count: 4 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'u_tobi', name: 'Tobi A.', photo: '', emoji: '🎨', tone: '#F0E6F4',
    age: 22, bio: 'AAP senior. Sketches at every dinner. Ask to see the napkin art.',
    foodPrefs: ['mediterranean', 'italian', 'mexican', 'coffee'],
    vibeTags: ['chill', 'quiet', 'first-dates ok'], budget: '$$', groupSizePref: [2, 3],
    instagram: '@tobi.draws', reliability: 92, dinnerCount: 12, flakeCount: 1,
    connections: ['u_tobi', 'u_mira'],
    vibeFeedback: [{ tag: 'creative', count: 10 }, { tag: 'great vibes', count: 8 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-08T00:00:00Z',
  },
  {
    id: 'u_hana', name: 'Hana T.', photo: '', emoji: '🌻', tone: '#F4ECDA',
    age: 20, bio: 'ILR jr. Vegan-curious. Down for any cuisine that does veggies right.',
    foodPrefs: ['vegan', 'vegetarian', 'thai', 'mediterranean'],
    vibeTags: ['chill', 'no phones', 'first-dates ok'], budget: '$$', groupSizePref: [2, 4],
    instagram: '@hana.veg', reliability: 95, dinnerCount: 14, flakeCount: 0,
    connections: ['u_hana', 'u_luna'],
    vibeFeedback: [{ tag: 'present', count: 12 }, { tag: 'great convo', count: 10 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-01-22T00:00:00Z',
  },
  {
    id: 'u_marco', name: 'Marco D.', photo: '', emoji: '🪐', tone: '#E2EBF1',
    age: 21, bio: 'Astro jr. Stargazing + post-class noodles.',
    foodPrefs: ['ramen', 'chinese', 'japanese', 'cheap eats'],
    vibeTags: ['post-class', 'quiet', 'chill'], budget: '$', groupSizePref: [2, 3],
    snapchat: 'marco.d', reliability: 90, dinnerCount: 9, flakeCount: 1,
    connections: ['u_devon'],
    vibeFeedback: [{ tag: 'thoughtful', count: 7 }, { tag: 'easy hang', count: 6 }],
    isVerified: true, isOnboarded: true, createdAt: '2026-02-12T00:00:00Z',
  },
  {
    id: 'u_yuki', name: 'Yuki S.', photo: '', emoji: '🦋', tone: '#FDE6E6',
    age: 22, bio: 'Stats senior. Lives for sushi nights and quiet bookstores.',
    foodPrefs: ['sushi', 'japanese', 'coffee', 'mediterranean'],
    vibeTags: ['quiet', 'first-dates ok', 'no phones'], budget: '$$$', groupSizePref: [2, 3],
    instagram: '@yuki.s', reliability: 99, dinnerCount: 21, flakeCount: 0,
    connections: ['u_luna', 'u_yuki'],
    vibeFeedback: [{ tag: 'gracious', count: 17 }, { tag: 'always on time', count: 19 }, { tag: 'great convo', count: 15 }],
    isVerified: true, isOnboarded: true, createdAt: '2025-12-15T00:00:00Z',
  },
]

export const MOCK_USERS: UserProfile[] = RAW_MOCK_USERS.map((user, index) => ({
  ...user,
  face: randomFace(index * 7 + 3),
}))

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
  {
    id: 'p6', hostId: 'u_kai',
    restaurant: RESTAURANTS[5], // Taste of Thai
    time: hoursFromNow(2), groupSize: 5, budget: '$',
    members: ['u_kai', 'u_zara', 'u_wen'], joinRequests: ['u_priya'],
    joinSetting: 'approval', vibeTags: ['adventurous', 'foodies only', 'loud'],
    note: 'spicy challenge — Thai 5/5 only 🌶️🌶️🌶️🌶️🌶️', status: 'open',
    createdAt: minsFromNow(-25),
    chatMessages: [
      botMsg('m1', 'Plan created! 3/5 confirmed for Taste of Thai Express at 7:30 pm.', 25),
      botMsg('m2', 'Priya M. wants in. 87% match — loves spice. Approve?', 8, ['✅ Accept', '❌ Decline']),
    ],
  },
  {
    id: 'p7', hostId: 'u_omar',
    restaurant: RESTAURANTS[7], // Just a Taste
    time: hoursFromNow(4), groupSize: 4, budget: '$$$',
    members: ['u_omar', 'u_luna', 'u_yuki'], joinRequests: [],
    joinSetting: 'approval', vibeTags: ['quiet', 'foodies only', 'first-dates ok'],
    note: 'celebrating Luna\'s thesis defense 🎓', status: 'open',
    createdAt: minsFromNow(-50),
    chatMessages: [
      botMsg('m1', 'Plan set! 3/4 at Just a Taste, 9:30 pm. Approval on.', 50),
    ],
  },
  {
    id: 'p8', hostId: 'u_mira',
    restaurant: RESTAURANTS[6], // The Nines
    time: hoursFromNow(3), groupSize: 6, budget: '$$',
    members: ['u_mira', 'u_tobi', 'u_ines'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['chill', 'friend group'],
    note: 'pizza + design crit recovery hang', status: 'open',
    createdAt: minsFromNow(-30),
    chatMessages: [
      botMsg('m1', 'Plan created! 3/6 confirmed for The Nines at 8:30 pm. 3 more spots!', 30),
    ],
  },
  {
    id: 'p9', hostId: 'u_devon',
    restaurant: RESTAURANTS[13], // Hai Hong
    time: hoursFromNow(1.75), groupSize: 4, budget: '$$',
    members: ['u_devon', 'u_marco', 'u_theo'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['post-class', 'chill'],
    status: 'open', createdAt: minsFromNow(-12),
    chatMessages: [
      botMsg('m1', 'Plan set! 3/4 at Hai Hong, 7:15 pm. 1 spot open.', 12),
    ],
  },
  {
    id: 'p10', hostId: 'u_chloe',
    restaurant: RESTAURANTS[3], // Saigon Kitchen
    time: hoursFromNow(2.25), groupSize: 4, budget: '$$',
    members: ['u_chloe', 'u_jules'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['chill', 'first-dates ok'],
    note: 'pho weather 🍲', status: 'open',
    createdAt: minsFromNow(-18),
    chatMessages: [
      botMsg('m1', 'Plan created! 2/4 confirmed for Saigon Kitchen at 7:45 pm. Looking for 2 more!', 18),
    ],
  },
  {
    id: 'p11', hostId: 'u_zara',
    restaurant: RESTAURANTS[11], // Viva Taqueria
    time: hoursFromNow(0.5), groupSize: 6, budget: '$',
    members: ['u_zara', 'u_avi', 'u_kai', 'u_theo'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['loud', 'friend group', 'post-class'],
    note: 'taco tuesday vibes — pull up', status: 'open',
    createdAt: minsFromNow(-8),
    chatMessages: [
      botMsg('m1', 'Plan set! 4/6 at Viva Taqueria, 6:30 pm. 2 spots left.', 8),
    ],
  },
  {
    id: 'p12', hostId: 'u_hana',
    restaurant: RESTAURANTS[4], // Luna Inspired Street Food
    time: hoursFromNow(2.75), groupSize: 3, budget: '$$',
    members: ['u_hana'], joinRequests: ['u_tobi'],
    joinSetting: 'approval', vibeTags: ['no phones', 'chill'],
    note: 'phone-free dinner — let\'s actually talk', status: 'open',
    createdAt: minsFromNow(-22),
    chatMessages: [
      botMsg('m1', 'Plan created! 1/3 confirmed for Luna Inspired Street Food at 8:15 pm. Approval on.', 22),
      botMsg('m2', 'Tobi A. wants to join. 91% match — same vibe, similar food prefs. Approve?', 4, ['✅ Accept', '❌ Decline']),
    ],
  },
  {
    id: 'p13', hostId: 'u_yuki',
    restaurant: RESTAURANTS[8], // Plum Tree
    time: hoursFromNow(5), groupSize: 2, budget: '$$$',
    members: ['u_yuki'], joinRequests: [],
    joinSetting: 'approval', vibeTags: ['quiet', 'first-dates ok', 'no phones'],
    note: 'omakase night — looking for one quiet dining buddy', status: 'open',
    createdAt: minsFromNow(-5),
    chatMessages: [
      botMsg('m1', 'Plan created! 1/2 confirmed for Plum Tree Japanese at 10:30 pm. Looking for 1 more.', 5),
    ],
  },
  {
    id: 'p14', hostId: 'u_ines',
    restaurant: RESTAURANTS[10], // Shortstop Deli
    time: hoursFromNow(3.25), groupSize: 4, budget: '$',
    members: ['u_ines', 'u_mira', 'u_chloe', 'u_jules'], joinRequests: [],
    joinSetting: 'auto', vibeTags: ['study-after', 'late-night'],
    note: 'shortstop hot truck pickup — thesis week support group', status: 'full',
    createdAt: minsFromNow(-40),
    chatMessages: [
      botMsg('m1', 'Group is full! 4/4 confirmed for Shortstop Deli at 8:45 pm.', 40),
    ],
  },
  {
    id: 'p15', hostId: 'u_omar',
    restaurant: RESTAURANTS[14], // Ithaca Ale House
    time: hoursFromNow(0.75), groupSize: 5, budget: '$$',
    members: ['u_omar', 'u_priya', 'u_wen'], joinRequests: ['u_kai', 'u_zara'],
    joinSetting: 'approval', vibeTags: ['loud', 'friend group', 'late-night'],
    note: 'wings + game on the big screen 🏈', status: 'open',
    createdAt: minsFromNow(-15),
    chatMessages: [
      botMsg('m1', 'Plan set! 3/5 at Ithaca Ale House, 6:45 pm. Approval on.', 15),
      botMsg('m2', '2 join requests waiting — Kai R. (94% match), Zara F. (89% match).', 3, ['✅ Accept both', '👀 Review individually']),
    ],
  },
]
