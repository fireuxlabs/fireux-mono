import { useRuntimeConfig } from '#imports'
import { getReservedRouteKeys } from '../../../../../../../../config/module/reserved-route-keys'

const normalizeKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

function getRuntimeReservedRouteKeys(): string[] {
  try {
    const rc = useRuntimeConfig() as any
    const keys = rc?.public?.fireux?.reservedRouteKeys
    return Array.isArray(keys) ? keys.map(normalizeKey).filter(Boolean) : []
  } catch {
    return []
  }
}

export function isVetoedHandle(handle: string): boolean {
  const key = normalizeKey(handle)
  if (!key) return false

  const merged = new Set<string>(getReservedRouteKeys().map(normalizeKey).filter(Boolean))
  for (const runtimeKey of getRuntimeReservedRouteKeys()) {
    merged.add(runtimeKey)
  }

  return merged.has(key)
}