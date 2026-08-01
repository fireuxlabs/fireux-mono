// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: use linked Place currency and coordinates for Kitchen delivery configuration.
import type { RadioGroupItem } from '@nuxt/ui'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useKitchenUpdate } from '../../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenDeliveryZone, KitchenFulfilmentConfig, KitchenUpdateInput } from '../../../../../../models/kitchen.model'
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
} from './kitchen-delivery-zones'
import { readKitchenFulfilmentConfig } from '../../../../../../utils/kitchen-spine'
import { useKitchenConsolePlace } from '../../../../../../composables/fireux/console/kitchen/identity/useKitchenConsolePlace'

export function useKitchenDeliveryEditor(props: {
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}) {
  

  

  

  const maxZones = 4

  const boundaryTypeOptions = [
    { label: 'Radius', value: 'radius' },
    { label: 'Postcode(s)', value: 'postal_codes' },
    { label: 'Polygon', value: 'polygon' },
  ] satisfies RadioGroupItem[]

  const collectionPath = computed(() => props.collectionPath)

  const { updateKitchen } = useKitchenUpdate({ collectionPath })

  const { place, currencyCode } = useKitchenConsolePlace()

  const toast = useToastify()

  const zones = ref<EditableZone[]>([])

  const activeZoneIndex = ref(0)

  const saving = ref(false)

  const saveState = ref('')

  const syncingSavedZones = ref(false)

  const fulfilment = computed(() => readKitchenFulfilmentConfig(props.kitchen))

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
      if (!syncingSavedZones.value && !saving.value) {
        saveState.value = 'Unsaved changes'
      }
    },
    { deep: true }
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

    saving.value = true
    saveState.value = 'Removing...'
    zones.value.splice(targetIndex, 1)
    try {
      await persistDeliveryZones('Delivery zone removed')
    } catch (error) {
      saveState.value = 'Remove failed'
      toast.add({
        title: 'Could not remove delivery zone',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
      throw error
    } finally {
      saving.value = false
    }
  }

  async function save() {
    if (!props.canWrite) return

    saving.value = true
    saveState.value = 'Saving...'
    try {
      await persistDeliveryZones('Delivery zones updated')
    } catch (error) {
      saveState.value = 'Save failed'
      toast.add({
        title: 'Could not update delivery zones',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
      throw error
    } finally {
      saving.value = false
    }
  }

  async function persistDeliveryZones(successTitle: string) {
    const kitchenId = text(props.kitchenId)
    if (!kitchenId) throw new Error('No kitchen selected.')

    const nextDeliveryZones: KitchenDeliveryZone[] = []
    for (const [index, zone] of zones.value.entries()) {
      const nextZone = normalizedZone(zone, index)
      if (nextZone) nextDeliveryZones.push(nextZone)
    }
    const nextFulfilment: KitchenFulfilmentConfig = {
      delivery_zones: nextDeliveryZones,
      payment_methods: paymentMethods.value,
    }
    const patch: KitchenUpdateInput = {
      fulfilment: nextFulfilment,
    }

    await updateKitchen(kitchenId, patch)
    saveState.value = 'Saved'
    toast.add({
      title: successTitle,
      icon: 'i-lucide-check-circle',
    })
  }

  return {
    zoneColors,
    maxZones,
    boundaryTypeOptions,
    collectionPath,
    updateKitchen,
    place,
    currencyCode,
    toast,
    zones,
    activeZoneIndex,
    saving,
    saveState,
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
    save,
    persistDeliveryZones,
  }
}
