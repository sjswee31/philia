import type { Plan, UserProfile } from '../types'

export interface MediatorResponse {
  shouldRelay: boolean
  relayAudience?: string
  relayMessage?: string
  quickReplies: string[]
  source: 'local'
}

interface MediatorArgs {
  plan: Plan
  currentUser: UserProfile
  host: UserProfile | null
  members: UserProfile[]
  isDMMode: boolean
  latestUserMessage: string
}

const DEFAULT_QUICK_REPLIES = [
  'I might be late',
  'I have a concern',
  'Can you relay this to the host?',
  'I need to leave early',
]

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function sentenceCase(text: string) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function withPeriod(text: string) {
  if (!text) return text
  return /[.!?]$/.test(text) ? text : `${text}.`
}

function paraphraseMessage(message: string, currentUser: UserProfile, host: UserProfile | null, isDMMode: boolean) {
  const text = normalizeText(message)
  const lowered = text.toLowerCase()
  const audience = isDMMode ? `${host?.name ?? 'the host'} only` : 'the group'

  if (/(shy|awkward|nervous|anxious|introvert)/.test(lowered)) {
    return {
      relayAudience: audience,
      relayMessage: 'First time meeting - would appreciate a welcoming vibe.',
      quickReplies: ['Please keep it low-pressure', 'I may be quiet at first', 'Thanks for understanding'],
    }
  }

  if (/(spend|budget|\$25|25 bucks|25 dollars|more than like 25|over 25)/.test(lowered)) {
    return {
      relayAudience: audience,
      relayMessage: 'Prefers to keep the budget around $25.',
      quickReplies: ['Closer to $20 if possible', 'Flexible if needed', 'Host only please'],
    }
  }

  if (/(actually doing this|gonna flake|going to flake|still happening|still on|everyone gonna flake|everyone still confirmed)/.test(lowered)) {
    return {
      relayAudience: audience,
      relayMessage: 'Checking if everyone is still confirmed.',
      quickReplies: ['Please confirm attendance', 'Any updates from the group?', 'Host only please'],
    }
  }

  if (/(late|running behind|behind|eta|minutes|mins)/.test(lowered)) {
    const etaMatch = text.match(/(\d+)\s*(min|mins|minute|minutes)/i)
    const relayMessage = etaMatch
      ? `${currentUser.name} may be about ${etaMatch[1]} minutes late.`
      : `${currentUser.name} may be running late.`

    return {
      relayAudience: audience,
      relayMessage,
      quickReplies: ['ETA is 10 minutes', 'ETA is 15 minutes', 'Actually I am on time'],
    }
  }

  if (/(can.t make|cannot make|need to cancel|cancel|not coming)/.test(lowered)) {
    return {
      relayAudience: audience,
      relayMessage: `${currentUser.name} can no longer make it tonight.`,
      quickReplies: ['Reopen my spot', 'I can still come later', 'Host only please'],
    }
  }

  if (/(concern|unsafe|uncomfortable|problem|issue)/.test(lowered)) {
    return {
      relayAudience: `${host?.name ?? 'the host'} only`,
      relayMessage: `${currentUser.name} has a concern and would appreciate host support.`,
      quickReplies: ['Please keep this discreet', 'I want to leave early', 'Need a quick check-in'],
    }
  }

  if (/(diet|allergy|allergic|vegetarian|vegan|halal|kosher|gluten)/.test(lowered)) {
    return {
      relayAudience: `${host?.name ?? 'the host'} only`,
      relayMessage: `${currentUser.name} shared a dietary note for tonight.`,
      quickReplies: ['I have an allergy', 'I am vegetarian', 'I need menu flexibility'],
    }
  }

  return {
    relayAudience: audience,
    relayMessage: withPeriod(sentenceCase(text)),
    quickReplies: DEFAULT_QUICK_REPLIES,
  }
}

export async function generateMediatorResponse(args: MediatorArgs): Promise<MediatorResponse> {
  void args.plan
  void args.members

  const result = paraphraseMessage(args.latestUserMessage, args.currentUser, args.host, args.isDMMode)

  return {
    shouldRelay: true,
    relayAudience: result.relayAudience,
    relayMessage: result.relayMessage,
    quickReplies: result.quickReplies,
    source: 'local',
  }
}
