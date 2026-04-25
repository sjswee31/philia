import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../../contexts/AppContext'
import { Avatar } from '../../components/ui'
import { MOCK_USERS } from '../../lib/mockData'
import { formatTime, generateId } from '../../lib/utils'
import { generateMediatorResponse } from '../../lib/chatbot'
import type { ChatMessage } from '../../types'

const STARTER_PROMPTS = [
  'I might be late',
  'I have a concern',
  'Can you relay this to the host?',
  'I need to leave early',
]

const BOT_THINKING_DELAY_MS = 700

export default function ChatScreen() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  const plan = state.plans.find(p => p.id === planId)
  const msgCount = plan?.chatMessages?.length ?? 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgCount])

  if (!plan || !user) return null

  // Non-nullable aliases safe for closures
  const p = plan
  const u = user
  const isHost = u.id === p.hostId
  const isMember = p.members.includes(u.id)
  const isDMMode = p.status === 'closed-dms' && !isMember

  const host = MOCK_USERS.find(u => u.id === p.hostId) ?? state.users.find(u => u.id === p.hostId)
  const memberProfiles = p.members
    .map(id => MOCK_USERS.find(u => u.id === id) ?? state.users.find(u => u.id === id))
    .filter((member): member is NonNullable<typeof member> => Boolean(member))

  async function handleLocalCommand(text: string) {
    const normalized = text.trim().toLowerCase()

    if ((normalized === 'wrap up' || normalized === 'wrap up dinner') && isHost) {
      dispatch({ type: 'UPDATE_PLAN', planId: p.id, updates: { status: 'past' } })
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        planId: p.id,
        message: {
          id: `bot_${generateId()}`,
          senderId: 'bot',
          content: 'Dinner marked as wrapped up. I can still collect feedback or pass along follow-up notes.',
          type: 'bot',
          timestamp: new Date().toISOString(),
        },
      })

      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification('How was dinner? 🍽️', {
            body: `Leave vibe tags for your ${p.restaurant.name} crew!`,
            icon: '/pwa-192x192.png',
          })
        }, 60 * 60 * 1000)
      }

      return true
    }

    if (normalized === 'swap contacts') {
      const botMsg: ChatMessage = {
        id: `bot_${generateId()}`,
        senderId: 'bot',
        content: `Contact swap requested by ${u.name}. Others will only see your handles if they also tap "swap contacts" — mutual opt-in only.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', planId: p.id, message: botMsg })
      return true
    }

    if (normalized === '✅ accept' && isHost && p.joinRequests.length > 0) {
      const requesterId = p.joinRequests[0]
      const requester = state.users.find(person => person.id === requesterId) ?? MOCK_USERS.find(person => person.id === requesterId)

      dispatch({ type: 'APPROVE_JOIN', planId: p.id, userId: requesterId })
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        planId: p.id,
        message: {
          id: `bot_${generateId()}`,
          senderId: 'bot',
          content: `${requester?.name ?? 'The requester'} was approved. I’ve let the group know.`,
          type: 'bot',
          timestamp: new Date().toISOString(),
        },
      })
      return true
    }

    if (normalized === '❌ decline' && isHost && p.joinRequests.length > 0) {
      const requesterId = p.joinRequests[0]
      const requester = state.users.find(person => person.id === requesterId) ?? MOCK_USERS.find(person => person.id === requesterId)

      dispatch({ type: 'DECLINE_JOIN', planId: p.id, userId: requesterId })
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        planId: p.id,
        message: {
          id: `bot_${generateId()}`,
          senderId: 'bot',
          content: `${requester?.name ?? 'The requester'} was declined. I kept the message neutral.`,
          type: 'bot',
          timestamp: new Date().toISOString(),
        },
      })
      return true
    }

    return false
  }

  async function sendMessage(prefill?: string) {
    const text = (prefill ?? draft).trim()
    if (!text || isSending) return

    const msg: ChatMessage = {
      id: `dm_${generateId()}`,
      senderId: u.id,
      content: text,
      type: 'direct',
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_CHAT_MESSAGE', planId: p.id, message: msg })
    setDraft('')

    if (await handleLocalCommand(text)) {
      return
    }

    setIsSending(true)

    try {
      const [ai] = await Promise.all([
        generateMediatorResponse({
          plan: p,
          currentUser: u,
          host: host ?? null,
          members: memberProfiles,
          isDMMode,
          latestUserMessage: text,
        }),
        new Promise(resolve => window.setTimeout(resolve, BOT_THINKING_DELAY_MS)),
      ])

      const relayAudience = ai.relayAudience || (isDMMode ? 'host' : 'group')
      const relayMessage = ai.relayMessage || `${u.name} said: ${text}`

      if (ai.shouldRelay && relayMessage) {
        dispatch({
          type: 'ADD_CHAT_MESSAGE',
          planId: p.id,
          message: {
            id: `bot_${generateId()}`,
            senderId: 'bot',
            content: `Sent to ${relayAudience}:\n"${relayMessage}"`,
            type: 'bot',
            timestamp: new Date().toISOString(),
          },
        })
      }
    } catch {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        planId: p.id,
        message: {
          id: `bot_${generateId()}`,
          senderId: 'bot',
          content: 'I could not clean that up just now, so nothing was sent.',
          type: 'bot',
          timestamp: new Date().toISOString(),
        },
      })
    } finally {
      setIsSending(false)
    }
  }

  const suggestionChips = STARTER_PROMPTS

  return (
    <div className="h-full min-h-0 bg-paper flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 bg-white" style={{ paddingTop: 52, paddingBottom: 12, borderBottom: '1.4px solid var(--line)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="11,6 5,12 11,18"/>
            </svg>
          </button>
          <div className="flex-1">
            <div className="font-semibold text-sm">{p.restaurant.name} · {formatTime(p.time)}</div>
            <div className="text-ink-2 text-xs">
              {isDMMode
                ? `Host relay for ${host?.name} · bot mediated`
                : `${memberProfiles.map(u => u?.name?.split(' ')[0]).join(', ')} · bot mediated`}
            </div>
          </div>
          <span className="wk-pill text-xs">🛡 safe</span>
        </div>
        {!isDMMode && (
          <div className="flex gap-1.5 mt-2.5">
            {memberProfiles.map(u => u && <Avatar key={u.id} emoji={u.emoji} tone={u.tone} face={u.face} size="sm" />)}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-8 space-y-3">
        {p.chatMessages.map(msg => (
          <ChatBubble key={msg.id} msg={msg} currentUserId={u.id} onQuickReply={sendMessage} />
        ))}
        {isSending && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1.2px solid var(--line)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="4" y="7" width="16" height="13" rx="3"/>
                  <line x1="12" y1="3" x2="12" y2="7"/>
                  <circle cx="9" cy="13" r="1.2" fill="var(--ink)"/>
                  <circle cx="15" cy="13" r="1.2" fill="var(--ink)"/>
                </svg>
              </div>
              <span className="text-ink-2 text-xs">philia bot</span>
            </div>
            <div className="px-3 py-2 rounded-2xl text-sm max-w-[80%]" style={{ background: 'var(--accent-soft)', border: '1.4px solid var(--line)' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ink-2 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-ink-2 animate-pulse [animation-delay:120ms]" />
                <span className="w-2 h-2 rounded-full bg-ink-2 animate-pulse [animation-delay:240ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-24 shrink-0" />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 bg-white px-4 pt-3"
        style={{ borderTop: '1.4px solid var(--line)', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-ink-2 text-xs font-mono-sm">MESSAGE PHILIA BOT</div>
            <div className="text-ink-3 text-[10px]">
              {isDMMode ? 'bot relays to host' : 'bot relays to group when needed'}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestionChips.map(reply => (
              <button
                key={reply}
                onClick={() => setDraft(reply)}
                className="wk-pill text-xs flex-shrink-0 active:scale-95 transition-transform"
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendMessage()
                }
              }}
              rows={3}
              placeholder={isDMMode ? 'Tell the bot what you want relayed to the host…' : 'Tell the bot what you need, and it will relay for you…'}
              className="flex-1 wk-box bg-white px-4 py-3 text-sm outline-none placeholder-ink-3 resize-none"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={!draft.trim() || isSending}
              className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: 'var(--accent)', border: '1.6px solid var(--line)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="3,3 21,12 3,21 6,12"/>
              </svg>
            </button>
          </div>

          <div className="text-ink-2 text-xs mt-2">
            Type what you want passed along and the bot will relay a cleaner version to the group.
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatBubble({ msg, currentUserId, onQuickReply }: {
  msg: ChatMessage
  currentUserId: string
  onQuickReply: (r: string) => void
}) {
  const isBot = msg.senderId === 'bot'
  const isMe = msg.senderId === currentUserId
  const sender = !isBot && !isMe ? MOCK_USERS.find(u => u.id === msg.senderId) : null

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      {sender && (
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar emoji={sender.emoji} tone={sender.tone} face={sender.face} size="sm" />
          <span className="text-ink-2 text-xs">{sender.name}</span>
        </div>
      )}
      {isBot && (
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1.2px solid var(--line)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round">
              <rect x="4" y="7" width="16" height="13" rx="3"/>
              <line x1="12" y1="3" x2="12" y2="7"/>
              <circle cx="9" cy="13" r="1.2" fill="var(--ink)"/>
              <circle cx="15" cy="13" r="1.2" fill="var(--ink)"/>
            </svg>
          </div>
          <span className="text-ink-2 text-xs">philia bot</span>
        </div>
      )}
      <div
        className="px-3 py-2 rounded-2xl text-sm leading-relaxed max-w-[80%]"
        style={{
          background: isMe ? 'var(--accent)' : isBot ? 'var(--accent-soft)' : '#fff',
          color: isMe ? '#fff' : 'var(--ink)',
          border: isMe ? 'none' : '1.4px solid var(--line)',
        }}
      >
        {msg.content}
      </div>
      {msg.quickReplies && msg.quickReplies.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {msg.quickReplies.map(r => (
            <button key={r} onClick={() => onQuickReply(r)} className="wk-pill text-xs bg-white active:scale-95 transition-transform">{r}</button>
          ))}
        </div>
      )}
      <div className="text-ink-3 text-[10px] mt-0.5 px-1">
        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </div>
    </div>
  )
}
