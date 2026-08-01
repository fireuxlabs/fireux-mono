import type { CSSProperties } from 'vue'
import type { LandingCardOrbitItem } from '../../../types/landing-card-orbit'

export type ResolvedOrbitItem = Required<LandingCardOrbitItem>

export const ORBIT_TAU = Math.PI * 2
export const ORBIT_DEFAULT_YAW = 0.72
export const ORBIT_DEFAULT_PITCH = -0.12
export const ORBIT_IDLE_SPEED = ORBIT_TAU / 20000
export const ORBIT_INTRO_DURATION = 7200
export const ORBIT_INTRO_START_SPEED =
  (2 * ORBIT_TAU * 2) / ORBIT_INTRO_DURATION - ORBIT_IDLE_SPEED
export const ORBIT_INTRO_PITCH_SWEEP_MIN = 0.18
export const ORBIT_INTRO_PITCH_SWEEP_MAX = 0.28

const REAR_CARD_SCALE = 0.42
const FRONT_CARD_SCALE = 0.9
const SELECTED_CARD_SCALE = 1
const DEFAULT_LATITUDES = [
  -0.68, -0.2, 0.34, 0.7, 0.08, -0.44, 0.54, -0.58, 0.24, -0.04,
] as const

export function resolveLandingOrbitItems(
  items: readonly LandingCardOrbitItem[]
): ResolvedOrbitItem[] {
  const count = Math.max(1, items.length)
  return items.map((item, index) => ({
    ...item,
    latitude:
      typeof item.latitude === 'number'
        ? item.latitude
        : (DEFAULT_LATITUDES[index % DEFAULT_LATITUDES.length] ?? 0),
    longitude:
      typeof item.longitude === 'number'
        ? item.longitude
        : (index / count) * ORBIT_TAU - Math.PI / 2,
  }))
}

export function landingOrbitItemCoordinates(input: {
  item: ResolvedOrbitItem
  yaw: number
  pitch: number
}) {
  const { item, yaw, pitch } = input
  const cosLatitude = Math.cos(item.latitude)
  const baseX = cosLatitude * Math.sin(item.longitude)
  const baseY = Math.sin(item.latitude)
  const baseZ = cosLatitude * Math.cos(item.longitude)
  const rotatedX = baseX * Math.cos(yaw) + baseZ * Math.sin(yaw)
  const yawDepth = -baseX * Math.sin(yaw) + baseZ * Math.cos(yaw)
  const rotatedY = baseY * Math.cos(pitch) - yawDepth * Math.sin(pitch)
  const rotatedDepth = baseY * Math.sin(pitch) + yawDepth * Math.cos(pitch)
  const depth = Math.max(0, Math.min(1, (rotatedDepth + 1) / 2))
  return { depth, rotatedX, rotatedY }
}

const stableStyleNumber = (value: number) => Number(value.toFixed(6))

export function landingOrbitItemStyle(input: {
  item: ResolvedOrbitItem
  yaw: number
  pitch: number
  rootWidth: number
  selectedId: string | null
}): CSSProperties {
  const { item, rootWidth, selectedId } = input
  const { depth, rotatedX, rotatedY } = landingOrbitItemCoordinates(input)
  const compact = rootWidth < 768
  const radiusX = compact ? Math.max(132, Math.min(168, rootWidth * 0.4)) : 304
  const radiusY = compact ? 142 : 178
  const scale =
    selectedId === item.id
      ? SELECTED_CARD_SCALE
      : REAR_CARD_SCALE + depth * (FRONT_CARD_SCALE - REAR_CARD_SCALE)
  return {
    zIndex: selectedId === item.id ? 1000 : Math.round(depth * 800),
    opacity: 1,
    pointerEvents: depth < 0.3 && selectedId !== item.id ? 'none' : 'auto',
    transform: `translate(calc(-50% + ${stableStyleNumber(rotatedX * radiusX)}px), calc(-50% + ${stableStyleNumber(rotatedY * radiusY)}px)) scale(${stableStyleNumber(scale)})`,
  }
}
