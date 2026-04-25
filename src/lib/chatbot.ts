import type { ChatMessage, Plan, UserProfile } from '../types'

type ChatRole = 'system' | 'user' | 'assistant'

interface ChatRequestMessage {
  role: ChatRole
  content: string
}

export interface MediatorResponse {
  reply: string
  shouldRelay: boolean
  relayAudience?: string
  relayMessage?: string
  quickReplies: string[]
  source: 'ollama' | 'openai' | 'fallback'
}

interface MediatorArgs {
  plan: Plan
  currentUser: UserProfile
  host: UserProfile | null
  members: UserProfile[]
  isDMMode: boolean
  chatHistory: ChatMessage[]
  latestUserMessage: string
}

const DEFAULT_QUICK_REPLIES = [
  'I might be late',
  'I have a concern',
  'Can you relay this to the host?',
  'I need to leave early',
]

function buildSystemPrompt({ plan, currentUser, host, members, isDMMode }: MediatorArgs) {
  const otherMembers = members
    .filter(member => member.id !== currentUser.id)
    .map(member => member.name)
    .join(', ')

  return [
    'You are Philia Bot, a warm middleman for small-group dinner plans.',
    'Users do not directly message each other through you. You collect updates, concerns, and requests, then relay them neutrally.',
    'Reply like a thoughtful concierge: calm, concise, and human.',
    'Ask at most one follow-up question at a time.',
    'If the user shares something that should be passed along, set shouldRelay=true and provide a short relayMessage written in third person or neutral phrasing.',
    'Never tell the user to contact other participants directly.',
    'Keep the main reply under 90 words.',
    'Return strict JSON with keys: reply, shouldRelay, relayAudience, relayMessage, quickReplies.',
    `Current user: ${currentUser.name}.`,
    `Host: ${host?.name ?? 'Unknown host'}.`,
    `Plan: ${plan.restaurant.name} at ${new Date(plan.time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.`,
    `Other participants: ${otherMembers || 'No other participants yet'}.`,
    `Channel mode: ${isDMMode ? 'DM relay to host only' : 'bot-mediated group coordination'}.`,
  ].join(' ')
}

function buildConversation(args: MediatorArgs): ChatRequestMessage[] {
  const history = args.chatHistory.slice(-10).map<ChatRequestMessage>(msg => {
    if (msg.senderId === 'bot') {
      return { role: 'assistant', content: msg.content }
    }

    const prefix = msg.senderId === args.currentUser.id ? 'Current user' : 'Another participant'
    return { role: 'user', content: `${prefix}: ${msg.content}` }
  })

  return [
    { role: 'system', content: buildSystemPrompt(args) },
    ...history,
    { role: 'user', content: `Current user says: ${args.latestUserMessage}` },
  ]
}

function cleanJsonPayload(raw: string) {
  const trimmed = raw.trim()

  if (trimmed.startsWith('```')) {
    const lines = trimmed.split('\n')
    const content = lines.slice(1, lines[lines.length - 1]?.startsWith('```') ? -1 : undefined).join('\n')
    return content.trim()
  }

  return trimmed
}

function normalizeQuickReplies(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_QUICK_REPLIES
  return value
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function parseMediatorResponse(raw: string, source: MediatorResponse['source']): MediatorResponse {
  const parsed = JSON.parse(cleanJsonPayload(raw)) as Partial<MediatorResponse>

  return {
    reply: typeof parsed.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : 'I can help with that and relay it without putting you in direct contact. What would you like me to pass along?',
    shouldRelay: Boolean(parsed.shouldRelay && parsed.relayMessage),
    relayAudience: typeof parsed.relayAudience === 'string' ? parsed.relayAudience.trim() : undefined,
    relayMessage: typeof parsed.relayMessage === 'string' ? parsed.relayMessage.trim() : undefined,
    quickReplies: normalizeQuickReplies(parsed.quickReplies),
    source,
  }
}

async function requestOllama(messages: ChatRequestMessage[]): Promise<MediatorResponse> {
  const model = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b'
  const baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed with ${response.status}`)
  }

  const data = await response.json() as { message?: { content?: string } }
  const content = data.message?.content

  if (!content) {
    throw new Error('Ollama returned an empty response')
  }

  return parseMediatorResponse(content, 'ollama')
}

async function requestOpenAI(messages: ChatRequestMessage[]): Promise<MediatorResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OpenAI API key')
  }

  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI-compatible request failed with ${response.status}`)
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI-compatible API returned an empty response')
  }

  return parseMediatorResponse(content, 'openai')
}

