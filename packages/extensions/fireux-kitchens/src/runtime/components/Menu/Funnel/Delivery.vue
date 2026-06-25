<template>
  <div class="menu-order-funnel">
    <section
      class="delivery-map"
      aria-label="Delivery area map"
    >
      <div class="delivery-map__canvas">
        <div
          ref="mapEl"
          class="delivery-map__google"
        />

        <p
          v-if="mapMessage"
          class="delivery-map__message"
        >
          {{ mapMessage }}
        </p>

        <p
          v-if="mapError"
          class="delivery-map__error"
        >
          {{ mapError }}
        </p>
      </div>

      <p class="delivery-map__debug">
        {{ mapDebug }}
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import type { MenuOrderTypeConfig } from '../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../models/order.model'

// Menu ordering funnel: docs/concepts/menu-ordering.md
const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

type GoogleMapsWindow = Window & {
  google?: any
  __fireuxGoogleMapsPromise?: Promise<void>
}

const runtimeConfig = useRuntimeConfig()
const publicConfig = runtimeConfig.public as Record<string, unknown>
const mapEl = ref<HTMLElement | null>(null)
const mapMessage = ref('Loading delivery map...')
const mapError = ref('')
const mapDebug = ref('Google map: waiting')
const isMounted = ref(false)
const selectedPlaceId = ref('')
const testZoneColor = computed(() =>
  props.policy?.fulfilment?.delivery_zones?.find((zone) => zone.color)?.color || ''
)
const testPostalCode = computed(() =>
  props.policy?.fulfilment?.delivery_zones
    ?.flatMap((zone) => zone.postal_codes || [])
    .find(Boolean) || ''
)
const googleMapsApiKey = computed(() =>
  String(publicConfig.googleMapsApiKey || '').trim()
)
const googleMapsMapId = computed(() =>
  String(publicConfig.googleMapsMapId || '').trim()
)

onMounted(async () => {
  isMounted.value = true
  if (!mapEl.value) return
  if (!googleMapsApiKey.value || !googleMapsMapId.value) {
    mapMessage.value = ''
    mapError.value = 'Google Maps key or Map ID is missing.'
    mapDebug.value = 'Google map: missing key or map id'
    return
  }

  try {
    mapDebug.value = 'Google map: loading Maps JS'
    await loadGoogleMaps(googleMapsApiKey.value)

    const google = (window as GoogleMapsWindow).google
    await google.maps.importLibrary('maps')

    mapDebug.value = 'Google map: creating map with Map ID'
    const map = new google.maps.Map(mapEl.value, {
      center: { lat: 46.7004, lng: 7.8922 },
      zoom: 11,
      mapId: googleMapsMapId.value,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    })
    const featureLayer = map.getFeatureLayer('POSTAL_CODE')

    mapDebug.value = testPostalCode.value
      ? `Resolving postal code ${testPostalCode.value}...`
      : 'POSTAL_CODE layer ready; no postal code configured.'
    featureLayer.addListener('click', (event: any) => {
      const feature = event.features?.[0]
      const placeId = String(feature?.placeId || '').trim()
      if (!placeId) return

      selectedPlaceId.value = placeId
      mapDebug.value = `Selected POSTAL_CODE placeId: ${placeId}`
      featureLayer.style = stylePostalCodeFeature
    })
    featureLayer.style = stylePostalCodeFeature

    const placeId = testPostalCode.value
      ? await resolvePostalCodePlaceId(google, testPostalCode.value)
      : ''
    if (placeId) {
      selectedPlaceId.value = placeId
      mapDebug.value = `Colouring ${testPostalCode.value}: ${placeId}`
      featureLayer.style = stylePostalCodeFeature
    } else if (testPostalCode.value) {
      mapDebug.value = `Could not resolve ${testPostalCode.value}; click a postcode area to capture it.`
    }

    if (isMounted.value) mapMessage.value = ''
  } catch (error) {
    if (!isMounted.value) return
    mapMessage.value = ''
    mapError.value = error instanceof Error
      ? error.message
      : 'Google Maps could not load.'
    mapDebug.value = 'Google map: failed'
  }
})

function stylePostalCodeFeature(options: any) {
  const placeId = String(options.feature?.placeId || '').trim()
  const selected = selectedPlaceId.value && placeId === selectedPlaceId.value

  return {
    fillColor: selected ? testZoneColor.value || '#ff7a32' : '#000000',
    fillOpacity: selected ? 0.42 : 0,
    strokeColor: selected ? testZoneColor.value || '#ff7a32' : '#6b7280',
    strokeOpacity: selected ? 1 : 0,
    strokeWeight: selected ? 2 : 0,
  }
}

function resolvePostalCodePlaceId(google: any, postalCode: string) {
  return new Promise<string>((resolve) => {
    const geocoder = new google.maps.Geocoder()

    geocoder.geocode(
      {
        componentRestrictions: {
          country: 'CH',
          postalCode,
        },
      },
      (results: any[] | null, status: string) => {
        if (status !== 'OK' || !Array.isArray(results)) {
          resolve('')
          return
        }

        const result = results.find((entry) =>
          Array.isArray(entry.types) && entry.types.includes('postal_code')
        ) || results[0]

        resolve(String(result?.place_id || '').trim())
      }
    )
  })
}

onBeforeUnmount(() => {
  isMounted.value = false
})

function loadGoogleMaps(apiKey: string) {
  const target = window as GoogleMapsWindow

  if (target.google?.maps?.importLibrary) {
    return Promise.resolve()
  }

  if (target.__fireuxGoogleMapsPromise) {
    return target.__fireuxGoogleMapsPromise
  }

  target.__fireuxGoogleMapsPromise = new Promise<void>((resolve, reject) => {
    const callbackName = `__fireuxGoogleMapsReady_${Date.now()}`
    ;(target as unknown as Record<string, unknown>)[callbackName] = () => {
      delete (target as unknown as Record<string, unknown>)[callbackName]
      resolve()
    }

    const script = document.createElement('script')
    const url = new URL('https://maps.googleapis.com/maps/api/js')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('v', 'weekly')
    url.searchParams.set('loading', 'async')
    url.searchParams.set('callback', callbackName)
    script.src = url.toString()
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error('Google Maps script failed to load.'))
    document.head.appendChild(script)
  })

  return target.__fireuxGoogleMapsPromise
}
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.delivery-map {
  display: grid;
  gap: 0.75rem;
}

.delivery-map__canvas {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 1.15rem;
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-text));
}

.delivery-map__google {
  width: 100%;
  height: 100%;
}

.delivery-map__message,
.delivery-map__error {
  position: absolute;
  inset: auto 1rem 1rem 1rem;
  z-index: 1;
  margin: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--menu-bg) 88%, transparent);
  color: var(--menu-text);
  font-size: 0.8rem;
  font-weight: 800;
}

.delivery-map__error {
  color: #b42318;
}

.delivery-map__debug {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 800;
}
</style>
