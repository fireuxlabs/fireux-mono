import { configureRuntime } from './runtime-config'

type PlacesConfigOptions = {
  types?: string[]
  googleAutocompleteTypeFilters?: Record<string, string[]>
}

export function configurePlaces(
  nuxt: any,
  options: PlacesConfigOptions = {}
) {
  configureRuntime(nuxt, 'places', {
    enabled: true,
    types: options.types || [],
    googleAutocompleteTypeFilters: options.googleAutocompleteTypeFilters || {},
  })

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  rc.googlePlacesApiKey ||= key
  pub.googlePlacesApiKey ||= key
}
