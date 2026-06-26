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

      <div class="menu-order-panel__selection">
        <p>
          <strong>{{ totalLabel }}</strong>
          <span>{{ itemCountLabel }}</span>
        </p>

        <button
          type="button"
          class="menu-order-panel__edit"
          aria-label="Edit selected items"
          @click="$emit('close')"
        >
          Edit
        </button>
      </div>
    </div>

    <FunnelNotice
      v-if="!allergyAccepted"
      :message="allergyMessage"
      action-label="I understand"
      @confirm="allergyAccepted = true"
    />

    <component
      :is="funnelComponent"
      v-else
      v-model="customer"
      :menu-id="props.menuId"
      :kitchen-slug="props.kitchenSlug"
      :policy="policy"
      @delivery-zone="setDeliveryZone"
    />

    <p
      v-if="submitBlockMessage"
      class="menu-order-panel__notice"
      aria-live="polite"
    >
      {{ submitBlockMessage }}
    </p>

    <button
      v-if="allergyAccepted"
      type="submit"
      class="menu-order-panel__submit"
      :disabled="pending || !canSubmit"
    >
      <span
        v-if="pending"
        class="menu-order-panel__spinner"
        aria-hidden="true"
      />
      {{ pending ? 'Sending order...' : submitLabel }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useMenuCustomerAutofill } from '../../../../../composables/fireux/public/menu/useMenuCustomerAutofill'
import type {
  MenuDeliveryZone,
  MenuOrderTypeConfig,
} from '../../../../../models/menu/menu.model'
import type {
  KitchenOrderCustomer,
  KitchenOrderType,
} from '../../../../../models/order.model'
import {
  cleanKitchenOrderCustomer,
  menuOrderFunnelTitle,
  menuOrderSubmitLabel,
  menuOrderTypeLabel,
} from '../../../../../utils/menu-ordering-ui'
import FunnelNotice from './Notice.vue'
import FunnelCollection from './Collection/index.vue'
import FunnelDefault from './Default/index.vue'
import FunnelDelivery from './Delivery/index.vue'
import FunnelPreOrder from './PreOrder/index.vue'

type FunnelSelectionItem = {
  quantity: number
  unitPrice?: number
}

type FunnelSelectionSummary = {
  items: FunnelSelectionItem[]
  quantity: number
}

const props = withDefaults(
  defineProps<{
    orderType: KitchenOrderType
    menuId: string
    kitchenSlug?: string
    policy?: MenuOrderTypeConfig
    pending?: boolean
    selection?: FunnelSelectionSummary
  }>(),
  {
    kitchenSlug: '',
    policy: undefined,
    selection: () => ({
      items: [],
      quantity: 0,
    }),
  }
)

defineEmits<{
  (event: 'close'): void
  (event: 'submit', customer: KitchenOrderCustomer): void
}>()

const customer = ref<KitchenOrderCustomer>({})
const { customer: customerAutofill } = useMenuCustomerAutofill()
const deliveryZone = ref<MenuDeliveryZone | null>(null)
const allergyAccepted = ref(false)
const allergyMessage =
  'If you have a food allergy or intolerance, please speak to a member of the team before ordering.'
