import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'

const tabs = [
  { path: '/home', label: 'Home',    icon: HomeIcon },
  { path: '/join', label: 'Join',    icon: SearchIcon },
  { path: '/profile', label: 'Me',  icon: UserIcon },
]

export default function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { state } = useApp()

  // Count pending join requests across plans the user hosts
  const pendingCount = state.plans
    .filter(p => p.hostId === state.currentUser?.id && p.joinRequests.length > 0)
    .reduce((sum, p) => sum + p.joinRequests.length, 0)

  return (
    <div className="tab-bar absolute bottom-0 left-0 right-0 bg-white flex items-end justify-around" style={{ borderTop: '1.4px solid var(--line)', height: 70 }}>
      {tabs.map(({ path, label, icon: Icon }) => {
        const active = pathname === path || (path === '/home' && pathname === '/')
        const showBadge = path === '/home' && pendingCount > 0
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 pb-2 pt-1 px-4 relative"
          >
            <div className="relative">
              <Icon active={active} />
              {showBadge && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center" style={{ border: '1.5px solid #fff' }}>
                  {pendingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: active ? 'var(--accent)' : 'var(--ink-2)' }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--accent)' : 'var(--ink-2)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/>
    </svg>
  )
}
function SearchIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--accent)' : 'var(--ink-2)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function UserIcon({ active }: { active: boolean }) {
  const c = active ? 'var(--accent)' : 'var(--ink-2)'
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/>
    </svg>
  )
}
