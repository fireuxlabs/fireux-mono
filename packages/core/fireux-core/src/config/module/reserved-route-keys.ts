const REGISTRY_KEY = '__fireux_reserved_route_keys__'

export const normalizeReservedRouteKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

/**
 * Reserved top-level route keys registered by core and enabled modules.
 * These protect root-level public identities such as user handles.
 */
export const BASE_RESERVED_ROUTE_KEYS: string[] = [
  'apps',
  'users',
  'auth',
  'console',
  'onboarding',
  'legal',
  'admin',
  'dev',
  'api',
  'assets',
  'img',
  'static',
  '_nuxt',
]

/**
 * Reserved static/action route segments used inside entity namespaces.
 * These protect entity public slugs from colliding with routes such as
 * /products/create or /users/settings.
 */
export const BASE_RESERVED_ROUTE_SEGMENT_KEYS: string[] = [
  'new',
  'create',
  'edit',
  'delete',
  'settings',
  'me',
  'admin',
  'dev',
  'api',
]

function getRegistry(): Set<string> {
  const globalAny = globalThis as any
  if (!globalAny[REGISTRY_KEY]) {
    globalAny[REGISTRY_KEY] = new Set(
      BASE_RESERVED_ROUTE_KEYS
        .map(normalizeReservedRouteKey)
        .filter(Boolean)
    )
  }
  return globalAny[REGISTRY_KEY] as Set<string>
}

export function registerReservedRouteKeys(keys: string[]): void {
  const registry = getRegistry()
  for (const raw of Array.isArray(keys) ? keys : []) {
    const key = normalizeReservedRouteKey(raw)
    if (!key) continue
    registry.add(key)
  }
}

export function getReservedRouteKeys(): string[] {
  return Array.from(getRegistry())
}

export function getBaseReservedRouteSegmentKeys(): string[] {
  return BASE_RESERVED_ROUTE_SEGMENT_KEYS
    .map(normalizeReservedRouteKey)
    .filter(Boolean)
}