const eyebrow = computed(() => menuOrderTypeLabel(props.orderType))
const title = computed(() => menuOrderFunnelTitle(props.orderType))
const submitLabel = computed(() => menuOrderSubmitLabel(props.orderType))
const itemCountLabel = computed(() =>
  `${props.selection.quantity} item${props.selection.quantity === 1 ? '' : 's'}`
)
const total = computed(() =>
  props.selection.items.reduce(
    (sum, item) =>
      sum + Math.max(0, Number(item.unitPrice || 0)) * Math.max(0, Number(item.quantity || 0)),
    0
  )
)
const deliveryFee = computed(() =>
  props.orderType === 'delivery' && deliveryZone.value
    ? Math.max(0, Number(deliveryZone.value.fee_chf || 0))
    : 0
)
const orderTotal = computed(() => total.value + deliveryFee.value)
const minimumOrder = computed(() =>
  props.orderType === 'delivery' && deliveryZone.value
    ? Math.max(0, Number(deliveryZone.value.min_order_chf || 0))
    : 0
)
const minimumShortfall = computed(() =>
  Math.max(0, minimumOrder.value - total.value)
)
const totalLabel = computed(() =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(orderTotal.value)
)
const money = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
const canSubmit = computed(() => {
  if (props.orderType !== 'delivery') return true
  if (!customer.value.address_place_id || !deliveryZone.value) return false

  return minimumShortfall.value === 0
})
const submitBlockMessage = computed(() => {
  if (!allergyAccepted.value || props.orderType !== 'delivery') return ''
  if (!customer.value.address_place_id) return ''
  if (!deliveryZone.value) {
    return 'Choose an address inside the delivery area.'
  }
  if (minimumShortfall.value) {
    return `Minimum order is ${money(minimumOrder.value)}. Add ${money(minimumShortfall.value)} more.`
  }
  if (deliveryFee.value) {
    return `Delivery fee ${money(deliveryFee.value)} applies.`
  }

  return ''
})
const customerPayload = computed<KitchenOrderCustomer>(() =>
  cleanKitchenOrderCustomer(customer.value)
)
const funnelComponents: Partial<Record<KitchenOrderType, Component>> = {
  delivery: FunnelDelivery,
  collection: FunnelCollection,
  pre_order: FunnelPreOrder,
}
const funnelComponent = computed(() =>
  funnelComponents[props.orderType] || FunnelDefault
)

function setDeliveryZone(zone: MenuDeliveryZone | null) {
  deliveryZone.value = zone
}

watch(
  customerAutofill,
  (nextCustomer: KitchenOrderCustomer) => {
    const next = { ...customer.value }
    let changed = false

    for (const field of ['name', 'phone', 'allergy_note'] as const) {
      const currentValue = String(next[field] || '').trim()
      const autofillValue = String(nextCustomer[field] || '').trim()
      if (!currentValue && autofillValue) {
        next[field] = autofillValue
        changed = true
      }
    }

    if (changed) customer.value = next
  },
  { immediate: true }
)

watch(
  () => props.orderType,
  () => {
    deliveryZone.value = null
  }
)
</script>

<style scoped>
.menu-order-panel {
  display: grid;
  gap: 1rem;
  width: min(44rem, calc(100% - 1rem));
  max-height: min(38rem, calc(100svh - 2rem));
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.35rem);
  border: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
  border-radius: 1.35rem;
  background: color-mix(in srgb, var(--menu-bg) 94%, transparent);
  color: var(--menu-text);
  box-shadow: 0 1.25rem 4rem color-mix(in srgb, var(--menu-text) 18%, transparent);
  overflow: auto;
  text-align: left;
  backdrop-filter: blur(20px);
}

.menu-order-panel__header {
  display: flex;
  gap: 1rem;
  align-items: start;
  justify-content: space-between;
}

.menu-order-panel__eyebrow,
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

.menu-order-panel__selection {
  display: grid;
  gap: 0.45rem;
  justify-items: end;
  min-width: max-content;
}

.menu-order-panel__selection p {
  display: grid;
  gap: 0.1rem;
  margin: 0;
  text-align: right;
}

.menu-order-panel__selection strong {
  color: var(--menu-title);
  font-size: 1rem;
  font-weight: 950;
}

.menu-order-panel__selection span {
  color: var(--menu-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.menu-order-panel__edit {
  min-height: 2rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 14%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 72%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 850;
}

.menu-order-panel__notice {
  justify-self: end;
  max-width: 28rem;
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.84rem;
  font-weight: 850;
  line-height: 1.4;
  text-align: right;
}

.menu-order-panel__submit {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
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

.menu-order-panel__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid color-mix(in srgb, var(--menu-bg) 36%, transparent);
  border-top-color: var(--menu-bg);
  border-radius: 999px;
  animation: menu-order-panel-spin 0.8s linear infinite;
}

@keyframes menu-order-panel-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
