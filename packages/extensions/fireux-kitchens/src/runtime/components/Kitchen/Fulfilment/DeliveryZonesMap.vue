<template>
  <section
    class="delivery-zones-map"
    aria-label="Delivery area map"
  >
    <div class="delivery-zones-map__canvas">
      <div
        ref="mapEl"
        class="delivery-zones-map__google"
      />

      <p
        v-if="mapMessage"
        class="delivery-zones-map__message"
      >
        {{ mapMessage }}
      </p>

      <p
        v-if="mapError"
        class="delivery-zones-map__error"
      >
        {{ mapError }}
      </p>
    </div>

    <div
      class="delivery-zones-map__key"
      aria-label="Delivery fees"
    >
      <p
        v-for="zone in deliveryZones"
        :key="zone.id || zone.label"
        class="delivery-zones-map__key-item"
        :style="{ '--zone-color': zone.color || '#ff7a32' }"
      >
        <span />
        {{ zoneRuleLabel(zone) }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { KitchenDeliveryZone } from '../../../models/kitchen.model'
import { loadFireuxGoogleMaps, readGoogleMaps } from '../../../utils/google-maps'

const props = withDefaults(
  defineProps<{
    zones?: KitchenDeliveryZone[]
  }>(),
  {
    zones: () => [],
  }
)

const runtimeConfig = useRuntimeConfig()
const publicConfig = runtimeConfig.public as Record<string, unknown>
const mapEl = ref<HTMLElement | null>(null)
const mapMessage = ref('Loading delivery map...')
const mapError = ref('')
const isMounted = ref(false)
const zoneColorsByPlaceId = ref<Record<string, string>>({})
const deliveryZones = computed(() => props.zones)
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
    return
  }

  try {
    await loadFireuxGoogleMaps(googleMapsApiKey.value)

    const google = readGoogleMaps()
    await google.maps.importLibrary('maps')

    const map = new google.maps.Map(mapEl.value, {
      center: { lat: 46.7004, lng: 7.8922 },
      zoom: 11,
      mapId: googleMapsMapId.value,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    })
    const featureLayer = map.getFeatureLayer('POSTAL_CODE')
    renderDeliveryZonePolygons(google, map, deliveryZones.value)

    featureLayer.style = stylePostalCodeFeature

    zoneColorsByPlaceId.value = await resolveDeliveryZonePlaceIds(
      google,
      deliveryZones.value
    )
    const resolvedCount = Object.keys(zoneColorsByPlaceId.value).length
    if (resolvedCount) {
      featureLayer.style = stylePostalCodeFeature
    }

    if (isMounted.value) mapMessage.value = ''
  } catch (error) {
    if (!isMounted.value) return
    mapMessage.value = ''
    mapError.value = error instanceof Error
      ? error.message
      : 'Google Maps could not load.'
  }
})

function stylePostalCodeFeature(options: any) {
  const placeId = String(options.feature?.placeId || '').trim()
  const color = zoneColorsByPlaceId.value[placeId]

  return {
    fillColor: color || '#000000',
    fillOpacity: color ? 0.42 : 0,
    strokeColor: color || '#6b7280',
    strokeOpacity: color ? 1 : 0,
    strokeWeight: color ? 2 : 0,
  }
}

async function resolveDeliveryZonePlaceIds(
  google: any,
  zones: KitchenDeliveryZone[]
) {
  const resolved: Record<string, string> = {}

  for (const zone of zones) {
    const color = zone.color || '#ff7a32'
    const placeIds = zone.place_ids?.length
      ? zone.place_ids
      : await Promise.all(
        (zone.postal_codes || []).map((postalCode) =>
          resolvePostalCodePlaceId(google, postalCode)
        )
      )

    placeIds
      .filter(Boolean)
      .forEach((placeId) => {
        resolved[placeId] = color
      })
  }

  return resolved
}

function renderDeliveryZonePolygons(
  google: any,
  map: any,
  zones: KitchenDeliveryZone[]
) {
  zones
    .filter((zone) => Array.isArray(zone.polygon) && zone.polygon.length >= 3)
    .forEach((zone) => {
      const color = zone.color || '#ff7a32'

      new google.maps.Polygon({
        paths: zone.polygon,
        fillColor: color,
        fillOpacity: 0.34,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 2,
        map,
      })
    })
}

function chf(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
}

function zoneRuleLabel(zone: KitchenDeliveryZone) {
  return [
    `Min - ${chf(Number(zone.min_order_chf || 0))}`,
    `Fee - ${chf(Number(zone.fee_chf || 0))}`,
  ].join(', ')
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
</script>

<style scoped>
.delivery-zones-map {
  display: grid;
  gap: 0.75rem;
}

.delivery-zones-map__canvas {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid color-mix(in srgb, var(--menu-text, var(--ui-text)) 14%, transparent);
  border-radius: 1.15rem;
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 90%, var(--menu-text, var(--ui-text)));
}

.delivery-zones-map__google {
  width: 100%;
  height: 100%;
}

.delivery-zones-map__message,
.delivery-zones-map__error {
  position: absolute;
  inset: auto 1rem 1rem 1rem;
  z-index: 1;
  margin: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 0.85rem;
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 88%, transparent);
  color: var(--menu-text, var(--ui-text));
  font-size: 0.8rem;
  font-weight: 800;
}

.delivery-zones-map__error {
  color: #b42318;
}

.delivery-zones-map__key {
  display: grid;
  gap: 0.45rem;
}

.delivery-zones-map__key-item {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  margin: 0;
  color: var(--menu-text, var(--ui-text));
  font-size: 0.84rem;
  font-weight: 850;
}

.delivery-zones-map__key-item span {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  background: var(--zone-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--menu-text, var(--ui-text)) 16%, transparent);
}
</style>
