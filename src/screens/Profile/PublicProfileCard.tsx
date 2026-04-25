import { useParams, useNavigate } from 'react-router-dom'
import { useApp, useCurrentUser } from '../../contexts/AppContext'
import { MOCK_USERS } from '../../lib/mockData'
import Header from '../../components/layout/Header'
import { Avatar, ReliabilityRing, Pill, Chip, SectionLabel, SafeStamp, Divider } from '../../components/ui'

export default function PublicProfileCard() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { state } = useApp()
  const currentUser = useCurrentUser()

  const profile = MOCK_USERS.find(u => u.id === userId) ?? state.users.find(u => u.id === userId)
  if (!profile) return <div className="h-full bg-paper flex items-center justify-center text-ink-2">User not found</div>

  const isOwnProfile = currentUser?.id === profile.id
  if (isOwnProfile) { navigate('/profile'); return null }

  const mutualCount = currentUser ? profile.connections.filter(id => currentUser.connections.includes(id)).length : 0

  return (
    <div className="h-full bg-paper relative">
      <Header title="profile" />

      <div className="screen-scroll" style={{ paddingTop: 88 }}>
        <div className="px-5 pb-6 space-y-4">

          {/* Card */}
          <div className="wk-box overflow-hidden" style={{ boxShadow: '4px 4px 0 var(--line)', transform: 'rotate(-0.5deg)' }}>
            {/* Banner */}
            <div className="h-16 relative" style={{ background: 'var(--accent)', borderBottom: '1.4px solid var(--line)' }}>
              <div className="absolute top-3 right-3">
                {profile.isVerified && <SafeStamp />}
              </div>
            </div>

            <div className="px-4 pb-5">
              {/* Avatar overlapping banner */}
              <div className="flex items-end justify-between" style={{ marginTop: -28 }}>
                <Avatar emoji={profile.emoji} tone={profile.tone} face={profile.face} size="lg" />
                <div className="font-display text-lg text-ink-2 pb-1">{profile.reliability}% reliable</div>
              </div>

              <div className="font-display text-3xl mt-2">{profile.name}</div>
              {profile.age && <div className="text-ink-2 text-sm mt-0.5">{profile.age}{profile.isVerified ? ' · verified' : ''}</div>}

              {profile.bio && (
                <div className="text-sm text-ink mt-3 leading-relaxed">{profile.bio}</div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {profile.isVerified && <Pill className="text-xs"><ShieldIcon /> verified</Pill>}
                <Pill className="text-xs">🍽 {profile.dinnerCount} dinners</Pill>
                {mutualCount > 0 && <Pill className="text-xs">{mutualCount} mutual{mutualCount > 1 ? 's' : ''}</Pill>}
                {profile.flakeCount > 0 && <Pill className="text-xs">⚠️ {profile.flakeCount} flake{profile.flakeCount > 1 ? 's' : ''}</Pill>}
              </div>

              <Divider className="my-4" />

              <SectionLabel>WHAT THEY LIKE</SectionLabel>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.foodPrefs.slice(0, 5).map(t => <Chip key={t}>{t}</Chip>)}
                {profile.vibeTags.slice(0, 3).map(t => <Chip key={t}>{t}</Chip>)}
                <Chip>{profile.budget}</Chip>
              </div>

              {profile.vibeFeedback.length > 0 && (
                <>
                  <SectionLabel className="mt-4">SAID BY PAST CREW</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profile.vibeFeedback.slice(0, 4).map(({ tag, count }) => (
                      <Pill key={tag} className="text-xs">
                        {tag} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>×{count}</span>
                      </Pill>
                    ))}
                  </div>
                </>
              )}

              {(profile.instagram || profile.snapchat || profile.tiktok) && (
                <>
                  <Divider className="my-4" />
                  <SectionLabel>SOCIALS</SectionLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.instagram && <Pill className="text-xs">ig: {profile.instagram}</Pill>}
                    {profile.snapchat && <Pill className="text-xs">snap: {profile.snapchat}</Pill>}
                    {profile.tiktok && <Pill className="text-xs">tt: {profile.tiktok}</Pill>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reliability ring detail */}
          <div className="wk-box-accent p-4 flex items-center gap-4">
            <ReliabilityRing score={profile.reliability} />
            <div>
              <SectionLabel>RELIABILITY</SectionLabel>
              <div className="font-display text-3xl mt-1" style={{ color: 'var(--accent)' }}>{profile.reliability}%</div>
              <div className="text-ink-2 text-xs">{profile.dinnerCount} attended · {profile.flakeCount} flakes</div>
            </div>
          </div>

          <div className="text-ink-3 text-xs text-center">
            this is what a host sees when you ask to join their table
          </div>
        </div>
      </div>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><polyline points="9,12 11,14 15,10"/>
    </svg>
  )
}
