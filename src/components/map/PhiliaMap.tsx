import { GoogleMap, useLoadScript, OverlayView } from '@react-google-maps/api'
import { MAP_CENTER, MAP_ZOOM, MAP_STYLE } from '../../lib/constants'
import { MOCK_USERS } from '../../lib/mockData'
import { Avatar } from '../ui'
import { spotsLeft } from '../../lib/utils'
import type { Plan } from '../../types'

const mapContainerStyle = { width: '100%', height: '100%' }

interface PhiliaMapProps {
  plans: Plan[]
  onPinClick?: (plan: Plan) => void
  currentUserLocation?: { lat: number; lng: number }
  height?: string
}

export default function PhiliaMap({ plans, onPinClick, currentUserLocation, height }: PhiliaMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    libraries: ['places'],
  })

  if (!apiKey) return <MapFallback plans={plans} onPinClick={onPinClick} />
  if (loadError) return <MapFallback plans={plans} onPinClick={onPinClick} error />
  if (!isLoaded) return <div className="wk-map-placeholder w-full h-full flex items-center justify-center"><div className="text-ink-3 text-sm">Loading map…</div></div>

  return (
    <GoogleMap
      mapContainerStyle={{ ...mapContainerStyle, height: height ?? '100%' }}
      center={currentUserLocation ?? MAP_CENTER}
      zoom={MAP_ZOOM}
      options={{
        disableDefaultUI: true,
        zoomControl: false,
        clickableIcons: false,
        styles: MAP_STYLE,
      }}
    >
      {/* Plan pins */}
      {plans.map(plan => (
        <OverlayView
          key={plan.id}
          position={{ lat: plan.restaurant.lat, lng: plan.restaurant.lng }}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
          <PlanPin plan={plan} onClick={() => onPinClick?.(plan)} />
        </OverlayView>
      ))}

      {/* You-are-here dot */}
      {currentUserLocation && (
        <OverlayView position={currentUserLocation} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
          <YouAreHere />
        </OverlayView>
      )}
    </GoogleMap>
  )
}

function PlanPin({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const host = MOCK_USERS.find(u => u.id === plan.hostId)
  const spots = spotsLeft(plan)
  const isFull = spots === 0

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
      style={{ transform: 'translate(-50%, -100%)' }}
    >
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-bold"
        style={{
          background: isFull ? '#fff' : 'var(--accent-soft)',
          border: '1.6px solid var(--line)',
          boxShadow: '2px 2px 0 var(--line)',
          opacity: isFull ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <div className="flex -space-x-1.5">
          {plan.members.slice(0, 3).map(uid => {
            const u = MOCK_USERS.find(x => x.id === uid)
            return u ? <Avatar key={uid} emoji={u.emoji} tone={u.tone} size="sm" /> : null
          })}
        </div>
        <span className="text-ink text-[10px]">{plan.restaurant.name.split(' ')[0]}</span>
        {!isFull && (
          <span
            className="text-[10px] font-bold px-1 rounded-md"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            +{spots}
          </span>
        )}
      </div>
      {/* tail */}
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--line)' }} />
    </div>
  )
}

function YouAreHere() {
  return (
    <div style={{ transform: 'translate(-50%, -50%)', position: 'relative' }}>
      <div className="ping absolute inset-0 rounded-full" style={{ background: '#3B82F6', opacity: 0.3, transform: 'scale(2)' }} />
      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 relative" style={{ border: '2.5px solid #fff', boxShadow: '0 0 0 1.5px var(--line)' }} />
    </div>
  )
}

// ── Fallback when no API key is set ──────────────────────────
function MapFallback({ plans, onPinClick, error }: { plans: Plan[]; onPinClick?: (plan: Plan) => void; error?: boolean }) {
  return (
    <div className="wk-map-placeholder w-full h-full relative overflow-hidden">
      {/* Street sketch */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 300" preserveAspectRatio="none">
        <path d="M0 100 Q 100 80 200 120 T 390 100" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M0 220 Q 130 240 260 200 T 390 230" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M130 0 Q 150 120 110 220 T 140 300" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M270 0 Q 290 100 260 200 T 280 300" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <text x="30" y="60" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Arts Quad</text>
        <text x="210" y="175" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Collegetown</text>
        <text x="25" y="250" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Commons</text>
      </svg>

      {/* Fake pins */}
      {plans.map((plan, i) => {
        const positions = [
          { left: '22%', top: '28%' }, { left: '60%', top: '45%' },
          { left: '74%', top: '22%' }, { left: '30%', top: '68%' },
          { left: '70%', top: '70%' },
        ]
        const pos = positions[i % positions.length]
        return (
          <div key={plan.id} onClick={() => onPinClick?.(plan)} className="absolute cursor-pointer" style={pos}>
            <PlanPin plan={plan} onClick={() => onPinClick?.(plan)} />
          </div>
        )
      })}

      {/* You */}
      <div className="absolute" style={{ left: '47%', top: '58%' }}>
        <YouAreHere />
        <div className="font-display text-[10px] text-ink-2 mt-1 text-center">you</div>
      </div>

      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-white rounded-xl px-3 py-2 text-xs text-ink-2 text-center" style={{ border: '1px solid var(--line)' }}>
          Add VITE_GOOGLE_MAPS_API_KEY to .env for live map
        </div>
      )}
    </div>
  )
}
