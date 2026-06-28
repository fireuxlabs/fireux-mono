<template>
  <form
    class="menu-order-panel"
    aria-live="polite"
    @submit.prevent="$emit('submit', submitPayload)"
  >
    <MenuDetailOrderingCustomerPill />

    <FunnelSummaryHeader
      :eyebrow="eyebrow"
      :title="title"
      :total-label="totalLabel"
      :item-count-label="itemCountLabel"
      @edit="$emit('close')"
    />

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

    <FunnelPayment
      v-if="allergyAccepted && hasPaymentPolicy"
      v-model="selectedPaymentMethod"
      :methods="paymentMethods"
      :deposit="depositPolicy"
      :order-type="props.orderType"
      :party-size="Number(customer.party_size || 0)"
      :total-chf="orderTotal"
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
  KitchenOrderPaymentMethod,
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
import FunnelPayment from './Payment.vue'
import FunnelPreOrder from './PreOrder/index.vue'
import FunnelSummaryHeader from './SummaryHeader.vue'

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
  (event: 'submit', payload: {
    customer: KitchenOrderCustomer
    payment_method?: KitchenOrderPaymentMethod
  }): void
}>()

const customer = ref<KitchenOrderCustomer>({})
const selectedPaymentMethod = ref<KitchenOrderPaymentMethod | undefined>()
const { customer: customerAutofill } = useMenuCustomerAutofill()
const deliveryZone = ref<MenuDeliveryZone | null>(null)
const allergyAccepted = ref(false)
const allergyMessage =
  'If you have a food allergy or intolerance, please speak to a member of the team before ordering.'
const eyebrow = computed(() => menuOrderTypeLabel(props.orderType))
const title = computed(() => menuOrderFunnelTitle(props.orderType))
const paymentMethods = computed(() =>
  props.policy?.fulfilment?.payment_methods || []
)
const depositPolicy = computed(() => props.policy?.fulfilment?.deposit)
const hasPaymentPolicy = computed(() =>
  paymentMethods.value.length > 0 || Boolean(depositPolicy.value)
)
const requiresOnlinePayment = computed(() =>
  selectedPaymentMethod.value === 'online_card' || Boolean(depositPolicy.value)
)
const submitLabel = computed(() =>
  requiresOnlinePayment.value
    ? 'Continue to payment'
    : menuOrderSubmitLabel(props.orderType)
)
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
const submitPayload = computed(() => ({
  customer: customerPayload.value,
  ...(selectedPaymentMethod.value
    ? { payment_method: selectedPaymentMethod.value }
    : {}),
}))
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

watch(
  paymentMethods,
  (methods: KitchenOrderPaymentMethod[]) => {
    const selectable = methods.filter(
      (method: KitchenOrderPaymentMethod) => method !== 'deposit'
    )
    if (!selectable.length) {
      selectedPaymentMethod.value = undefined
      return
    }

    if (
      !selectedPaymentMethod.value ||
      !selectable.includes(selectedPaymentMethod.value)
    ) {
      selectedPaymentMethod.value = selectable[0]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.menu-order-panel {
  display: grid;
  align-content: start;
  gap: 1rem;
  width: min(58rem, 100%);
  height: 100%;
  max-height: 100%;
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

.menu-order-panel__submit:disabled { cursor: not-allowed; opacity: 0.62; }

.menu-order-panel__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid color-mix(in srgb, var(--menu-bg) 36%, transparent);
  border-top-color: var(--menu-bg);
  border-radius: 999px;
  animation: menu-order-panel-spin 0.8s linear infinite;
}

@keyframes menu-order-panel-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .menu-order-panel {
    width: 100%;
    border-radius: 1.1rem;
  }
  .menu-order-panel__submit {
    width: 100%;
  }
  .menu-order-panel__notice {
    justify-self: stretch;
    text-align: left;
  }
}
</style>
