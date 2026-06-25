<template>
  <div class="menu-order-funnel">
    <p v-if="message" class="menu-order-funnel__message">
      {{ message }}
    </p>

    <div v-if="deliveryZones.length" class="menu-order-funnel__zones">
      <article
        v-for="zone in deliveryZones"
        :key="zone.id"
        class="menu-order-funnel__zone"
      >
        <strong>{{ zone.label }}</strong>
        <span>{{ zoneSummary(zone) }}</span>
      </article>
    </div>

    <MenuOrderFunnelPayment :methods="paymentMethods" />

    <MenuOrderFunnelFields
      :model-value="modelValue"
      address
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
} from '../../../../models/menu/menu.model'
import type { KitchenOrderCustomer } from '../../../../models/order.model'

const props = withDefaults(
  defineProps<{
    modelValue: KitchenOrderCustomer
    policy?: MenuOrderTypeConfig
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'update:modelValue', value: KitchenOrderCustomer): void
}>()

const fulfilment = computed(() => props.policy?.fulfilment || {})
const deliveryZones = computed(() =>
  Array.isArray(fulfilment.value.delivery_zones)
    ? fulfilment.value.delivery_zones
    : []
)
const paymentMethods = computed(() =>
  Array.isArray(fulfilment.value.payment_methods)
    ? fulfilment.value.payment_methods
    : []
)
const message = computed(() => props.policy?.message || '')

function money(value: number | undefined) {
  const amount = Number(value ?? 0)

  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(Number.isFinite(amount) ? amount : 0)
}

function zoneSummary(zone: MenuDeliveryZone) {
  return `Min ${money(zone.min_order_chf)} · Fee ${money(zone.fee_chf)}`
}
</script>

<style scoped>
.menu-order-funnel {
  display: grid;
  gap: 1rem;
}

.menu-order-funnel__message {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}

.menu-order-funnel__zones {
  display: grid;
  gap: 0.55rem;
}

.menu-order-funnel__zone {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  color: var(--menu-muted);
  font-size: 0.88rem;
}

.menu-order-funnel__zone strong {
  color: var(--menu-title);
  font-weight: 850;
}
</style>
