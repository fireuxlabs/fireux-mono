import { configureRuntimeDefaults } from 'fireux-core/config/module/runtime-config'

type PlacesConfigOptions = {
  debug?: boolean
  types?: string[]
  googleAutocompleteTypeFilters?: Record<string, string[]>
}

export function configurePlaces(nuxt: any, options: PlacesConfigOptions = {}) {
  const browserMapsApiKey =
    process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    ''
  const browserMapsMapId = process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID || ''
  configureRuntimeDefaults(
    nuxt,
    'places',
    {
      debug: Boolean(options.debug),
      enabled: true,
      types: options.types || [],
      googleAutocompleteTypeFilters:
        options.googleAutocompleteTypeFilters || {},
      googleMaps: {
        apiKey: browserMapsApiKey,
        mapId: browserMapsMapId,
      },
    },
    { merge: true }
  )

  const placesApiKey =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NUXT_GOOGLE_PLACES_API_KEY ||
    process.env.NUXT_PUBLIC_GOOGLE_PLACES_API_KEY
  const mapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NUXT_GOOGLE_MAPS_API_KEY ||
    placesApiKey
  if (!placesApiKey && !mapsApiKey) return
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  if (placesApiKey) rc.googlePlacesApiKey ||= placesApiKey
  if (mapsApiKey) rc.googleMapsApiKey ||= mapsApiKey
}
