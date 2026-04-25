import { useEffect, useRef } from 'react'
import { Map, Marker, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_CENTER, MAP_ZOOM } from '../../lib/constants'
import { MOCK_USERS } from '../../lib/mockData'
import { Avatar } from '../ui'
import { spotsLeft } from '../../lib/utils'
import type { Plan } from '../../types'

interface PhiliaMapProps {
  plans: Plan[]
  onPinClick?: (plan: Plan) => void
  currentUserLocation?: { lat: number; lng: number }
  height?: string
}

export default function PhiliaMap({ plans, onPinClick, currentUserLocation, height }: PhiliaMapProps) {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY
  const mapRef = useRef<MapRef | null>(null)
  const hasFlownRef = useRef(false)

  useEffect(() => {
    if (!currentUserLocation || hasFlownRef.current) return
    const map = mapRef.current
    if (!map) return
    map.flyTo({
      center: [currentUserLocation.lng, currentUserLocation.lat],
      zoom: MAP_ZOOM,
      duration: 1200,
      essential: true,
    })
    hasFlownRef.current = true
  }, [currentUserLocation])

  if (!apiKey) return <MapFallback plans={plans} onPinClick={onPinClick} />

  const styleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`

  return (
    <div style={{ width: '100%', height: height ?? '100%' }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: MAP_CENTER.lng,
          latitude: MAP_CENTER.lat,
          zoom: MAP_ZOOM,
        }}
        mapStyle={styleUrl}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {plans.map(plan => (
          <Marker
            key={plan.id}
            longitude={plan.restaurant.lng}
            latitude={plan.restaurant.lat}
            anchor="bottom"
          >
            <PlanPin plan={plan} onClick={() => onPinClick?.(plan)} />
          </Marker>
        ))}

        {currentUserLocation && (
          <Marker longitude={currentUserLocation.lng} latitude={currentUserLocation.lat} anchor="center">
            <YouAreHere />
          </Marker>
        )}
      </Map>
    </div>
  )
}

function PlanPin({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const spots = spotsLeft(plan)
  const isFull = spots === 0

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform"
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
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--line)' }} />
    </div>
  )
}

function YouAreHere() {
  return (
    <div style={{ position: 'relative' }}>
      <div className="ping absolute inset-0 rounded-full" style={{ background: '#3B82F6', opacity: 0.3, transform: 'scale(2)' }} />
      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 relative" style={{ border: '2.5px solid #fff', boxShadow: '0 0 0 1.5px var(--line)' }} />
    </div>
  )
}

function MapFallback({ plans, onPinClick, error }: { plans: Plan[]; onPinClick?: (plan: Plan) => void; error?: boolean }) {
  return (
    <div className="wk-map-placeholder w-full h-full relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 300" preserveAspectRatio="none">
        <path d="M0 100 Q 100 80 200 120 T 390 100" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M0 220 Q 130 240 260 200 T 390 230" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M130 0 Q 150 120 110 220 T 140 300" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <path d="M270 0 Q 290 100 260 200 T 280 300" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" opacity=".5"/>
        <text x="30" y="60" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Arts Quad</text>
        <text x="210" y="175" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Collegetown</text>
        <text x="25" y="250" fontFamily="Fraunces,serif" fontSize="13" fill="var(--ink-2)" fontStyle="italic">Commons</text>
      </svg>

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

      <div className="absolute" style={{ left: '47%', top: '58%' }}>
        <YouAreHere />
        <div className="font-display text-[10px] text-ink-2 mt-1 text-center">you</div>
      </div>

      {error && (
        <div className="absolute bottom-2 left-2 right-2 bg-white rounded-xl px-3 py-2 text-xs text-ink-2 text-center" style={{ border: '1px solid var(--line)' }}>
          Add VITE_MAPTILER_API_KEY to .env for live map
        </div>
      )}
    </div>
  )
}
