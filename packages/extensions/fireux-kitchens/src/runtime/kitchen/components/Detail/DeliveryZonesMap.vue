<template>
  <section class="delivery-zones-map" aria-label="Delivery area map">
    <DeliveryCoverageMap
      :zones="deliveryZones"
      :center="center"
      :can-edit="canEdit"
      :editable-mode="editableMode"
      :editable-zone-index="editableZoneIndex"
      @polygon-point="$emit('polygon-point', $event)"
    />

    <div class="delivery-zones-map__key-mobile" aria-label="Delivery fees">
      <p class="delivery-zones-map__key-note">Amounts in {{ currencyLabel }}</p>

      <div
        v-for="zone in deliveryZoneRows"
        :key="zone.id"
        class="delivery-zones-map__key-row"
      >
        <span class="delivery-zones-map__key-zone">
          <i :style="{ '--zone-color': zone.color }" aria-hidden="true" />
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
import { computed } from 'vue'
import type { KitchenDeliveryZone } from '../../models/fulfilment.model.ts'

// Kitchen fulfilment wrapper: DeliveryCoverageMap owns map rendering; this file adds kitchen fee/minimum rows.

const props = withDefaults(
  defineProps<{
    zones?: KitchenDeliveryZone[]
    currencyCode: string
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

defineEmits<{
  (
    event: 'polygon-point',
    payload: { zoneIndex: number; point: { lat: number; lng: number } }
  ): void
}>()

const deliveryZones = computed(() => props.zones)
const currencyLabel = computed(() => props.currencyCode.trim().toUpperCase())
const deliveryZoneColumns = computed(() => [
  {
    accessorKey: 'label',
    header: 'Zone',
  },
  {
    accessorKey: 'minimum',
    header: `Minimum order (${currencyLabel.value})`,
  },
  {
    accessorKey: 'fee',
    header: `Fee (${currencyLabel.value})`,
  },
])
const deliveryZoneRows = computed(() =>
  deliveryZones.value.map((zone, index) => ({
    id: String(zone.id || zone.label || `zone-${index + 1}`),
    label: zone.label || `Zone ${index + 1}`,
    minimum: amount(Number(zone.min_order_chf || 0)),
    fee: amount(Number(zone.fee_chf || 0)),
    color: zone.color || '#ff7a32',
  }))
)
function amount(value: number) {
  return new Intl.NumberFormat('de-CH', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(Math.max(0, value))
}
</script>

<style scoped>
.delivery-zones-map {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.delivery-zones-map__key-mobile {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.delivery-zones-map__key-note {
  margin: 0;
  color: color-mix(
    in srgb,
    var(--menu-text, var(--ui-text)) 62%,
    var(--menu-bg, var(--ui-bg))
  );
  font-size: 0.66rem;
  font-weight: var(--font-weight-black);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.delivery-zones-map__key-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing) 0.7rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.46rem 0.6rem;
  border: 1px solid
    color-mix(in srgb, var(--menu-text, var(--ui-text)) 10%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 82%, transparent);
  color: var(--menu-text, var(--ui-text));
  font-weight: var(--font-weight-black);
}

.delivery-zones-map__key-price {
  color: color-mix(
    in srgb,
    var(--menu-text, var(--ui-text)) 72%,
    var(--menu-bg, var(--ui-bg))
  );
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-black);
  white-space: nowrap;
}

.delivery-zones-map__key--table {
  display: none;
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, var(--menu-text, var(--ui-text)) 10%, transparent);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--menu-bg, var(--ui-bg)) 82%, transparent);
  color: var(--menu-text, var(--ui-text));
}

.delivery-zones-map__key--table :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.delivery-zones-map__key--table :deep(th) {
  background: color-mix(
    in srgb,
    var(--menu-text, var(--ui-text)) 8%,
    transparent
  );
  color: color-mix(
    in srgb,
    var(--menu-text, var(--ui-text)) 70%,
    var(--menu-bg, var(--ui-bg))
  );
  font-size: 0.68rem;
  font-weight: var(--font-weight-black);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.delivery-zones-map__key--table :deep(th),
.delivery-zones-map__key--table :deep(td) {
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--menu-text, var(--ui-text)) 8%, transparent);
  font-size: 0.8rem;
  font-weight: var(--font-weight-black);
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
  gap: calc(var(--spacing) * 2);
  align-items: center;
  min-width: 0;
}

.delivery-zones-map__key-zone i {
  flex: 0 0 auto;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: var(--zone-color);
  box-shadow: 0 0 0 1px
    color-mix(in srgb, var(--menu-text, var(--ui-text)) 16%, transparent);
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
