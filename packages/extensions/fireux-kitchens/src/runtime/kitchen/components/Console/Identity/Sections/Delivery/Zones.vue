<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-highlighted">
            Delivery boundary editor
          </div>
          <p class="text-sm text-dimmed">
            Select a zone, then click the real map to add boundary points.
          </p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ activeZone?.label || 'No zone selected' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="(zone, index) in zones"
          :key="zone.id || zone.label || index"
          size="xs"
          :color="index === selectedIndex ? 'primary' : 'neutral'"
          :variant="index === selectedIndex ? 'solid' : 'soft'"
          @click="emit('select-zone', index)"
        >
          {{ zone.label || `Zone ${index + 1}` }}
        </UButton>
      </div>

      <div class="delivery-zone-map-editor">
        <div
          ref="mapEl"
          class="delivery-zone-map-editor__google"
        />

        <p
          v-if="mapMessage"
          class="delivery-zone-map-editor__message"
        >
          {{ mapMessage }}
        </p>

        <p
          v-if="mapError"
          class="delivery-zone-map-editor__error"
        >
          {{ mapError }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="m-0 text-xs text-dimmed">
          {{ pointCount }} point{{ pointCount === 1 ? '' : 's' }} in this boundary.
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-lucide-undo-2"
            :disabled="!canWrite || !pointCount"
            @click="undoPoint"
          >
            Undo point
          </UButton>

          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            :disabled="!canWrite || !pointCount"
            @click="clearPolygon"
          >
            Clear boundary
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGoogleMaps } from 'fireux-places/runtime/composables/fireux/places/useGoogleMaps'
import type { KitchenDeliveryZone } from '../../../../../models/kitchen.model.ts'

type LatLngPoint = { lat: number, lng: number }

const props = withDefaults(
  defineProps<{
    zones?: KitchenDeliveryZone[]
    selectedIndex?: number
    canWrite?: boolean
  }>(),
  {
    zones: () => [],
    selectedIndex: 0,
    canWrite: false,
  }
)

const emit = defineEmits<{
  (event: 'select-zone', index: number): void
  (event: 'update:polygon', points: LatLngPoint[]): void
}>()

const googleMapsRuntime = useGoogleMaps()
const mapEl = ref<HTMLElement | null>(null)
const mapMessage = ref('Loading delivery map...')
const mapError = ref('')
const isMounted = ref(false)
const map = ref<any>(null)
const googleMaps = ref<any>(null)
const mapClickListener = ref<any>(null)
const polygonLayers = ref<any[]>([])
const markers = ref<any[]>([])
const activeZone = computed(() => props.zones[props.selectedIndex] || null)
const activePolygon = computed<LatLngPoint[]>(() => activeZone.value?.polygon || [])
const pointCount = computed(() => activePolygon.value.length)

onMounted(async () => {
  isMounted.value = true
  if (!mapEl.value) return
  if (!googleMapsRuntime.apiKey.value || !googleMapsRuntime.mapId.value) {
    mapMessage.value = ''
    mapError.value = 'Google Maps key or Map ID is missing.'
    return
  }

  try {
    await googleMapsRuntime.load()

    const google = googleMapsRuntime.read()
    await google.maps.importLibrary('maps')
    googleMaps.value = google
    map.value = new google.maps.Map(mapEl.value, {
      center: { lat: 46.7004, lng: 7.8922 },
      zoom: 11,
      mapId: googleMapsRuntime.mapId.value,
      fullscreenControl: false,
      mapTypeControl: false,
      streetViewControl: false,
    })
    mapClickListener.value = map.value.addListener('click', addPointFromMap)
    renderMap()
    if (isMounted.value) mapMessage.value = ''
  } catch (error) {
    if (!isMounted.value) return
    mapMessage.value = ''
    mapError.value = error instanceof Error
      ? error.message
      : 'Google Maps could not load.'
  }
})

watch(
  () => [props.zones, props.selectedIndex],
  () => renderMap(),
  { deep: true }
)

onBeforeUnmount(() => {
  isMounted.value = false
  clearMapObjects()
  mapClickListener.value?.remove?.()
})

function addPointFromMap(event: any) {
  if (!props.canWrite || !activeZone.value) return
  const latLng = event.latLng
  if (!latLng) return

  emit('update:polygon', [
    ...activePolygon.value,
    {
      lat: roundCoordinate(latLng.lat()),
      lng: roundCoordinate(latLng.lng()),
    },
  ])
}

function undoPoint() {
  emit('update:polygon', activePolygon.value.slice(0, -1))
}

function clearPolygon() {
  emit('update:polygon', [])
}

function renderMap() {
  const google = googleMaps.value
  const targetMap = map.value
  if (!google || !targetMap) return

  clearMapObjects()
  props.zones.forEach((zone, index) => {
    renderZonePolygon(google, targetMap, zone, index === props.selectedIndex)
  })
  renderActiveMarkers(google, targetMap)
}

function renderZonePolygon(
  google: any,
  targetMap: any,
  zone: KitchenDeliveryZone,
  active: boolean
) {
  if (!Array.isArray(zone.polygon) || zone.polygon.length < 2) return
  const color = zone.color || '#ff7a32'
  const layer = new google.maps.Polygon({
    paths: zone.polygon,
    fillColor: color,
    fillOpacity: active ? 0.38 : 0.16,
    strokeColor: color,
    strokeOpacity: active ? 1 : 0.55,
    strokeWeight: active ? 3 : 1,
    map: targetMap,
  })
  polygonLayers.value.push(layer)
}

function renderActiveMarkers(google: any, targetMap: any) {
  activePolygon.value.forEach((point, index) => {
    const marker = new google.maps.Marker({
      position: point,
      map: targetMap,
      draggable: props.canWrite,
      label: String(index + 1),
    })

    marker.addListener('dragend', (event: any) => {
      const latLng = event.latLng
      if (!latLng) return
      const nextPoints = [...activePolygon.value]
      nextPoints[index] = {
        lat: roundCoordinate(latLng.lat()),
        lng: roundCoordinate(latLng.lng()),
      }
      emit('update:polygon', nextPoints)
    })

    markers.value.push(marker)
  })
}

function clearMapObjects() {
  polygonLayers.value.forEach((layer: any) => layer.setMap(null))
  markers.value.forEach((marker: any) => marker.setMap(null))
  polygonLayers.value = []
  markers.value = []
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}
</script>

<style scoped>
.delivery-zone-map-editor {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 1;
  min-height: 9rem;
  max-height: 11rem;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-muted);
}

.delivery-zone-map-editor__google {
  width: 100%;
  height: 100%;
}

.delivery-zone-map-editor__message,
.delivery-zone-map-editor__error {
  position: absolute;
  inset: auto 1rem 1rem 1rem;
  z-index: 1;
  margin: 0;
  padding: 0.6rem calc(var(--spacing) * 3);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 88%, transparent);
  color: var(--ui-text);
  font-size: 0.8rem;
  font-weight: var(--font-weight-extrabold);
}

.delivery-zone-map-editor__error {
  color: var(--ui-error);
}
</style>
