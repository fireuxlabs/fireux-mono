import type { H3Event } from 'h3'
import { resolveGooglePlacesApiKey } from './google-api-key'

export function resolvePlacesApiKey(event: H3Event): string | null {
  return resolveGooglePlacesApiKey(event).key || null
}
