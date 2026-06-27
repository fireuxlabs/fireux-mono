<template>
  <UCollapsible default-open>
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-truck"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Delivery</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Kitchen-level delivery zones used by menus that accept delivery
            orders.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <UCard class="mt-4">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-truck"
                class="mt-1 size-5 shrink-0 text-muted"
              />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Delivery
                </div>
                <p class="text-sm text-dimmed">
                  Kitchen-level delivery zones used by menus that accept
                  delivery orders.
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

          <!-- Reuse the public fulfilment map so console and customer routes show the same delivery truth. -->
          <KitchenFulfilmentDeliveryZonesMap
            v-if="mapZones.length"
            class="delivery-zone-map-preview"
            :zones="mapZones"
          />

          <ConsoleKitchenIdentitySectionsDeliveryZones
            v-if="hasPolygonZones"
            :zones="mapZones"
            :selected-index="activeZoneIndex"
            :can-write="canWrite"
            @select-zone="setActiveZoneIndex"
            @update:polygon="setActivePolygon"
          />

          <div
            v-for="(zone, index) in zones"
            :key="zone.key"
            class="delivery-zone-panel"
            :style="zoneCardStyle(Number(index))"
          >
            <div class="delivery-zone-panel__header">
              <div class="delivery-zone-panel__name">
                <UInput
                  v-model="zone.label"
                  :disabled="!canWrite"
                  :placeholder="zonePlaceholder(index)"
                />
              </div>

              <div class="delivery-zone-panel__actions">
                <UButton
                  v-if="zone.boundary_type === 'polygon'"
                  color="primary"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-map"
                  aria-label="Edit boundary"
                  :disabled="!canWrite"
                  @click="setActiveZoneIndex(index)"
                />

                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-trash-2"
                  aria-label="Remove zone"
                  :disabled="!canWrite"
                  @click="removeZone(index)"
                />
              </div>
            </div>

            <div class="delivery-zone-row">
              <UFormField class="delivery-zone-row__money" label="Minimum">
                <UInput
                  v-model="zone.min_order_chf"
                  type="number"
                  min="0"
                  step="0.5"
                  :disabled="!canWrite"
                />
              </UFormField>

              <UFormField class="delivery-zone-row__money" label="Fee">
                <UInput
                  v-model="zone.fee_chf"
                  type="number"
                  min="0"
                  step="0.5"
                  :disabled="!canWrite"
                />
              </UFormField>

              <UFormField label="Boundary">
                <URadioGroup
                  v-model="zone.boundary_type"
                  :items="boundaryTypeOptions"
                  :disabled="!canWrite"
                />
              </UFormField>

              <UFormField
                v-if="zone.boundary_type === 'postal_codes'"
                class="delivery-zone-row__boundary"
                label="Postcode(s)"
              >
                <UInput
                  v-model="zone.postal_codes"
                  :disabled="!canWrite"
                  placeholder="3852, 3800"
                />
              </UFormField>

              <UFormField
                v-else
                class="delivery-zone-row__boundary"
                label="Polygon points"
              >
                <UTextarea
                  v-model="zone.polygon"
                  :rows="2"
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
              :disabled="!canWrite || zones.length >= maxZones"
              @click="addZone"
            >
              {{ zones.length >= maxZones ? '4 zones max' : 'Add zone' }}
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
  </UCollapsible>
</template>

<script setup lang="ts">
import type { RadioGroupItem } from '@nuxt/ui'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { computed, ref, watch } from 'vue'
import { useKitchenUpdate } from '../../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type {
  KitchenDeliveryZone,
  KitchenFulfilmentConfig,
  KitchenUpdateInput,
} from '../../../../../../models/kitchen.model'
import { readKitchenFulfilmentConfig } from '../../../../../../utils/kitchen-spine'

type BoundaryType = 'postal_codes' | 'polygon'

type EditableZone = {
  key: string
  label: string
  min_order_chf: string
  fee_chf: string
  boundary_type: BoundaryType
  postal_codes: string
  polygon: string
}

