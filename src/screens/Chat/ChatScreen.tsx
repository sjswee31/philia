import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../../contexts/AppContext'
import { Avatar } from '../../components/ui'
import { MOCK_USERS } from '../../lib/mockData'
import { formatTime, generateId } from '../../lib/utils'
import type { ChatMessage, Plan } from '../../types'

const QUICK_REPLIES = ['🟢 still in', '🟡 running 5 min', "🔴 can't make it", 'swap contacts', 'running late', 'wrap up']

export default function ChatScreen() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const user = useCurrentUser()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [directMsg, setDirectMsg] = useState('')

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
  const memberProfiles = p.members.map(id =>
    MOCK_USERS.find(u => u.id === id) ?? state.users.find(u => u.id === id)
  ).filter(Boolean)

  function sendQuickReply(reply: string) {
    if (reply === 'wrap up' && isHost) {
      dispatch({ type: 'UPDATE_PLAN', planId: p.id, updates: { status: 'past' } })
      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification('How was dinner? 🍽️', {
            body: `Leave vibe tags for your ${p.restaurant.name} crew!`,
            icon: '/pwa-192x192.png',
          })
        }, 60 * 60 * 1000)
      }
    }

    if (reply === 'swap contacts') {
      const botMsg: ChatMessage = {
        id: `bot_${generateId()}`,
        senderId: 'bot',
        content: `Contact swap requested by ${u.name}. Others will only see your handles if they also tap "swap contacts" — mutual opt-in only.`,
        type: 'bot',
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_CHAT_MESSAGE', planId: p.id, message: botMsg })
      return
    }

    const userMsg: ChatMessage = {
      id: `user_${generateId()}`,
      senderId: u.id,
      content: reply,
      type: 'direct',
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_CHAT_MESSAGE', planId: p.id, message: userMsg })

    setTimeout(() => {
      let botResponse = ''
      if (reply === '🟢 still in') botResponse = `${u.name} is confirmed. ✓`
      else if (reply === '🟡 running 5 min') botResponse = `${u.name} is running ~5 minutes late.`
      else if (reply === "🔴 can't make it") {
        botResponse = `${u.name} can't make it. Logged. ${p.members.length - 1}/${p.groupSize} remain.`
      } else if (reply === 'running late') botResponse = `${u.name} says they're running late.`
      else if (reply === 'wrap up') botResponse = `${u.name} called wrap. Rating prompts go out in 1 hour!`
      else return

      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        planId: p.id,
        message: { id: `bot_${generateId()}`, senderId: 'bot', content: botResponse, type: 'bot', timestamp: new Date().toISOString() },
      })
    }, 600)
  }

  function sendDirectMsg() {
    if (!directMsg.trim()) return
    const msg: ChatMessage = {
      id: `dm_${generateId()}`,
      senderId: u.id,
      content: directMsg.trim(),
      type: 'direct',
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_CHAT_MESSAGE', planId: p.id, message: msg })
    setDirectMsg('')

    if (isDMMode) {
      setTimeout(() => {
        dispatch({
          type: 'ADD_CHAT_MESSAGE',
          planId: p.id,
          message: {
            id: `bot_${generateId()}`, senderId: 'bot',
            content: 'Your message was forwarded to the host.',
            type: 'bot', timestamp: new Date().toISOString(),
          },
        })
      }, 800)
    }
  }

  return (
    <div className="h-full bg-paper flex flex-col">
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
                ? `Direct to ${host?.name} · bot relayed`
                : `${memberProfiles.map(u => u?.name?.split(' ')[0]).join(', ')} · bot mediated`}
            </div>
          </div>
          <span className="wk-pill text-xs">🛡 safe</span>
        </div>
        {!isDMMode && (
          <div className="flex gap-1.5 mt-2.5">
            {memberProfiles.map(u => u && <Avatar key={u.id} emoji={u.emoji} tone={u.tone} size="sm" />)}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {p.chatMessages.map(msg => (
          <ChatBubble key={msg.id} msg={msg} currentUserId={u.id} onQuickReply={sendQuickReply} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-white px-4 pb-6 pt-3" style={{ borderTop: '1.4px solid var(--line)' }}>
        {isDMMode ? (
          <div>
            <div className="text-ink-2 text-xs mb-2 font-mono-sm">DIRECT MESSAGE TO HOST</div>
            <div className="flex gap-2">
              <input value={directMsg} onChange={e => setDirectMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendDirectMsg()}
                placeholder="Message the host…"
                className="flex-1 wk-box bg-white px-4 py-2.5 text-sm outline-none placeholder-ink-3"
              />
              <button onClick={sendDirectMsg} disabled={!directMsg.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40"
                style={{ background: 'var(--accent)', border: '1.6px solid var(--line)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polygon points="3,3 21,12 3,21 6,12"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-ink-2 text-xs mb-2 font-mono-sm">QUICK REPLIES</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_REPLIES.filter(r => r !== 'wrap up' || isHost).map(reply => (
                <button key={reply} onClick={() => sendQuickReply(reply)}
                  className="wk-pill text-xs flex-shrink-0 active:scale-95 transition-transform">
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
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
          <Avatar emoji={sender.emoji} tone={sender.tone} size="sm" />
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
