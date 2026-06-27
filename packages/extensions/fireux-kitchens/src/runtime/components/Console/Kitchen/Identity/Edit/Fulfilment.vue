<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-truck" class="mt-1 size-5 shrink-0 text-muted" />
          <div>
            <div class="text-base font-semibold text-highlighted">
              Delivery fulfilment
            </div>
            <p class="text-sm text-dimmed">
              Kitchen-level delivery zones used by menus that accept delivery orders.
            </p>
          </div>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ zones.length }} zone{{ zones.length === 1 ? '' : 's' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <UPageCard
        v-if="!zones.length"
        title="No delivery zones"
        description="Add a zone before using delivery order checks."
        variant="subtle"
      />

      <ConsoleKitchenIdentityEditDeliveryZoneMap
        v-else
        :zones="mapZones"
        :selected-index="activeZoneIndex"
        :can-write="canWrite"
        @select-zone="setActiveZoneIndex"
        @update:polygon="setActivePolygon"
      />

      <div
        v-for="(zone, index) in zones"
        :key="zone.key"
        class="rounded-xl border border-default p-4"
      >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-highlighted">
              {{ zoneTitle(zone, index) }}
            </h3>
            <p class="text-xs text-dimmed">
              Minimum CHF {{ zone.min_order_chf || 0 }} · fee CHF {{ zone.fee_chf || 0 }}
            </p>
          </div>

          <UButton
            color="primary"
            variant="soft"
            size="xs"
            icon="i-lucide-map"
            :disabled="!canWrite"
            @click="setActiveZoneIndex(index)"
          >
            Edit boundary
          </UButton>

          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            icon="i-lucide-trash-2"
            :disabled="!canWrite"
            @click="removeZone(index)"
          >
            Remove
          </UButton>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <UFormField label="Zone id">
            <UInput
              v-model="zone.id"
              :disabled="!canWrite"
              placeholder="ringgenberg-goldswil"
            />
          </UFormField>

          <UFormField label="Label">
            <UInput
              v-model="zone.label"
              :disabled="!canWrite"
              placeholder="Ringgenberg & Goldswil"
            />
          </UFormField>

          <UFormField label="Minimum order">
            <UInput
              v-model="zone.min_order_chf"
              type="number"
              min="0"
              step="0.5"
              :disabled="!canWrite"
            />
          </UFormField>

          <UFormField label="Delivery fee">
            <UInput
              v-model="zone.fee_chf"
              type="number"
              min="0"
              step="0.5"
              :disabled="!canWrite"
            />
          </UFormField>

          <UFormField label="Colour">
            <UInput
              v-model="zone.color"
              :disabled="!canWrite"
              placeholder="#ff7a32"
            />
          </UFormField>

          <UFormField label="Postal codes">
            <UInput
              v-model="zone.postal_codes"
              :disabled="!canWrite"
              placeholder="3852, 3800"
            />
          </UFormField>

          <UFormField class="md:col-span-2" label="Polygon points">
            <UTextarea
              v-model="zone.polygon"
              :rows="4"
              :disabled="!canWrite"
              placeholder="46.765, 7.975"
            />
          </UFormField>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          :disabled="!canWrite"
          @click="addZone"
        >
          Add zone
        </UButton>

        <div class="flex items-center gap-2">
          <span v-if="saveState" class="text-xs text-dimmed">
            {{ saveState }}
          </span>

          <UButton
            color="primary"
            icon="i-lucide-save"
            :loading="saving"
            :disabled="!canWrite || saving"
            @click="save"
          >
            Save delivery zones
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type {
  KitchenDeliveryZone,
  KitchenFulfilmentConfig,
  KitchenUpdateInput,
} from '../../../../../models/kitchen.model'
import { readKitchenFulfilmentConfig } from '../../../../../utils/kitchen-spine'

type EditableZone = {
  key: string
  id: string
  label: string
  min_order_chf: string
  fee_chf: string
  postal_codes: string
  polygon: string
  color: string
}

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const collectionPath = computed(() => props.collectionPath)
const { updateKitchen } = useKitchenUpdate({ collectionPath })
const toast = useToastify()
const zones = ref<EditableZone[]>([])
const activeZoneIndex = ref(0)
const saving = ref(false)
const saveState = ref('')
const fulfilment = computed(() => readKitchenFulfilmentConfig(props.kitchen))
const deliveryZones = computed<KitchenDeliveryZone[]>(() =>
  fulfilment.value.delivery_zones
)
const paymentMethods = computed(() => fulfilment.value.payment_methods || [])

const text = (value: unknown) => String(value ?? '').trim()
const numberText = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? String(number) : ''
}
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) && number >= 0 ? number : undefined
}
const compactList = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
const polygonText = (zone: KitchenDeliveryZone) =>
  (zone.polygon || [])
    .map((point) => `${point.lat}, ${point.lng}`)
    .join('\n')
