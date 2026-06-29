<template>
  <UCollapsible :default-open="false">
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

          </div>
        </template>

        <div class="space-y-4">
          <UPageCard
            v-if="!zones.length"
            title="Add your first delivery area"
            description="Choose a radius, postcode, or polygon below."
            variant="subtle"
          />

          <!-- Reuse the public fulfilment map so console and customer routes show the same delivery truth. -->
          <KitchenDetailDeliveryZonesMap
            v-if="mapZones.length"
            :key="mapPreviewKey"
            class="delivery-zone-map-preview"
            :zones="mapZones"
            :can-edit="canWrite"
            :editable-mode="activeBoundaryMode"
            :editable-zone-index="activeZoneIndex"
            @polygon-point="addPolygonPoint"
          />

          <div
            v-for="(zone, index) in zones"
            :key="zone.key"
            class="delivery-zone-panel"
            :class="{
              'delivery-zone-panel--active': activeZoneIndex === Number(index),
            }"
            :style="zoneCardStyle(Number(index))"
            @click="setActiveZoneIndex(index)"
            @focusin="setActiveZoneIndex(index)"
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
              <UFormField class="delivery-zone-row__money" label="Minimum order">
                <UInput
                  v-model="zone.min_order_chf"
                  type="number"
                  min="0"
                  step="0.5"
                  :disabled="!canWrite"
                />
              </UFormField>

              <span class="delivery-zone-row__plus">+</span>

              <UFormField class="delivery-zone-row__money" label="Fee">
                <UInput
                  v-model="zone.fee_chf"
                  type="number"
                  min="0"
                  step="0.5"
                  :disabled="!canWrite"
                />
              </UFormField>

              <UFormField label="Boundary type">
                <URadioGroup
                  v-model="zone.boundary_type"
                  :items="boundaryTypeOptions"
                  :disabled="!canWrite"
                />
              </UFormField>

              <UFormField
                v-if="zone.boundary_type === 'radius'"
                class="delivery-zone-row__boundary"
                label="Radius (m)"
              >
                <UInput
                  v-model="zone.radius_m"
                  type="number"
                  min="0"
                  step="100"
                  :disabled="!canWrite"
                  placeholder="1500"
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
                v-if="zone.boundary_type === 'polygon'"
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

type BoundaryType = 'radius' | 'postal_codes' | 'polygon'

type EditableZone = {
  key: string
  label: string
  min_order_chf: string
  fee_chf: string
  boundary_type: BoundaryType
  radius_m: string
  postal_codes: string
  polygon: string
}

const zoneColors = ['#ff7a32', '#f4b41a', '#2fb7a0', '#39bfe3']
const maxZones = 4
const boundaryTypeOptions = [
  { label: 'Radius', value: 'radius' },
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
const syncingSavedZones = ref(false)
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
const editableZone = (
  zone: KitchenDeliveryZone,
  index: number
): EditableZone => ({
  key: `${zone.id || 'zone'}-${index}-${Date.now()}`,
  label: text(zone.label),
  min_order_chf: numberText(zone.min_order_chf),
  fee_chf: numberText(zone.fee_chf),
  boundary_type: zoneBoundaryType(zone),
  radius_m: numberText(zone.radius_m),
  postal_codes: (zone.postal_codes || []).join(', '),
  polygon: polygonText(zone),
})
const zoneBoundaryType = (zone: KitchenDeliveryZone): BoundaryType => {
  if (Number(zone.radius_m || 0) > 0) return 'radius'
  if (zone.polygon?.length) return 'polygon'

  return 'postal_codes'
}
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
  label: text(zone.label) || `Zone ${index + 1}`,
  min_order_chf: numberValue(zone.min_order_chf) || 0,
  fee_chf: numberValue(zone.fee_chf) || 0,
  ...(zone.boundary_type === 'radius'
    ? { radius_m: numberValue(zone.radius_m) || 0 }
    : {}),
  ...(zone.boundary_type === 'postal_codes'
    ? { postal_codes: compactList(zone.postal_codes) }
    : {}),
  ...(zone.boundary_type === 'polygon'
    ? { polygon: parsePolygon(zone.polygon) }
    : {}),
  color: zoneColor(index),
})
const mapZones = computed<KitchenDeliveryZone[]>(() =>
  zones.value.map((zone: EditableZone, index: number) => mapZone(zone, index))
)
const activeZone = computed(() => zones.value[activeZoneIndex.value] || null)
const activeBoundaryMode = computed(() => activeZone.value?.boundary_type || '')
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
const normalizedZone = (
  zone: EditableZone,
  index: number
): KitchenDeliveryZone | null => {
  const label = text(zone.label)
  if (!label) return null

  const postalCodes = compactList(zone.postal_codes)
  const polygon = parsePolygon(zone.polygon)
  const radius = numberValue(zone.radius_m)
  const minOrder = numberValue(zone.min_order_chf)
  const fee = numberValue(zone.fee_chf)

  return {
    id: zoneId(zone, index),
    label,
    ...(minOrder !== undefined ? { min_order_chf: minOrder } : {}),
    ...(fee !== undefined ? { fee_chf: fee } : {}),
    ...(zone.boundary_type === 'radius' && radius !== undefined
      ? { radius_m: radius }
      : {}),
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
  zone.polygon = points.map((point) => `${point.lat}, ${point.lng}`).join('\n')
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
      description: error instanceof Error ? error.message : 'Please try again.',
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
      description: error instanceof Error ? error.message : 'Please try again.',
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

.delivery-zone-panel--active {
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--delivery-zone-color) 24%, transparent),
      transparent 38%
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

.delivery-zone-row__plus {
  display: none;
  color: var(--ui-text-dimmed);
  font-weight: 900;
  line-height: 2.35rem;
}

@media (min-width: 768px) {
  .delivery-zone-row {
    grid-template-columns:
      minmax(5.5rem, 0.4fr)
      auto
      minmax(5.5rem, 0.4fr)
      minmax(9rem, 0.7fr);
    align-items: end;
  }

  .delivery-zone-row__plus {
    display: block;
  }
}

@media (min-width: 1280px) {
  .delivery-zone-row {
    grid-template-columns:
      minmax(5rem, 0.3fr)
      auto
      minmax(5rem, 0.3fr)
      minmax(9rem, 0.55fr)
      minmax(11rem, 1fr);
  }
}

.delivery-zone-row__boundary {
  min-width: 0;
}
</style>
