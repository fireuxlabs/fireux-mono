<template>
  <form
    class="menu-order-panel"
    :class="`menu-order-panel--${funnelStep}`"
    aria-live="polite"
    @submit.prevent="$emit('submit', submitPayload)"
  >
    <FunnelSummaryHeader
      v-if="showStepHeader"
      :eyebrow="stepEyebrow"
      :step-label="stepLabel"
      :title="stepTitle"
      :total-label="totalLabel"
      :item-count-label="itemCountLabel"
      @edit="$emit('close')"
    />

    <FunnelItems
      v-if="funnelStep === 'items'"
      :selection="props.selection"
      :step-label="stepLabel"
      :total-label="totalLabel"
      @close="$emit('close')"
      @continue="continueToSafety"
    />

    <FunnelNotice
      v-else-if="funnelStep === 'safety'"
      :message="allergyMessage"
      :step-label="stepLabel"
      action-label="I understand"
      back-label="Back"
      @back="backToItems"
      @confirm="continueToFulfilment"
    />

    <div
      v-else-if="funnelStep === 'fulfilment'"
      class="menu-order-panel__details"
    >
      <component
        :is="funnelComponent"
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

      <FunnelActions
        action-label="Continue"
        :disabled="!canContinueToCustomer"
        @back="backToSafety"
        @action="continueToCustomer"
      />
    </div>

    <div
      v-else-if="funnelStep === 'customer'"
      class="menu-order-panel__details"
    >
      <FunnelFields
        :model-value="customer"
        notes-placeholder="Doorbell, floor, timing, or anything helpful."
        @update:model-value="customer = $event"
      />

      <FunnelActions
        action-label="Continue"
        @back="backToFulfilment"
        @action="continueToReview"
      />
    </div>

    <FunnelPlaceholder
      v-else-if="funnelStep === 'review'"
      @back="backToCustomer"
      @continue="continueToPayment"
    />

    <div v-else class="menu-order-panel__details">
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

      <FunnelActions
        :action-label="submitLabel"
        :disabled="!canSubmit"
        :pending="pending"
        pending-label="Sending order..."
        submit
        @back="backToCustomer"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch, type Component } from 'vue'
import { useStoredChoice } from 'fireux-core/runtime/composables/shared/useStoredChoice'
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
import FunnelActions from './Actions.vue'
import FunnelItems from './Items.vue'
import FunnelNotice from './Notice.vue'
import FunnelCollection from './Collection/index.vue'
import FunnelDefault from './Default/index.vue'
import FunnelDelivery from './Delivery/index.vue'
import FunnelFields from './Fields.vue'
import FunnelPayment from './Payment.vue'
import FunnelPlaceholder from './Placeholder.vue'
import FunnelPreOrder from './PreOrder/index.vue'
import FunnelSummaryHeader from './SummaryHeader.vue'

type FunnelStep = 'items' | 'safety' | 'fulfilment' | 'customer' | 'review' | 'payment'
type SelectablePaymentMethod = Exclude<KitchenOrderPaymentMethod, 'deposit'>
const funnelSteps = ['items', 'safety', 'fulfilment', 'customer', 'review', 'payment'] as const satisfies readonly FunnelStep[]

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
const selectedPaymentMethod = ref<SelectablePaymentMethod | undefined>()
const { customer: customerAutofill } = useMenuCustomerAutofill()
const deliveryZone = ref<MenuDeliveryZone | null>(null)
const funnelStepKey = computed(() =>
  [
    'fireux-menu-order-funnel',
    props.menuId,
    props.kitchenSlug,
    props.orderType,
  ].filter(Boolean).join(':')
)
const { selected: funnelStep } = useStoredChoice<FunnelStep>({
  key: funnelStepKey,
  choices: funnelSteps,
  fallback: 'items',
})
const allergyMessage =
  'If you have a food allergy or intolerance, please speak to a member of the team before ordering.'
const title = computed(() => menuOrderFunnelTitle(props.orderType))
const stepEyebrow = computed(() => {
  if (funnelStep.value === 'customer') return 'Customer'
  if (funnelStep.value === 'review') return 'Review'
  if (funnelStep.value === 'payment') return 'Payment'

  return menuOrderTypeLabel(props.orderType)
})
const stepTitle = computed(() => {
  if (funnelStep.value === 'items') return 'Your items'
  if (funnelStep.value === 'customer') return 'Your details'
  if (funnelStep.value === 'review') return 'Hello world'
  if (funnelStep.value === 'payment') return 'Payment'

  return title.value
})
const stepNumbers: Record<FunnelStep, number> = { items: 1, safety: 2, fulfilment: 3, customer: 4, review: 5, payment: 6 }
const stepLabel = computed(() => `Step ${stepNumbers[funnelStep.value]} of 6`)
const showStepHeader = computed(() => !['items', 'safety'].includes(funnelStep.value))
const paymentMethods = computed<SelectablePaymentMethod[]>(() => [
  'online_card',
])
const depositPolicy = computed(() => props.policy?.fulfilment?.deposit)
const hasPaymentPolicy = computed(() =>
  paymentMethods.value.length > 0 || Boolean(depositPolicy.value)
)
const requiresOnlinePayment = computed(() =>
  selectedPaymentMethod.value === 'online_card' || Boolean(depositPolicy.value)
)
const submitLabel = computed(() =>
  funnelStep.value === 'payment' && requiresOnlinePayment.value
    ? `Pay ${totalLabel.value}`
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
const canContinueToCustomer = computed(() => {
  if (props.orderType !== 'delivery') return true

  return canSubmit.value
})
const submitBlockMessage = computed(() => {
  if (props.orderType !== 'delivery') return ''
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

function backToItems() {
  funnelStep.value = 'items'
}

function backToSafety() {
  funnelStep.value = 'safety'
}

function continueToFulfilment() {
  funnelStep.value = 'fulfilment'
}

function backToFulfilment() {
  funnelStep.value = 'fulfilment'
}

function continueToCustomer() {
  if (!canContinueToCustomer.value) return
  funnelStep.value = 'customer'
}

function backToCustomer() {
  funnelStep.value = 'customer'
}

function continueToReview() { funnelStep.value = 'review' }

function continueToPayment() { funnelStep.value = 'payment' }

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
  (methods: SelectablePaymentMethod[]) => {
    if (!methods.length) {
      selectedPaymentMethod.value = undefined
      return
    }

    if (
      !selectedPaymentMethod.value ||
      !methods.includes(selectedPaymentMethod.value)
    ) {
      selectedPaymentMethod.value = methods[0]
    }
  },
  { immediate: true }
)
</script>
