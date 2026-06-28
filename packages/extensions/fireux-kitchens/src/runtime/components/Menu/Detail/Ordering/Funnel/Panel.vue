<template>
  <form
    class="menu-order-panel"
    :class="`menu-order-panel--${funnelStep}`"
    aria-live="polite"
    @submit.prevent="$emit('submit', submitPayload)"
  >
    <MenuDetailOrderingCustomerPill v-if="funnelStep !== 'items'" />

    <FunnelSummaryHeader
      v-if="funnelStep !== 'items'"
      :eyebrow="eyebrow"
      :title="stepTitle"
      :total-label="totalLabel"
      :item-count-label="itemCountLabel"
      @edit="$emit('close')"
    />

    <FunnelItems
      v-if="funnelStep === 'items'"
      :selection="props.selection"
      :total-label="totalLabel"
      @close="$emit('close')"
      @continue="continueToSafety"
    />

    <FunnelNotice
      v-else-if="funnelStep === 'safety'"
      :message="allergyMessage"
      action-label="I understand"
      @confirm="continueToDetails"
    />

    <div v-else class="menu-order-panel__details">
      <component
        :is="funnelComponent"
        v-model="customer"
        :menu-id="props.menuId"
        :kitchen-slug="props.kitchenSlug"
        :policy="policy"
        @delivery-zone="setDeliveryZone"
      />

      <FunnelPayment
        v-if="hasPaymentPolicy"
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
    </div>
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
import type { MenuOrderingSelectionSummary } from '../types'
import FunnelItems from './Items.vue'
import FunnelNotice from './Notice.vue'
import FunnelCollection from './Collection/index.vue'
import FunnelDefault from './Default/index.vue'
import FunnelDelivery from './Delivery/index.vue'
import FunnelPayment from './Payment.vue'
import FunnelPreOrder from './PreOrder/index.vue'
import FunnelSummaryHeader from './SummaryHeader.vue'

type FunnelStep = 'items' | 'safety' | 'details'

const props = withDefaults(
  defineProps<{
    orderType: KitchenOrderType
    menuId: string
    kitchenSlug?: string
    policy?: MenuOrderTypeConfig
    pending?: boolean
    selection?: MenuOrderingSelectionSummary
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
const funnelStep = ref<FunnelStep>('items')
const allergyMessage =
  'If you have a food allergy or intolerance, please speak to a member of the team before ordering.'
const eyebrow = computed(() => menuOrderTypeLabel(props.orderType))
const title = computed(() => menuOrderFunnelTitle(props.orderType))
const stepTitle = computed(() => {
  if (funnelStep.value === 'items') return 'Your items'
  if (funnelStep.value === 'safety') return 'Food safety'

  return title.value
})
const allergyAccepted = computed(() => funnelStep.value === 'details')
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
      sum +
      Math.max(0, Number(item.unitPrice || 0)) *
        Math.max(0, Number(item.quantity || 0)),
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

function continueToSafety() {
  funnelStep.value = 'safety'
}

function continueToDetails() {
  funnelStep.value = 'details'
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
    funnelStep.value = 'items'
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
