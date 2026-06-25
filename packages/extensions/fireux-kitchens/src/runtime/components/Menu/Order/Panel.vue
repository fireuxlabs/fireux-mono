<template>
  <form
    class="menu-order-panel"
    aria-live="polite"
    @submit.prevent="$emit('submit', customerPayload)"
  >
    <div class="menu-order-panel__header">
      <div>
        <p class="menu-order-panel__eyebrow">
          {{ eyebrow }}
        </p>
        <h2>{{ title }}</h2>
      </div>

      <button
        type="button"
        class="menu-order-panel__close"
        aria-label="Back to menu"
        @click="$emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>

    <p v-if="message" class="menu-order-panel__message">
      {{ message }}
    </p>

    <div v-if="deliveryZones.length" class="menu-order-panel__zones">
      <article
        v-for="zone in deliveryZones"
        :key="zone.id"
        class="menu-order-panel__zone"
      >
        <strong>{{ zone.label }}</strong>
        <span>{{ zoneSummary(zone) }}</span>
      </article>
    </div>

    <div v-if="paymentLabels.length" class="menu-order-panel__payments">
      <p>Payment</p>
      <span>{{ paymentLabels.join(', ') }}</span>
    </div>

    <div class="menu-order-panel__fields">
      <label>
        <span>Name</span>
        <input
          v-model="customerName"
          type="text"
          autocomplete="name"
          placeholder="Your name"
          required
        >
      </label>

      <label>
        <span>Phone</span>
        <input
          v-model="customerPhone"
          type="tel"
          autocomplete="tel"
          placeholder="+41 ..."
          required
        >
      </label>

      <label v-if="orderType === 'delivery'" class="menu-order-panel__field--wide">
        <span>Delivery address</span>
        <input
          v-model="customerAddress"
          type="text"
          autocomplete="street-address"
          placeholder="Street, postcode, town"
          required
        >
      </label>

      <label class="menu-order-panel__field--wide">
        <span>Notes</span>
        <textarea
          v-model="customerNotes"
          rows="3"
          placeholder="Doorbell, allergy note, timing, or anything helpful."
        />
      </label>
    </div>

    <button
      type="submit"
      class="menu-order-panel__submit"
      :disabled="pending"
    >
      {{ pending ? 'Sending...' : submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
  MenuPaymentMethod,
} from '../../../models/menu/menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderType,
} from '../../../models/order.model'

const props = withDefaults(
  defineProps<{
    orderType: KitchenOrderType
    policy?: MenuOrderTypeConfig
    pending?: boolean
  }>(),
  {
    policy: undefined,
  }
)

defineEmits<{
  (event: 'close'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
}>()

const customerName = ref('')
const customerPhone = ref('')
const customerAddress = ref('')
const customerNotes = ref('')
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
const labels: Record<KitchenOrderType, string> = {
  dine_in: 'Order',
  collection: 'Collection',
  delivery: 'Delivery',
  pre_order: 'Pre-order',
  room_service: 'Room service',
}
const eyebrow = computed(() => labels[props.orderType] || 'Order')
const title = computed(() => {
  if (props.orderType === 'delivery') return 'Organise delivery'
  if (props.orderType === 'collection') return 'Organise collection'
  if (props.orderType === 'pre_order') return 'Organise pre-order'
  if (props.orderType === 'room_service') return 'Organise room service'

  return 'Send to kitchen'
})
const submitLabel = computed(() => {
  if (props.orderType === 'delivery') return 'Send delivery order'
  if (props.orderType === 'collection') return 'Send collection order'
  if (props.orderType === 'pre_order') return 'Send pre-order'

  return 'Send order'
})
const message = computed(() => props.policy?.message || '')
const paymentLabel = (method: MenuPaymentMethod) => {
  const paymentLabels: Record<MenuPaymentMethod, string> = {
    cash: 'Cash',
    card_at_pickup: 'Card at pickup',
    card_to_driver: 'Card to driver',
    online_card: 'Online card',
    deposit: 'Deposit',
  }

  return paymentLabels[method] || method
}
const paymentLabels = computed(() =>
  paymentMethods.value.map(paymentLabel)
)
const customerPayload = computed<KitchenOrderCustomer>(() => ({
  name: customerName.value.trim(),
  phone: customerPhone.value.trim(),
  ...(props.orderType === 'delivery'
    ? { address: customerAddress.value.trim() }
    : {}),
  ...(customerNotes.value.trim() ? { notes: customerNotes.value.trim() } : {}),
}))

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
.menu-order-panel {
  display: grid;
  gap: 1rem;
  width: min(44rem, calc(100% - 1rem));
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.35rem);
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.35rem;
  background: color-mix(in srgb, var(--menu-bg) 94%, transparent);
  color: var(--menu-text);
  box-shadow: 0 1.25rem 4rem color-mix(in srgb, var(--menu-text) 18%, transparent);
  text-align: left;
}

.menu-order-panel__header {
  display: flex;
  gap: 1rem;
  align-items: start;
  justify-content: space-between;
}

.menu-order-panel__eyebrow,
.menu-order-panel__message,
.menu-order-panel__payments p,
.menu-order-panel h2 {
  margin: 0;
}

.menu-order-panel__eyebrow {
  color: var(--menu-muted);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.menu-order-panel h2 {
  color: var(--menu-title);
  font-size: clamp(1.4rem, 4vw, 2rem);
  font-weight: 950;
  letter-spacing: -0.05em;
}

.menu-order-panel__close {
  display: inline-grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--menu-text);
  cursor: pointer;
}

.menu-order-panel__message {
  color: var(--menu-muted);
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.45;
}

.menu-order-panel__zones {
  display: grid;
  gap: 0.55rem;
}

.menu-order-panel__zone,
.menu-order-panel__payments {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  color: var(--menu-muted);
  font-size: 0.88rem;
}

.menu-order-panel__zone strong,
.menu-order-panel__payments p {
  color: var(--menu-title);
  font-weight: 850;
}

.menu-order-panel__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.menu-order-panel__fields label {
  display: grid;
  gap: 0.35rem;
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 850;
}

.menu-order-panel__fields input,
.menu-order-panel__fields textarea {
  width: 100%;
  padding: 0.75rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--menu-bg) 86%, var(--menu-text));
  color: var(--menu-text);
  font: inherit;
}

.menu-order-panel__field--wide {
  grid-column: 1 / -1;
}

.menu-order-panel__submit {
  justify-self: end;
  min-height: 2.6rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 900;
}

.menu-order-panel__submit:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

@media (max-width: 640px) {
  .menu-order-panel__fields {
    grid-template-columns: 1fr;
  }
}
</style>
