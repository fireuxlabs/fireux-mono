import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { loadGoogleMaps, readGoogleMaps } from '../utils/google-maps'

export function useGoogleMaps() {
  const runtime = useRuntimeConfig()
  const places = computed(() => {
    const value = (runtime.public as any)?.fireux?.places
    return value && typeof value === 'object' ? value : {}
  })
  const googleMaps = computed(() => {
    const value = places.value.googleMaps
    return value && typeof value === 'object' ? value : {}
  })
  const apiKey = computed(() => String(googleMaps.value.apiKey || '').trim())
  const mapId = computed(() => String(googleMaps.value.mapId || '').trim())

  return {
    apiKey,
    mapId,
    load: () => loadGoogleMaps(apiKey.value),
    read: readGoogleMaps,
  }
}
