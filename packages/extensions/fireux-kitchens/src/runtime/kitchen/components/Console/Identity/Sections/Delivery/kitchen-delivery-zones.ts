import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { KitchenDeliveryZone } from '../../../../../models/kitchen.model.ts'

export type BoundaryType = 'radius' | 'postal_codes' | 'polygon'

export type EditableZone = {
    key: string
    label: string
    min_order_chf: string
    fee_chf: string
    boundary_type: BoundaryType
    radius_m: string
    postal_codes: string
    polygon: string
  }

export const zoneColors = ['#ff7a32', '#f4b41a', '#2fb7a0', '#39bfe3']

export const text = (value: unknown) => String(value ?? '').trim()

export const numberText = (value: unknown) => {
    const number = Number(value)

    return Number.isFinite(number) ? String(number) : ''
  }

export const numberValue = (value: unknown) => {
    const number = Number(value)

    return Number.isFinite(number) && number >= 0 ? number : undefined
  }

export const compactList = (value: string) =>
    value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)

export const polygonText = (zone: KitchenDeliveryZone) =>
    (zone.polygon || []).map((point) => `${point.lat}, ${point.lng}`).join('\n')

export const parsePolygon = (value: string) =>
    value
      .split('\n')
      .map((row) => {
        const [latRaw, lngRaw] = row.split(',').map((entry) => entry.trim())
        const lat = Number(latRaw)
        const lng = Number(lngRaw)

        return Number.isFinite(lat) && Number.isFinite(lng)
          ? { lat, lng }
          : null
      })
      .filter((point): point is { lat: number; lng: number } => Boolean(point))

export const editableZone = (
    zone: KitchenDeliveryZone,
    index: number
  ): EditableZone => ({
    key: `${zone.id || 'zone'}-${index}-${Date.now()}`,
    label: text(zone.label),
    min_order_chf: numberText(zone.min_order_chf),
    fee_chf: numberText(zone.fee_chf),
    boundary_type: zoneBoundaryType(zone),
    radius_m: numberText(zone.radius_m),
    postal_codes: (zone.postal_codes || []).join(', '),
    polygon: polygonText(zone),
  })

export const zoneBoundaryType = (zone: KitchenDeliveryZone): BoundaryType => {
    if (Number(zone.radius_m || 0) > 0) return 'radius'
    if (zone.polygon?.length) return 'polygon'

    return 'postal_codes'
  }

export const zonePlaceholder = (index: string | number) =>
    `Zone ${Number(index) + 1}`

export const zoneId = (zone: EditableZone, index: number) =>
    normalizeSlug(text(zone.label), { maxLength: 80 }) ||
    `delivery-zone-${index + 1}`

export const zoneColor = (index: number) => zoneColors[index % zoneColors.length]

export const zoneCardStyle = (index: number): Record<string, string> => {
    const color = zoneColor(index)

    return {
      '--delivery-zone-color': color,
      borderColor: color,
      boxShadow: `inset 0.35rem 0 0 ${color}`,
    }
  }

export const mapZone = (zone: EditableZone, index: number): KitchenDeliveryZone => ({
    id: zoneId(zone, index),
    label: text(zone.label) || `Zone ${index + 1}`,
    min_order_chf: numberValue(zone.min_order_chf) || 0,
    fee_chf: numberValue(zone.fee_chf) || 0,
    ...(zone.boundary_type === 'radius'
      ? { radius_m: numberValue(zone.radius_m) || 0 }
      : {}),
    ...(zone.boundary_type === 'postal_codes'
      ? { postal_codes: compactList(zone.postal_codes) }
      : {}),
    ...(zone.boundary_type === 'polygon'
      ? { polygon: parsePolygon(zone.polygon) }
      : {}),
    color: zoneColor(index),
  })

export const normalizedZone = (
    zone: EditableZone,
    index: number
  ): KitchenDeliveryZone | null => {
    const label = text(zone.label)
    if (!label) return null

    const postalCodes = compactList(zone.postal_codes)
    const polygon = parsePolygon(zone.polygon)
    const radius = numberValue(zone.radius_m)
    const minOrder = numberValue(zone.min_order_chf)
    const fee = numberValue(zone.fee_chf)

    return {
      id: zoneId(zone, index),
      label,
      ...(minOrder !== undefined ? { min_order_chf: minOrder } : {}),
      ...(fee !== undefined ? { fee_chf: fee } : {}),
      ...(zone.boundary_type === 'radius' && radius !== undefined
        ? { radius_m: radius }
        : {}),
      ...(zone.boundary_type === 'postal_codes' && postalCodes.length
        ? { postal_codes: postalCodes }
        : {}),
      ...(zone.boundary_type === 'polygon' && polygon.length
        ? { polygon }
        : {}),
      color: zoneColor(index),
    }
  }

