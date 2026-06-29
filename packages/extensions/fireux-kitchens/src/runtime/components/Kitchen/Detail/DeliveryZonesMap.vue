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
import {
  extendBoundsWithLocalZones,
  fitDeliveryZoneBounds,
  hasPostalCodeZones,
  renderDeliveryZonePolygonPoints,
  renderDeliveryZonePolygons,
  renderDeliveryZoneRadii,
  resolveDeliveryZonePlaceIds,
  roundCoordinate,
  zoneRuleLabel,
} from '../../../utils/kitchen-delivery-zones-map'

// Kitchen detail fulfilment map: shared by public kitchen detail, console identity, and menu ordering previews.

const props = withDefaults(
  defineProps<{
    zones?: KitchenDeliveryZone[]
    center?: { lat: number; lng: number }
    canEdit?: boolean
    editableMode?: 'radius' | 'postal_codes' | 'polygon' | ''
    editableZoneIndex?: number | null
  }>(),
  {
    zones: () => [],
    center: () => ({ lat: 46.7004, lng: 7.8922 }),
    canEdit: false,
    editableMode: '',
    editableZoneIndex: null,
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
      zoom: 11,
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
      const resolvedCount = Object.keys(zoneColorsByPlaceId.value).length
      if (resolvedCount) {
        featureLayer.style = stylePostalCodeFeature
      }
    }
    fitDeliveryZoneBounds(map, bounds, hasBounds, mapPadding)

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

onBeforeUnmount(() => {
  isMounted.value = false
  mapClickListener.value?.remove()
  mapClickListener.value = null
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
  aspect-ratio: 16 / 8;
  max-height: 20rem;
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
