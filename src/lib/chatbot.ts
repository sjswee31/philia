import type { Plan, UserProfile } from '../types'

export interface MediatorResponse {
  shouldRelay: boolean
  relayAudience?: string
  relayMessage?: string
  quickReplies: string[]
<<<<<<< Updated upstream
  source: 'ollama' | 'openai' | 'claude' | 'fallback'
=======
  source: 'local'
>>>>>>> Stashed changes
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
      relayMessage: 'First time meeting — would appreciate a welcoming vibe.',
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

async function requestClaude(messages: ChatRequestMessage[]): Promise<MediatorResponse> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const system = messages.find(m => m.role === 'system')?.content ?? ''
  const conversation = messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system,
      messages: conversation,
    }),
  })

  if (!response.ok) throw new Error(`Anthropic request failed with ${response.status}`)

  const data = await response.json() as { content?: Array<{ text?: string }> }
  const content = data.content?.[0]?.text
  if (!content) throw new Error('Anthropic returned an empty response')

  return parseMediatorResponse(content, 'claude')
}

export async function generateMediatorResponse(args: MediatorArgs): Promise<MediatorResponse> {
  void args.plan
  void args.members

  const result = paraphraseMessage(args.latestUserMessage, args.currentUser, args.host, args.isDMMode)

<<<<<<< Updated upstream
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
      return await requestClaude(messages)
    }

    if (import.meta.env.VITE_OPENAI_API_KEY) {
      return await requestOpenAI(messages)
    }
  } catch (error) {
    console.warn('Mediator AI request failed, falling back to local logic.', error)
=======
  return {
    shouldRelay: true,
    relayAudience: result.relayAudience,
    relayMessage: result.relayMessage,
    quickReplies: result.quickReplies,
    source: 'local',
>>>>>>> Stashed changes
  }
}
