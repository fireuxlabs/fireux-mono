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
      class="delivery-zones-map__key-mobile"
      aria-label="Delivery fees"
    >
      <p class="delivery-zones-map__key-note">
        Amounts in CHF
      </p>

      <div
        v-for="zone in deliveryZoneRows"
        :key="zone.id"
        class="delivery-zones-map__key-row"
      >
        <span class="delivery-zones-map__key-zone">
          <i
            :style="{ '--zone-color': zone.color }"
            aria-hidden="true"
          />
          {{ zone.label }}
        </span>

        <span class="delivery-zones-map__key-price">
          Min {{ zone.minimum }} · Fee {{ zone.fee }}
        </span>
      </div>
    </div>

    <UTable
      :data="deliveryZoneRows"
      :columns="deliveryZoneColumns"
      class="delivery-zones-map__key delivery-zones-map__key--table"
      aria-label="Delivery fees"
    >
      <template #label-cell="{ row }">
        <span class="delivery-zones-map__key-zone">
          <i
            :style="{ '--zone-color': row.original.color }"
            aria-hidden="true"
          />
          {{ row.original.label }}
        </span>
      </template>
    </UTable>
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
const deliveryZoneColumns = [
  {
    accessorKey: 'label',
    header: 'Zone',
  },
  {
    accessorKey: 'minimum',
    header: 'Minimum order (CHF)',
  },
  {
    accessorKey: 'fee',
    header: 'Fee (CHF)',
  },
]
const deliveryZoneRows = computed(() =>
  deliveryZones.value.map((zone, index) => ({
    id: String(zone.id || zone.label || `zone-${index + 1}`),
    label: zone.label || `Zone ${index + 1}`,
    minimum: amount(Number(zone.min_order_chf || 0)),
    fee: amount(Number(zone.fee_chf || 0)),
    color: zone.color || '#ff7a32',
  }))
)
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

function amount(value: number) {
  return new Intl.NumberFormat('de-CH', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(Math.max(0, value))
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

.delivery-zones-map__key-mobile {
  display: grid;
  gap: 0.5rem;
}

.delivery-zones-map__key-note {
  margin: 0;
  color: color-mix(in srgb, var(--menu-text, var(--ui-text)) 62%, var(--menu-bg, var(--ui-bg)));
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.delivery-zones-map__key-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.7rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.46rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--menu-text, var(--ui-text)) 10%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 82%, transparent);
  color: var(--menu-text, var(--ui-text));
  font-weight: 900;
}

.delivery-zones-map__key-price {
  color: color-mix(in srgb, var(--menu-text, var(--ui-text)) 72%, var(--menu-bg, var(--ui-bg)));
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  font-weight: 850;
  white-space: nowrap;
}

.delivery-zones-map__key--table {
  display: none;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--menu-text, var(--ui-text)) 10%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 82%, transparent);
  color: var(--menu-text, var(--ui-text));
}

.delivery-zones-map__key--table :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.delivery-zones-map__key--table :deep(th) {
  background: color-mix(in srgb, var(--menu-text, var(--ui-text)) 8%, transparent);
  color: color-mix(in srgb, var(--menu-text, var(--ui-text)) 70%, var(--menu-bg, var(--ui-bg)));
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.delivery-zones-map__key--table :deep(th),
.delivery-zones-map__key--table :deep(td) {
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text, var(--ui-text)) 8%, transparent);
  font-size: 0.8rem;
  font-weight: 850;
  text-align: left;
  vertical-align: middle;
}

.delivery-zones-map__key--table :deep(tbody tr:last-child td) {
  border-bottom: 0;
}

.delivery-zones-map__key--table :deep(th:nth-child(2)),
.delivery-zones-map__key--table :deep(th:nth-child(3)),
.delivery-zones-map__key--table :deep(td:nth-child(2)),
.delivery-zones-map__key--table :deep(td:nth-child(3)) {
  text-align: center;
  white-space: nowrap;
}

.delivery-zones-map__key--table :deep(td:nth-child(2)),
.delivery-zones-map__key--table :deep(td:nth-child(3)) {
  font-variant-numeric: tabular-nums;
}

.delivery-zones-map__key-zone {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
}

.delivery-zones-map__key-zone i {
  flex: 0 0 auto;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
  background: var(--zone-color);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--menu-text, var(--ui-text)) 16%, transparent);
}

@media (min-width: 640px) {
  .delivery-zones-map__key-mobile {
    display: none;
  }

  .delivery-zones-map__key--table {
    display: block;
  }
}
</style>
