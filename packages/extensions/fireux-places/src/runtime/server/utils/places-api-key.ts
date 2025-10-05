import type { H3Event } from 'h3'

export function resolvePlacesApiKey(event: H3Event): string | null {
  const config = event.context?.runtimeConfig || {}
  const publicConfig = (config.public ?? {}) as Record<string, any>

  return (
    (config.googlePlacesApiKey as string | undefined) ||
    (publicConfig.firebaseConfig?.apiKey as string | undefined) ||
    process.env.GOOGLE_PLACES_API_KEY ||
    null
  )
}