const zoneColors = ['#ff7a32', '#f4b41a', '#2fb7a0', '#39bfe3']
const maxZones = 4
const boundaryTypeOptions = [
  { label: 'Postcode(s)', value: 'postal_codes' },
  { label: 'Polygon', value: 'polygon' },
] satisfies RadioGroupItem[]

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
const deliveryZones = computed<KitchenDeliveryZone[]>(
  () => fulfilment.value.delivery_zones
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
  (zone.polygon || []).map((point) => `${point.lat}, ${point.lng}`).join('\n')
const parsePolygon = (value: string) =>
  value
    .split('\n')
    .map((row) => {
      const [latRaw, lngRaw] = row.split(',').map((entry) => entry.trim())
      const lat = Number(latRaw)
      const lng = Number(lngRaw)

      return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    })
    .filter((point): point is { lat: number; lng: number } => Boolean(point))
const polygonInput = (points: { lat: number; lng: number }[]) =>
  points
    .map(
      (point) => `${roundCoordinate(point.lat)}, ${roundCoordinate(point.lng)}`
    )
    .join('\n')
const editableZone = (
  zone: KitchenDeliveryZone,
  index: number
): EditableZone => ({
  key: `${zone.id || 'zone'}-${index}-${Date.now()}`,
  label: text(zone.label),
  min_order_chf: numberText(zone.min_order_chf),
  fee_chf: numberText(zone.fee_chf),
  boundary_type: zone.polygon?.length ? 'polygon' : 'postal_codes',
  postal_codes: (zone.postal_codes || []).join(', '),
  polygon: polygonText(zone),
})
const zonePlaceholder = (index: string | number) => `Zone ${Number(index) + 1}`
const zoneId = (zone: EditableZone, index: number) =>
  normalizeSlug(text(zone.label), { maxLength: 80 }) ||
  `delivery-zone-${index + 1}`
const zoneColor = (index: number) => zoneColors[index % zoneColors.length]
const zoneCardStyle = (index: number): Record<string, string> => {
  const color = zoneColor(index)

  return {
    '--delivery-zone-color': color,
    borderColor: color,
    boxShadow: `inset 0.35rem 0 0 ${color}`,
  }
}
const mapZone = (zone: EditableZone, index: number): KitchenDeliveryZone => ({
  id: zoneId(zone, index),
  label: text(zone.label) || `Delivery zone ${index + 1}`,
  min_order_chf: numberValue(zone.min_order_chf) || 0,
  fee_chf: numberValue(zone.fee_chf) || 0,
  ...(zone.boundary_type === 'postal_codes'
    ? { postal_codes: compactList(zone.postal_codes) }
    : { polygon: parsePolygon(zone.polygon) }),
  color: zoneColor(index),
})
const hasPolygonZones = computed(() =>
  zones.value.some((zone: EditableZone) => zone.boundary_type === 'polygon')
)
const mapZones = computed<KitchenDeliveryZone[]>(() =>
  zones.value.map((zone: EditableZone, index: number) => mapZone(zone, index))
)
const normalizedZone = (
  zone: EditableZone,
  index: number
): KitchenDeliveryZone | null => {
  const label = text(zone.label)
  if (!label) return null

  const postalCodes = compactList(zone.postal_codes)
  const polygon = parsePolygon(zone.polygon)
  const minOrder = numberValue(zone.min_order_chf)
  const fee = numberValue(zone.fee_chf)

  return {
    id: zoneId(zone, index),
    label,
    ...(minOrder !== undefined ? { min_order_chf: minOrder } : {}),
    ...(fee !== undefined ? { fee_chf: fee } : {}),
    ...(zone.boundary_type === 'postal_codes' && postalCodes.length
      ? { postal_codes: postalCodes }
      : {}),
    ...(zone.boundary_type === 'polygon' && polygon.length ? { polygon } : {}),
    color: zoneColor(index),
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
  if (zones.value.length >= maxZones) return
  const index = zones.value.length + 1

  zones.value.push({
    key: `new-zone-${index}-${Date.now()}`,
    label: `Delivery zone ${index}`,
    min_order_chf: '0',
    fee_chf: '0',
    boundary_type: 'postal_codes',
    postal_codes: '',
    polygon: '',
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

function setActivePolygon(points: { lat: number; lng: number }[]) {
  const activeZone = zones.value[activeZoneIndex.value]
  if (!activeZone) return
  activeZone.boundary_type = 'polygon'
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

<style scoped>
.delivery-zone-panel {
  display: grid;
  gap: 0.9rem;
  padding: 0.8rem;
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--delivery-zone-color) 14%, transparent),
      transparent 34%
    ),
    var(--ui-bg);
}

.delivery-zone-map-preview {
  max-width: min(42rem, 100%);
}

.delivery-zone-panel__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: space-between;
}

.delivery-zone-panel__name {
  flex: 1;
  min-width: min(16rem, 100%);
}

.delivery-zone-panel__actions {
  display: flex;
  gap: 0.25rem;
}

.delivery-zone-row {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .delivery-zone-row {
    grid-template-columns: repeat(2, minmax(5.5rem, 0.45fr)) minmax(
        9rem,
        0.65fr
      );
    align-items: end;
  }
}

@media (min-width: 1280px) {
  .delivery-zone-row {
    grid-template-columns:
      repeat(2, minmax(5rem, 0.34fr))
      minmax(9rem, 0.62fr)
      minmax(11rem, 1fr);
  }
}

.delivery-zone-row__boundary {
  min-width: 0;
}
</style>
