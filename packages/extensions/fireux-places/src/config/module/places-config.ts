import { configureRuntime } from './runtime-config'

type PlacesConfigOptions = {
  debug?: boolean
  types?: string[]
  googleAutocompleteTypeFilters?: Record<string, string[]>
}

export function configurePlaces(
  nuxt: any,
  options: PlacesConfigOptions = {}
) {
  configureRuntime(nuxt, 'places', {
    debug: Boolean(options.debug),
    enabled: true,
    types: options.types || [],
    googleAutocompleteTypeFilters: options.googleAutocompleteTypeFilters || {},
  })

  const key =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NUXT_GOOGLE_PLACES_API_KEY ||
    process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!key) return
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  rc.googlePlacesApiKey ||= key
  pub.googlePlacesApiKey ||= key
}
