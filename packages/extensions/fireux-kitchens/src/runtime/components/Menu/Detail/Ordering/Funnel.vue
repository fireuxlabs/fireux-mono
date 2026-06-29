<template>
  <div
    class="menu-order-funnel"
    :class="{
      'menu-order-funnel--panel': order.panelOpen,
      'menu-order-funnel--status': order.awaitingAcceptance || order.sentOrder,
    }"
  >
    <section
      v-if="order.awaitingAcceptance || order.sentOrder"
      class="menu-order-card menu-order-card--status"
      role="status"
      aria-live="polite"
    >
      <span
        v-if="order.awaitingAcceptance && !order.accepted"
        class="menu-order-spinner"
        aria-hidden="true"
      />
      <UIcon
        v-else
        name="i-lucide-circle-check"
        class="menu-order-status-icon"
        aria-hidden="true"
      />

      <div>
        <p class="menu-order-step-label">
          Order status
        </p>
        <h2>{{ order.accepted ? 'Order accepted' : 'Waiting for kitchen' }}</h2>
        <p>{{ statusMessage }}</p>
        <small v-if="orderReference">Reference {{ orderReference }}</small>
      </div>

      <button
        type="button"
        class="menu-order-secondary"
        @click="$emit('clear')"
      >
        Close
      </button>
    </section>

    <button
      v-else-if="!order.panelOpen"
      type="button"
      class="menu-order-basket"
      :disabled="order.pending"
      :aria-label="order.actionLabel"
      @click="$emit('openPanel')"
    >
      <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
    </button>

    <form
      v-else
      class="menu-order-card"
      @submit.prevent="submit"
    >
      <header class="menu-order-header">
        <p class="menu-order-step-label">
          Step {{ stepNumber }} of {{ steps.length }}
        </p>
        <h2>{{ currentStep.title }}</h2>
        <button
          type="button"
          class="menu-order-fold"
          aria-label="Fold order funnel away"
          @click="$emit('closePanel')"
        >
          <UIcon name="i-lucide-chevron-down" aria-hidden="true" />
        </button>
      </header>

      <div class="menu-order-body">
        <ul v-if="step === 'basket'" class="menu-order-items">
          <li
            v-for="item in order.selection.items"
            :key="item.lineId || item.id"
          >
            <span>{{ item.quantity }}x {{ item.name }}</span>
            <strong>{{ lineTotal(item) }}</strong>
          </li>
        </ul>

        <p v-else-if="step === 'safety'">
          If you have a food allergy or intolerance, please speak to a member of the team before ordering.
        </p>

        <p v-else-if="step === 'fulfilment'">
          {{ fulfilmentCopy }}
        </p>

        <div v-else-if="step === 'customer'" class="menu-order-fields">
          <label>
            <span>Name</span>
            <input
              v-model="customer.name"
              autocomplete="name"
              placeholder="Your name"
            >
          </label>
          <label>
            <span>Phone</span>
            <input
              v-model="customer.phone"
              autocomplete="tel"
              placeholder="+41 ..."
            >
          </label>
        </div>

        <p v-else-if="step === 'review'">
          Review is intentionally blank while we rebuild the funnel spine.
        </p>

        <p v-else>
          Pay online by card. Stripe checkout is the default payment path.
        </p>
      </div>

      <footer class="menu-order-footer">
        <p>
          <span>Total</span>
          <strong>{{ totalLabel }}</strong>
        </p>

        <div class="menu-order-actions">
          <button
            v-if="stepNumber > 1"
            type="button"
            class="menu-order-secondary"
            @click="previous"
          >
            Back
          </button>

          <button
            type="submit"
            class="menu-order-primary"
            :disabled="order.pending"
          >
            <span
              v-if="order.pending"
              class="menu-order-spinner"
              aria-hidden="true"
            />
            {{ primaryAction }}
          </button>
        </div>
      </footer>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuOrderingBasketItem,
  MenuOrderingFunnelState,
  MenuOrderingSubmitPayload,
} from './types'
import type { KitchenOrderCustomer } from '../../../../models/order.model'

const props = defineProps<{
  order: MenuOrderingFunnelState
}>()

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'closePanel'): void
  (event: 'openPanel'): void
  (event: 'submit', payload: MenuOrderingSubmitPayload): void
}>()

type FunnelStep = 'basket' | 'safety' | 'fulfilment' | 'customer' | 'review' | 'payment'

const steps: Array<{ key: FunnelStep, title: string }> = [
  { key: 'basket', title: 'Basket' },
  { key: 'safety', title: 'Food safety' },
  { key: 'fulfilment', title: 'Fulfilment' },
  { key: 'customer', title: 'Your details' },
  { key: 'review', title: 'Review' },
  { key: 'payment', title: 'Payment' },
]
const step = ref<FunnelStep>('basket')
const customer = ref<KitchenOrderCustomer>({})
const stepIndex = computed(() =>
  Math.max(0, steps.findIndex((candidate) => candidate.key === step.value))
)
const stepNumber = computed(() => stepIndex.value + 1)
const currentStep = computed(() => steps[stepIndex.value] || steps[0])
const orderReference = computed(() =>
  String(props.order.sentOrder?.order_number || '').trim()
)
const statusMessage = computed(() => {
  if (props.order.accepted) return 'The kitchen has accepted your order.'
  if (props.order.awaitingAcceptance) return 'Your order has been sent and is waiting for a human.'

  return props.order.message || 'Your order has been sent.'
})
const fulfilmentCopy = computed(() => {
  if (props.order.orderType === 'delivery') return 'Delivery address and zone checks will live here.'
  if (props.order.orderType === 'collection') return 'Collection time and pickup details will live here.'
  if (props.order.orderType === 'pre_order') return 'Pre-order time, people, and deposit rules will live here.'

  return 'Order handoff details will live here.'
})
const total = computed(() =>
  props.order.selection.items.reduce(
    (sum, item) =>
      sum +
      Math.max(0, Number(item.unitPrice || 0)) *
        Math.max(0, Number(item.quantity || 0)),
    0
  )
)
const totalLabel = computed(() =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(total.value)
)
const primaryAction = computed(() =>
  step.value === 'payment' ? `Pay ${totalLabel.value}` : 'Continue'
)

function money(value: number) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(value)
}

function lineTotal(item: MenuOrderingBasketItem) {
  const quantity = Math.max(0, Number(item.quantity || 0))
  const unitPrice = Math.max(0, Number(item.unitPrice || 0))

  return unitPrice ? money(quantity * unitPrice) : ''
}

function previous() {
  step.value = steps[Math.max(0, stepIndex.value - 1)]?.key || 'basket'
}

function submit() {
  if (step.value !== 'payment') {
    step.value = steps[Math.min(steps.length - 1, stepIndex.value + 1)]?.key || 'payment'
    return
  }

  emit('submit', {
    customer: customer.value,
    payment_method: 'online_card',
  })
}

watch(
  () => props.order.panelOpen,
  (open) => {
    if (open) step.value = 'basket'
  }
)
</script>
