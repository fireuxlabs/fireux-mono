import type { Nuxt } from '@nuxt/schema'
import {
  BASE_RESERVED_ROUTE_KEYS,
  normalizeReservedRouteKey,
} from '../../utils/public-slug-policy.ts'

export function registerReservedRootRouteKeys(
  nuxt: Nuxt,
  keys: readonly string[]
) {
  const fireux = (nuxt.options.runtimeConfig.public.fireux ||= {})
  const current = Array.isArray(fireux.reservedRouteKeys)
    ? fireux.reservedRouteKeys
    : []
  fireux.reservedRouteKeys = [
    ...new Set(
      [...BASE_RESERVED_ROUTE_KEYS, ...current, ...keys]
        .map(normalizeReservedRouteKey)
        .filter(Boolean)
    ),
  ]
}
