import { useEffect, useState } from 'react'

export type Coords = { lat: number; lng: number }

export function useGeolocation(): Coords | null {
  const [coords, setCoords] = useState<Coords | null>(null)

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    const id = navigator.geolocation.watchPosition(
      pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 15_000 }
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return coords
}
