<template>
  <section
    class="delivery-coverage-map"
    :class="{ 'delivery-coverage-map--compact': compact }"
    aria-label="Delivery coverage map"
  >
    <div class="delivery-coverage-map__canvas">
      <div
        ref="mapEl"
        class="delivery-coverage-map__google"
      />

      <p
        v-if="mapMessage"
        class="delivery-coverage-map__message"
      >
        {{ mapMessage }}
      </p>

      <p
        v-if="mapError"
        class="delivery-coverage-map__error"
      >
        {{ mapError }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { loadFireuxGoogleMaps, readGoogleMaps } from '../../utils/google-maps'
import {
  extendBoundsWithLocalZones,
  fitDeliveryZoneBounds,
  hasPostalCodeZones,
  renderDeliveryZonePolygonPoints,
  renderDeliveryZonePolygons,
  renderDeliveryZoneRadii,
  resolveDeliveryZonePlaceIds,
  roundCoordinate,
  type DeliveryCoverageZone,
} from '../../utils/kitchen-delivery-zones-map'

// Delivery coverage map spine: shared renderer for kitchen fulfilment zones and driver radius coverage.

const props = withDefaults(
  defineProps<{
    zones?: DeliveryCoverageZone[]
    center?: { lat: number; lng: number }
    canEdit?: boolean
    editableMode?: 'radius' | 'postal_codes' | 'polygon' | ''
    editableZoneIndex?: number | null
    compact?: boolean
    maxZoom?: number
  }>(),
  {
    zones: () => [],
    center: () => ({ lat: 46.7004, lng: 7.8922 }),
    canEdit: false,
    editableMode: '',
    editableZoneIndex: null,
    compact: false,
    maxZoom: 0,
  }
)

const emit = defineEmits<{
  (
    event: 'polygon-point',
    payload: { zoneIndex: number; point: { lat: number; lng: number } }
  ): void
}>()

const runtimeConfig = useRuntimeConfig()
const publicConfig = runtimeConfig.public as Record<string, unknown>
const mapEl = ref<HTMLElement | null>(null)
const mapMessage = ref('Loading delivery map...')
const mapError = ref('')
const isMounted = ref(false)
const mapClickListener = ref<{ remove: () => void } | null>(null)
const zoneColorsByPlaceId = ref<Record<string, string>>({})
const deliveryZones = computed(() => props.zones)
const mapPadding = 28
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
      center: props.center,
      zoom: props.compact ? 10 : 11,
      mapId: googleMapsMapId.value,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    })
    const bounds = new google.maps.LatLngBounds()
    let hasBounds = extendBoundsWithLocalZones(
      google,
      bounds,
      deliveryZones.value,
      props.center
    )

    renderDeliveryZoneRadii(google, map, deliveryZones.value, props.center)
    renderDeliveryZonePolygons(google, map, deliveryZones.value)
    if (props.canEdit) {
      renderDeliveryZonePolygonPoints(google, map, deliveryZones.value)
    }
    attachPolygonClickListener(map)

    if (hasPostalCodeZones(deliveryZones.value)) {
      const featureLayer = map.getFeatureLayer('POSTAL_CODE')
      featureLayer.style = stylePostalCodeFeature

      const resolvedZones = await resolveDeliveryZonePlaceIds(
        google,
        deliveryZones.value,
        bounds
      )
      zoneColorsByPlaceId.value = resolvedZones.colorsByPlaceId
      hasBounds = hasBounds || resolvedZones.hasBounds
      if (Object.keys(zoneColorsByPlaceId.value).length) {
        featureLayer.style = stylePostalCodeFeature
      }
    }
    fitDeliveryZoneBounds(map, bounds, hasBounds, mapPadding)
    capZoom(google, map)

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

function attachPolygonClickListener(map: any) {
  if (!props.canEdit || props.editableMode !== 'polygon') return
  const zoneIndex = Number(props.editableZoneIndex)
  if (!Number.isInteger(zoneIndex) || zoneIndex < 0) return

  mapClickListener.value = map.addListener('click', (event: any) => {
    const latLng = event.latLng
    if (!latLng) return

    emit('polygon-point', {
      zoneIndex,
      point: {
        lat: roundCoordinate(latLng.lat()),
        lng: roundCoordinate(latLng.lng()),
      },
    })
  })
}

function capZoom(google: any, map: any) {
  const maxZoom = Number(props.maxZoom || 0)
  if (!Number.isFinite(maxZoom) || maxZoom <= 0) return

  google.maps.event.addListenerOnce(map, 'idle', () => {
    const zoom = Number(map.getZoom?.())
    if (Number.isFinite(zoom) && zoom > maxZoom) {
      map.setZoom(maxZoom)
    }
  })
}

onBeforeUnmount(() => {
  isMounted.value = false
  mapClickListener.value?.remove()
  mapClickListener.value = null
})
</script>

<style scoped>
.delivery-coverage-map {
  display: grid;
  gap: 0.75rem;
}

.delivery-coverage-map__canvas {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 8;
  max-height: 20rem;
  border: 1px solid color-mix(in srgb, var(--menu-text, var(--ui-text)) 14%, transparent);
  border-radius: 1.15rem;
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 90%, var(--menu-text, var(--ui-text)));
}

.delivery-coverage-map--compact .delivery-coverage-map__canvas {
  aspect-ratio: 1;
  max-height: 16rem;
}

.delivery-coverage-map__google {
  width: 100%;
  height: 100%;
}

.delivery-coverage-map__message,
.delivery-coverage-map__error {
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

.delivery-coverage-map__error {
  color: #b42318;
}
</style>
