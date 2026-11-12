import {
  BASE_RESERVED_ROUTE_KEYS,
  normalizeReservedRouteKey,
} from '../../utils/public-slug-policy'

const ROOT_REGISTRY_KEY = '__fireux_reserved_route_keys__'

function getRootRegistry(): Set<string> {
  const globalAny = globalThis as any
  if (!globalAny[ROOT_REGISTRY_KEY]) {
    globalAny[ROOT_REGISTRY_KEY] = new Set(
      BASE_RESERVED_ROUTE_KEYS.map(normalizeReservedRouteKey).filter(Boolean)
    )
  }
  return globalAny[ROOT_REGISTRY_KEY] as Set<string>
}

export function registerReservedRootRouteKeys(keys: string[]): void {
  const registry = getRootRegistry()
  for (const raw of Array.isArray(keys) ? keys : []) {
    const key = normalizeReservedRouteKey(raw)
    if (!key) continue
    registry.add(key)
  }
}

export function getReservedRootRouteKeys(): string[] {
  return Array.from(getRootRegistry())
}
