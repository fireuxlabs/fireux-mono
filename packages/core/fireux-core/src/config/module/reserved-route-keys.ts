const REGISTRY_KEY = '__fireux_reserved_route_keys__'

const normalizeKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

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

function getRegistry(): Set<string> {
  const globalAny = globalThis as any
  if (!globalAny[REGISTRY_KEY]) {
    globalAny[REGISTRY_KEY] = new Set(
      BASE_RESERVED_ROUTE_KEYS.map(normalizeKey).filter(Boolean)
    )
  }
  return globalAny[REGISTRY_KEY] as Set<string>
}

export function registerReservedRouteKeys(keys: string[]): void {
  const registry = getRegistry()
  for (const raw of Array.isArray(keys) ? keys : []) {
    const key = normalizeKey(raw)
    if (!key) continue
    registry.add(key)
  }
}

export function getReservedRouteKeys(): string[] {
  return Array.from(getRegistry())
}

