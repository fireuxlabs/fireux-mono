export type DeliveryCoverageZone = {
  id?: string
  label?: string
  radius_m?: number
  postal_codes?: string[]
  place_ids?: string[]
  polygon?: Array<{
    lat: number
    lng: number
  }>
  color?: string
  min_order_chf?: number
  fee_chf?: number
}

type ResolvedPostalCode = {
  placeId: string
  geometry?: any
}

export function hasPostalCodeZones(zones: DeliveryCoverageZone[]) {
  return zones.some(
    (zone) => Boolean(zone.place_ids?.length) || Boolean(zone.postal_codes?.length)
  )
}

export async function resolveDeliveryZonePlaceIds(
  google: any,
  zones: DeliveryCoverageZone[],
  bounds: any
) {
  const colorsByPlaceId: Record<string, string> = {}
  let hasBounds = false

  for (const zone of zones) {
    const color = zone.color || '#ff7a32'
    const placeIds: ResolvedPostalCode[] = zone.place_ids?.length
      ? zone.place_ids.map((placeId) => ({ placeId }))
      : await Promise.all(
        (zone.postal_codes || []).map((postalCode) =>
          resolvePostalCode(google, postalCode)
        )
      )

    placeIds
      .filter((entry) => Boolean(entry.placeId))
      .forEach((entry) => {
        colorsByPlaceId[entry.placeId] = color
        if (extendBoundsWithGeometry(bounds, entry.geometry)) {
          hasBounds = true
        }
      })
  }

  return {
    colorsByPlaceId,
    hasBounds,
  }
}

export function renderDeliveryZonePolygons(
  google: any,
  map: any,
  zones: DeliveryCoverageZone[]
) {
  zones
    .filter((zone) => Array.isArray(zone.polygon) && zone.polygon.length >= 3)
    .forEach((zone) => {
      const color = zone.color || '#ff7a32'

      new google.maps.Polygon({
        paths: zone.polygon,
        fillColor: color,
        fillOpacity: 0.34,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 2,
        map,
      })
    })
}

export function renderDeliveryZonePolygonPoints(
  google: any,
  map: any,
  zones: DeliveryCoverageZone[]
) {
  zones
    .filter((zone) => Array.isArray(zone.polygon) && zone.polygon.length)
    .forEach((zone) => {
      const color = zone.color || '#ff7a32'

      zone.polygon?.forEach((point, index) => {
        new google.maps.Marker({
          position: point,
          map,
          label: {
            text: String(index + 1),
            color: '#111827',
            fontWeight: '900',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })
      })
    })
}

export function renderDeliveryZoneRadii(
  google: any,
  map: any,
  zones: DeliveryCoverageZone[],
  center: { lat: number; lng: number }
) {
  zones
    .filter((zone) => Number(zone.radius_m || 0) > 0)
    .forEach((zone) => {
      const color = zone.color || '#ff7a32'

      new google.maps.Circle({
        center,
        radius: Number(zone.radius_m || 0),
        fillColor: color,
        fillOpacity: 0.22,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 2,
        map,
      })
    })
}

export function extendBoundsWithLocalZones(
  google: any,
  bounds: any,
  zones: DeliveryCoverageZone[],
  center: { lat: number; lng: number }
) {
  let hasBounds = false

  zones.forEach((zone) => {
    const radius = Number(zone.radius_m || 0)
    if (radius > 0) {
      extendBoundsWithRadius(bounds, center, radius)
      hasBounds = true
    }

    zone.polygon?.forEach((point) => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng))
      hasBounds = true
    })
  })

  return hasBounds
}

export function fitDeliveryZoneBounds(
  map: any,
  bounds: any,
  hasBounds: boolean,
  padding: number
) {
  if (!hasBounds) return

  map.fitBounds(bounds, {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding,
  })
}

export function roundCoordinate(value: number) {
  return Math.round(value * 1000000) / 1000000
}

export function zoneRuleLabel(zone: DeliveryCoverageZone) {
  return [
    `Min - ${chf(Number(zone.min_order_chf || 0))}`,
    `Fee - ${chf(Number(zone.fee_chf || 0))}`,
  ].join(', ')
}

function extendBoundsWithRadius(
  bounds: any,
  center: { lat: number; lng: number },
  radiusM: number
) {
  const latDelta = radiusM / 111320
  const lngDelta = radiusM /
    (111320 * Math.max(Math.cos(center.lat * Math.PI / 180), 0.12))

  bounds.extend({ lat: center.lat + latDelta, lng: center.lng + lngDelta })
  bounds.extend({ lat: center.lat + latDelta, lng: center.lng - lngDelta })
  bounds.extend({ lat: center.lat - latDelta, lng: center.lng + lngDelta })
  bounds.extend({ lat: center.lat - latDelta, lng: center.lng - lngDelta })
}

function extendBoundsWithGeometry(bounds: any, geometry: any) {
  if (!geometry) return false
  if (geometry.bounds) {
    bounds.union(geometry.bounds)
    return true
  }
  if (geometry.viewport) {
    bounds.union(geometry.viewport)
    return true
  }
  if (geometry.location) {
    bounds.extend(geometry.location)
    return true
  }

  return false
}

function chf(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
}

function resolvePostalCode(google: any, postalCode: string) {
  return new Promise<ResolvedPostalCode>((resolve) => {
    const geocoder = new google.maps.Geocoder()

    geocoder.geocode(
      {
        componentRestrictions: {
          country: 'CH',
          postalCode,
        },
      },
      (results: any[] | null, status: string) => {
        if (status !== 'OK' || !Array.isArray(results)) {
          resolve({ placeId: '' })
          return
        }

        const result = results.find((entry) =>
          Array.isArray(entry.types) && entry.types.includes('postal_code')
        ) || results[0]

        resolve({
          placeId: String(result?.place_id || '').trim(),
          geometry: result?.geometry,
        })
      }
    )
  })
}