const parsePolygon = (value: string) =>
  value
    .split('\n')
    .map((row) => {
      const [latRaw, lngRaw] = row.split(',').map((entry) => entry.trim())
      const lat = Number(latRaw)
      const lng = Number(lngRaw)

      return Number.isFinite(lat) && Number.isFinite(lng)
        ? { lat, lng }
        : null
    })
    .filter((point): point is { lat: number, lng: number } => Boolean(point))
const polygonInput = (points: { lat: number, lng: number }[]) =>
  points
    .map((point) => `${roundCoordinate(point.lat)}, ${roundCoordinate(point.lng)}`)
    .join('\n')
const editableZone = (zone: KitchenDeliveryZone, index: number): EditableZone => ({
  key: `${zone.id || 'zone'}-${index}-${Date.now()}`,
  id: text(zone.id),
  label: text(zone.label),
  min_order_chf: numberText(zone.min_order_chf),
  fee_chf: numberText(zone.fee_chf),
  postal_codes: (zone.postal_codes || []).join(', '),
  polygon: polygonText(zone),
  color: text(zone.color),
})
const zoneTitle = (zone: EditableZone, index: string | number) =>
  zone.label || `Delivery zone ${Number(index) + 1}`
const mapZone = (zone: EditableZone, index: number): KitchenDeliveryZone => ({
  id: text(zone.id) || `delivery-zone-${index + 1}`,
  label: text(zone.label) || `Delivery zone ${index + 1}`,
  min_order_chf: numberValue(zone.min_order_chf) || 0,
  fee_chf: numberValue(zone.fee_chf) || 0,
  postal_codes: compactList(zone.postal_codes),
  polygon: parsePolygon(zone.polygon),
  color: text(zone.color) || '#ff7a32',
})
const mapZones = computed<KitchenDeliveryZone[]>(() =>
  zones.value.map((zone: EditableZone, index: number) => mapZone(zone, index))
)
const normalizedZone = (zone: EditableZone): KitchenDeliveryZone | null => {
  const id = text(zone.id)
  const label = text(zone.label)
  if (!id || !label) return null

  const postalCodes = compactList(zone.postal_codes)
  const polygon = parsePolygon(zone.polygon)
  const minOrder = numberValue(zone.min_order_chf)
  const fee = numberValue(zone.fee_chf)

  return {
    id,
    label,
    ...(minOrder !== undefined ? { min_order_chf: minOrder } : {}),
    ...(fee !== undefined ? { fee_chf: fee } : {}),
    ...(postalCodes.length ? { postal_codes: postalCodes } : {}),
    ...(polygon.length ? { polygon } : {}),
    ...(text(zone.color) ? { color: text(zone.color) } : {}),
  }
}

watch(
  deliveryZones,
  (nextDeliveryZones: KitchenDeliveryZone[]) => {
    zones.value = nextDeliveryZones.map(editableZone)
  },
  { immediate: true }
)

watch(
  zones,
  () => {
    if (activeZoneIndex.value < zones.value.length) return
    activeZoneIndex.value = Math.max(0, zones.value.length - 1)
  },
  { deep: true }
)

function addZone() {
  const index = zones.value.length + 1

  zones.value.push({
    key: `new-zone-${index}-${Date.now()}`,
    id: `delivery-zone-${index}`,
    label: `Delivery zone ${index}`,
    min_order_chf: '0',
    fee_chf: '0',
    postal_codes: '',
    polygon: '',
    color: '#ff7a32',
  })
}

function removeZone(index: string | number) {
  zones.value.splice(Number(index), 1)
}

function setActiveZoneIndex(index: string | number) {
  activeZoneIndex.value = Math.max(
    0,
    Math.min(Number(index), zones.value.length - 1)
  )
}

function setActivePolygon(points: { lat: number, lng: number }[]) {
  const activeZone = zones.value[activeZoneIndex.value]
  if (!activeZone) return
  activeZone.polygon = polygonInput(points)
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(6))
}

async function save() {
  if (!props.canWrite) return
  const kitchenId = text(props.kitchenId)
  if (!kitchenId) throw new Error('No kitchen selected.')

  const nextDeliveryZones: KitchenDeliveryZone[] = []
  for (const zone of zones.value) {
    const nextZone = normalizedZone(zone)
    if (nextZone) nextDeliveryZones.push(nextZone)
  }
  const nextFulfilment: KitchenFulfilmentConfig = {
    delivery_zones: nextDeliveryZones,
    payment_methods: paymentMethods.value,
  }
  const patch: KitchenUpdateInput = {
    fulfilment: nextFulfilment,
  }

  saving.value = true
  saveState.value = 'Saving...'
  try {
    await updateKitchen(kitchenId, patch)
    saveState.value = 'Saved'
    toast.add({
      title: 'Delivery zones updated',
      icon: 'i-lucide-check-circle',
    })
  } catch (error) {
    saveState.value = 'Save failed'
    toast.add({
      title: 'Could not update delivery zones',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  } finally {
    saving.value = false
  }
}
</script>
