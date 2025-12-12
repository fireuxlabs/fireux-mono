import type { H3Event } from 'h3'

export function resolvePlacesApiKey(event: H3Event): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (key === undefined) return null
  return key
}