function buildFallbackResponse({ currentUser, host, isDMMode, latestUserMessage }: MediatorArgs): MediatorResponse {
  const text = latestUserMessage.trim()
  const lowered = text.toLowerCase()
  const audience = isDMMode ? `${host?.name ?? 'the host'} only` : 'the group'

  if (/(late|running behind|behind|eta|minutes|mins)/.test(lowered)) {
    return {
      reply: `I can relay that for you. If you want, send your ETA too and I'll phrase it clearly for ${audience}.`,
      shouldRelay: true,
      relayAudience: audience,
      relayMessage: `${currentUser.name} may be running late and will share an ETA shortly.`,
      quickReplies: ['ETA is 10 minutes', 'ETA is 15 minutes', 'Actually I am on time'],
      source: 'fallback',
    }
  }

  if (/(can.t make|cannot make|need to cancel|cancel|not coming)/.test(lowered)) {
    return {
      reply: `I’ve drafted a cancellation note and can keep it neutral. If you want, send one more detail like timing or whether the spot should reopen.`,
      shouldRelay: true,
      relayAudience: audience,
      relayMessage: `${currentUser.name} can no longer make it tonight.`,
      quickReplies: ['Reopen my spot', 'I can still come later', 'Do not share more details'],
      source: 'fallback',
    }
  }

  if (/(concern|unsafe|uncomfortable|awkward|issue|problem)/.test(lowered)) {
    return {
      reply: `I can pass this along without putting you in a direct back-and-forth. If you want, add one sentence on what outcome you need and I’ll relay that cleanly.`,
      shouldRelay: true,
      relayAudience: `${host?.name ?? 'the host'} only`,
      relayMessage: `${currentUser.name} has a concern and would like host support.`,
      quickReplies: ['I need host support', 'I want to leave early', 'Please keep this discreet'],
      source: 'fallback',
    }
  }

  if (/(diet|allergy|allergic|vegetarian|vegan|halal|kosher|gluten)/.test(lowered)) {
    return {
      reply: `I can relay a food preference or dietary constraint for you. Send the exact restriction if you want me to word it more precisely.`,
      shouldRelay: true,
      relayAudience: `${host?.name ?? 'the host'} only`,
      relayMessage: `${currentUser.name} shared a dietary note for tonight's plan.`,
      quickReplies: ['I have an allergy', 'I am vegetarian', 'I need menu flexibility'],
      source: 'fallback',
    }
  }

  return {
    reply: `I can help with that and relay it without making you message people directly. Tell me what you want passed along, and whether it should go to the host only or the full group.`,
    shouldRelay: false,
    quickReplies: DEFAULT_QUICK_REPLIES,
    source: 'fallback',
  }
}

export async function generateMediatorResponse(args: MediatorArgs): Promise<MediatorResponse> {
  const messages = buildConversation(args)

  try {
    if (import.meta.env.VITE_OLLAMA_MODEL || import.meta.env.VITE_OLLAMA_URL) {
      return await requestOllama(messages)
    }

    if (import.meta.env.VITE_OPENAI_API_KEY) {
      return await requestOpenAI(messages)
    }
  } catch (error) {
    console.warn('Mediator AI request failed, falling back to local logic.', error)
  }

  return buildFallbackResponse(args)
}
