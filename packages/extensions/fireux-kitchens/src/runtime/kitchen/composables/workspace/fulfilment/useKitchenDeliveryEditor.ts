import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenWorkspaceIdentity } from '../useKitchenWorkspaceIdentity'
import type {
  KitchenFulfilment,
  KitchenDeliveryZone,
} from '../../../models/fulfilment.model.ts'
import type { RadioGroupItem } from '@nuxt/ui'
import { useDeliveryZoneAutosave } from './useDeliveryZoneAutosave'
import { computed, ref, watch } from 'vue'
import { useKitchenFulfilmentUpdate } from '../../fulfilment/useKitchenFulfilmentUpdate'
import {
  compactList,
  editableZone,
  mapZone,
  normalizedZone,
  numberText,
  numberValue,
  parsePolygon,
  polygonText,
  text,
  zoneBoundaryType,
  zoneCardStyle,
  zoneColor,
  zoneColors,
  zoneId,
  zonePlaceholder,
  type EditableZone,
} from '../../../utils/delivery-zones'

export function useKitchenDeliveryEditor(props: {
  fulfilment: KitchenFulfilment
  kitchenId: string
  canWrite: boolean
}) {
  const maxZones = 4

  const boundaryTypeOptions = [
    { label: 'Radius', value: 'radius' },
    { label: 'Postcode(s)', value: 'postal_codes' },
    { label: 'Polygon', value: 'polygon' },
  ] satisfies RadioGroupItem[]

  const { updateKitchenFulfilment, captureIntent: captureCommand } =
    useKitchenFulfilmentUpdate()
  const captureSurface = useCommandScope([
    () => props.kitchenId,
    () => props.canWrite,
  ])
  const captureIntent = () => {
    const command = captureCommand(),
      surface = captureSurface()
    return () => command() && surface()
  }

  const { place, currencyCode } = useKitchenWorkspaceIdentity()

  const zones = ref<EditableZone[]>([])

  const activeZoneIndex = ref(0)

  const syncingSavedZones = ref(false)

  const {
    saving,
    error: saveError,
    status: saveState,
  } = useDeliveryZoneAutosave({
    zones,
    syncing: syncingSavedZones,
    kitchenId: () => props.kitchenId,
    canWrite: () => props.canWrite,
    captureIntent,
    update: (delivery_zones) =>
      updateKitchenFulfilment({
        kitchenId: props.kitchenId,
        changes: { delivery_zones },
      }),
  })

  const fulfilment = computed(() => props.fulfilment)

  const deliveryZones = computed<KitchenDeliveryZone[]>(
    () => fulfilment.value.delivery_zones
  )

  const paymentMethods = computed(() => fulfilment.value.payment_methods || [])

  const deliveryCenter = computed(() => {
    const lat = Number(place.value?.lat)
    const lng = Number(place.value?.lng)

    return Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : undefined
  })

  const mapZones = computed<KitchenDeliveryZone[]>(() =>
    zones.value.map((zone: EditableZone, index: number) => mapZone(zone, index))
  )

  const activeZone = computed(() => zones.value[activeZoneIndex.value] || null)

  const activeBoundaryMode = computed(
    () => activeZone.value?.boundary_type || ''
  )

  const mapPreviewKey = computed(() =>
    [
      activeZoneIndex.value,
      activeBoundaryMode.value,
      mapZones.value
        .map((zone) =>
          [
            zone.id,
            zone.color,
            zone.min_order_chf,
            zone.fee_chf,
            zone.radius_m,
            (zone.postal_codes || []).join(','),
            (zone.polygon || [])
              .map((point) => `${point.lat},${point.lng}`)
              .join(';'),
          ].join(':')
        )
        .join('|'),
    ].join('::')
  )

  watch(
    deliveryZones,
    (nextDeliveryZones: KitchenDeliveryZone[]) => {
      if (saving.value) return
      syncingSavedZones.value = true
      zones.value = nextDeliveryZones.map(editableZone)
      activeZoneIndex.value = 0
      saveState.value = ''
      queueMicrotask(() => {
        syncingSavedZones.value = false
      })
    },
    { immediate: true }
  )

  watch(
    zones,
    () => {
      if (activeZoneIndex.value >= zones.value.length) {
        activeZoneIndex.value = Math.max(zones.value.length - 1, 0)
      }
    },
    { deep: true }
  )

  function addZone() {
    if (zones.value.length >= maxZones) return
    const index = zones.value.length + 1

    zones.value.push({
      key: `new-zone-${index}-${Date.now()}`,
      label: `Zone ${index}`,
      min_order_chf: '0',
      fee_chf: '0',
      boundary_type: 'radius',
      radius_m: '1500',
      postal_codes: '',
      polygon: '',
    })
    activeZoneIndex.value = zones.value.length - 1
  }

  function setActiveZoneIndex(index: string | number) {
    const targetIndex = Number(index)
    if (!Number.isInteger(targetIndex) || targetIndex < 0) return
    if (targetIndex >= zones.value.length) return

    activeZoneIndex.value = targetIndex
  }

  function addPolygonPoint(payload: {
    zoneIndex: number
    point: { lat: number; lng: number }
  }) {
    if (!props.canWrite) return
    const zone = zones.value[payload.zoneIndex]
    if (!zone) return

    zone.boundary_type = 'polygon'
    const points = [...parsePolygon(zone.polygon), payload.point]
    zone.polygon = points
      .map((point) => `${point.lat}, ${point.lng}`)
      .join('\n')
  }

  async function removeZone(index: string | number) {
    if (!props.canWrite) return
    const targetIndex = Number(index)
    if (!Number.isInteger(targetIndex) || targetIndex < 0) return
    if (targetIndex >= zones.value.length) return

    zones.value.splice(targetIndex, 1)
  }

  return {
    zoneColors,
    maxZones,
    boundaryTypeOptions,
    updateKitchenFulfilment,
    place,
    currencyCode,
    zones,
    activeZoneIndex,
    saving,
    saveState,
    saveError,
    syncingSavedZones,
    fulfilment,
    deliveryZones,
    paymentMethods,
    deliveryCenter,
    text,
    numberText,
    numberValue,
    compactList,
    polygonText,
    parsePolygon,
    editableZone,
    zoneBoundaryType,
    zonePlaceholder,
    zoneId,
    zoneColor,
    zoneCardStyle,
    mapZone,
    mapZones,
    activeZone,
    activeBoundaryMode,
    mapPreviewKey,
    normalizedZone,
    addZone,
    setActiveZoneIndex,
    addPolygonPoint,
    removeZone,
  }
}
