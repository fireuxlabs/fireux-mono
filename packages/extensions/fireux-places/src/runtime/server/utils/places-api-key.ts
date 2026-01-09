import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

export function resolvePlacesApiKey(event: H3Event): string | null {
  const rc = useRuntimeConfig(event) as any

  const candidates = [
    // Prefer server-only runtime config if present
    rc?.googlePlacesApiKey,
    rc?.fireux?.googlePlacesApiKey,

    // Fallback to public runtime config (matches docs, but less ideal)
    rc?.public?.googlePlacesApiKey,
    rc?.public?.fireux?.googlePlacesApiKey,

    // Environment fallbacks (Nuxt auto-injects NUXT_* into runtimeConfig)
    process.env.GOOGLE_PLACES_API_KEY,
    process.env.NUXT_GOOGLE_PLACES_API_KEY,
    process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  ]

  const key = candidates.find(
    (v) => typeof v === 'string' && v.trim().length > 0
  ) as string | undefined

  return key?.trim() ?? null
}
