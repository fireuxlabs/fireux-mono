<!-- Concurrent edit — 2026-07-19 17:33 CEST — Kiosk pass: keep shared status copy accurate for Eat here and Take away. -->
<!-- Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: explain asynchronous confirmation and safe same-device recovery. -->
<template>
  <section
    class="menu-order-status"
    :data-menu-order-id="status?.id || orderId"
    :data-menu-order-status="currentStatus"
    aria-live="polite"
  >
    <span class="menu-order-status__icon" aria-hidden="true">
      <UIcon :name="statusIcon" />
    </span>

    <div class="menu-order-status__copy">
      <p>{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>

    <dl>
      <div>
        <dt>Order</dt>
        <dd>{{ orderNumber || 'Sent' }}</dd>
      </div>
      <div>
        <dt>{{ fulfilmentTerm }}</dt>
        <dd>{{ fulfilmentLabel }}</dd>
      </div>
      <div>
        <dt>Payment</dt>
        <dd>{{ currentPaymentLabel }}</dd>
      </div>
      <div v-if="destinationInstructions">
        <dt>{{ fulfilmentTerm }} details</dt>
        <dd>{{ destinationInstructions }}</dd>
      </div>
    </dl>

    <div v-if="paymentChoiceRequired" class="menu-order-status__actions">
      <p>Choose how to pay. Preparation waits until this step is complete.</p>
      <button
        v-for="method in status?.payment_choices || []"
        :key="method"
        type="button"
        class="menu-order-status__primary"
        :disabled="responding"
        @click="$emit('choose-payment', method)"
      >
        {{ paymentMethodLabels[method] }}
      </button>
      <p v-if="!status?.payment_choices?.length">
        No supported payment method is currently available. Please contact the
        Kitchen.
      </p>
    </div>

    <p v-if="statusError" class="menu-order-status__error">
      {{ statusError }} We’ll keep trying.
    </p>

    <p v-if="responseError" class="menu-order-status__error">
      <MoleculesCopyError :message="responseError" />
    </p>

    <button
      v-if="
        printActionLabel &&
        ['accepted', 'ready', 'completed'].includes(currentStatus)
      "
      type="button"
      class="menu-order-status__again"
      @click="$emit('print')"
    >
      {{ printActionLabel }}
    </button>

    <div v-if="changesRequested" class="menu-order-status__actions">
      <button
        type="button"
        class="menu-order-status__again"
        :disabled="responding"
        @click="$emit('cancel')"
      >
        Cancel order
      </button>
      <button
        type="button"
        class="menu-order-status__primary"
        :disabled="responding"
        @click="$emit('amend')"
      >
        Amend order
      </button>
    </div>

    <button
      v-if="terminal"
      type="button"
      class="menu-order-status__again"
      @click="$emit('reset')"
    >
      {{ terminalActionLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CreatedMenuOrder } from '../../models/menu-order-receipt.model.ts'
import type { KitchenOrderType } from '../../../kitchen/utils/order.ts'
import type { MenuOrderLifecycleStatus } from '../../composables/order/useMenuOrderLifecycle'

const props = defineProps<{
  customerName?: string
  destinationInstructions?: string
  fulfilmentLabel: string
  fulfilmentTerm: string
  order: CreatedMenuOrder
  orderType: KitchenOrderType
  paymentLabel: string
  printActionLabel?: string
  status: MenuOrderLifecycleStatus | null
  statusError?: string
  responseError?: string
  responding?: boolean
}>()
defineEmits<{
  (event: 'choose-payment', method: string): void
  (event: 'cancel'): void
  (event: 'amend'): void
  (event: 'print'): void
  (event: 'reset'): void
}>()

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash at handoff',
  card_at_pickup: 'Card at pickup',
  card_to_driver: 'Card to driver',
  room_charge: 'Charge to room',
  online_card: 'Pay securely online',
  deposit: 'Pay deposit online',
  pay_later:
    props.orderType === 'collection'
      ? 'Pay when you collect'
      : 'Pay at handoff',
}
const paymentChoiceRequired = computed(
  () =>
    props.status?.payment?.flow === 'confirmation_first' &&
    ['awaiting_payment_choice', 'pending_payment'].includes(currentStatus.value)
)
const currentPaymentLabel = computed(() => {
  const payment = props.status?.payment
  if (!payment) return props.paymentLabel
  if (payment.status === 'paid') return 'Paid'
  if (!payment.method)
    return currentStatus.value === 'pending_acceptance'
      ? 'Choose after Kitchen confirmation'
      : 'Payment method not chosen'
  if (payment.required)
    return payment.status === 'failed'
      ? 'Payment failed — retry or choose another method'
      : 'Online payment not yet confirmed'
  return `${paymentMethodLabels[payment.method] || payment.method} · unpaid`
})

const currentStatus = computed(() => props.status?.status || props.order.status)
const orderId = computed(() => props.order.id)
const orderNumber = computed(
  () => props.status?.order_number || props.order.order_number
)
const changesRequested = computed(
  () => currentStatus.value === 'changes_requested'
)
const awaitingConfirmation = computed(
  () => currentStatus.value === 'pending_acceptance'
)
const terminal = computed(() =>
  ['completed', 'cancelled', 'trashed'].includes(currentStatus.value)
)
const terminalActionLabel = computed(() =>
  ['cancelled', 'trashed'].includes(currentStatus.value)
    ? 'Acknowledge'
    : 'Start another order'
)
const estimateMinutes = computed(() =>
  Math.max(0, Number(props.status?.estimated_ready_minutes || 0))
)
const kitchenNote = computed(() =>
  String(props.status?.kitchen_note || '').trim()
)
const statusIcon = computed(() => {
  if (currentStatus.value === 'ready') return 'i-lucide-check-check'
  if (currentStatus.value === 'accepted') return 'i-lucide-chef-hat'
  if (changesRequested.value) return 'i-lucide-calendar-clock'
  if (currentStatus.value === 'completed') return 'i-lucide-circle-check-big'
  if (['cancelled', 'trashed'].includes(currentStatus.value))
    return 'i-lucide-circle-x'
  return 'i-lucide-clock-3'
})
const eyebrow = computed(() => {
  if (
    ['awaiting_payment_choice', 'pending_payment'].includes(currentStatus.value)
  )
    return 'Kitchen confirmed'
  if (currentStatus.value === 'awaiting_preparation')
    return 'Waiting for preparation'
  if (currentStatus.value === 'scheduled') return 'Pickup confirmed'
  if (currentStatus.value === 'ready') {
    if (props.orderType === 'delivery') return 'Ready for delivery'
    if (props.orderType === 'collection') return 'Ready to collect'
    if (props.orderType === 'eat_in') return 'Ready to serve'
    if (props.orderType === 'takeaway') return 'Ready to take away'
    return 'Pre-order ready'
  }
  if (currentStatus.value === 'accepted') {
    return props.orderType === 'pre_order'
      ? 'Kitchen confirmed'
      : 'Kitchen accepted'
  }
  if (awaitingConfirmation.value && props.orderType === 'pre_order') {
    return 'Pre-order request sent'
  }
  if (changesRequested.value) {
    return props.customerName ? `Hello ${props.customerName}` : 'Hello'
  }
  if (currentStatus.value === 'completed') {
    if (props.orderType === 'delivery') return 'Delivered'
    if (props.orderType === 'collection') return 'Collected'
    if (props.orderType === 'takeaway') return 'Taken away'
    return 'Completed'
  }
  if (['cancelled', 'trashed'].includes(currentStatus.value))
    return 'Kitchen response'
  return 'Sent to Kitchen'
})
const title = computed(() => {
  if (currentStatus.value === 'awaiting_payment_choice')
    return 'Choose how to pay'
  if (currentStatus.value === 'pending_payment') return 'Complete your payment'
  if (currentStatus.value === 'awaiting_preparation')
    return 'Your order is confirmed'

  if (currentStatus.value === 'scheduled')
    return `Your pickup is confirmed: ${props.fulfilmentLabel}`
  if (currentStatus.value === 'ready') {
    return props.orderType === 'delivery'
      ? 'The Kitchen has finished your order'
      : props.orderType === 'pre_order'
        ? 'Your pre-order is ready'
        : 'Your order is ready'
  }
  if (currentStatus.value === 'accepted') {
    if (props.status?.payment?.flow === 'confirmation_first')
      return 'The Kitchen is preparing your order'
    return estimateMinutes.value
      ? `Ready in about ${estimateMinutes.value} minutes`
      : `Your ${props.fulfilmentTerm.toLowerCase()} is confirmed`
  }
  if (awaitingConfirmation.value && props.orderType === 'pre_order') {
    return 'Waiting for Kitchen confirmation'
  }
  if (changesRequested.value) {
    return kitchenNote.value || 'The Kitchen has requested a change'
  }
  if (currentStatus.value === 'completed') return 'Thank you'
  if (['cancelled', 'trashed'].includes(currentStatus.value))
    return 'The Kitchen could not accept this order'
  return 'Waiting for the Kitchen to accept'
})
const description = computed(() => {
  if (currentStatus.value === 'awaiting_payment_choice')
    return 'The Kitchen has accepted your request. Choose a payment method to continue.'
  if (currentStatus.value === 'pending_payment')
    return 'Preparation waits for verified payment. You can retry or choose another available method.'
  if (currentStatus.value === 'awaiting_preparation')
    return 'Your payment step is complete. The Kitchen has not started preparation.'

  if (currentStatus.value === 'scheduled')
    return 'Your pickup time is agreed. Preparation has not started.'
  if (currentStatus.value === 'ready') {
    return (
      props.destinationInstructions ||
      (props.orderType === 'delivery'
        ? 'The order is ready for its delivery handoff.'
        : props.orderType === 'pre_order'
          ? 'Please follow the Kitchen’s handoff instructions.'
          : props.orderType === 'eat_in'
            ? 'Your order is ready for service.'
            : props.orderType === 'takeaway'
              ? 'Collect your takeaway order at the counter.'
              : 'Please head to the collection point.')
    )
  }
  if (currentStatus.value === 'accepted') return props.fulfilmentLabel
  if (awaitingConfirmation.value && props.orderType === 'pre_order') {
    return props.customerName
      ? 'You can close this page. The confirmed order will also appear in My orders.'
      : 'You can close this page and return on this device to check the Kitchen’s response.'
  }
  if (changesRequested.value) {
    return 'Amend the order or cancel it.'
  }
  if (currentStatus.value === 'completed') {
    return `This ${props.fulfilmentTerm.toLowerCase()} order is complete.`
  }
  if (['cancelled', 'trashed'].includes(currentStatus.value)) {
    return kitchenNote.value || 'Please contact the Kitchen or try again.'
  }
  return 'The Kitchen must review your request. If staff are away, review may wait until they return. Return on this device to check; this page updates while connected.'
})
</script>

<style scoped>
.menu-order-status {
  display: grid;
  max-width: 42rem;
  gap: calc(var(--spacing) * 5);
  margin: 0 auto;
  padding: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 10));
  border: 1px solid color-mix(in srgb, var(--menu-primary) 30%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-bg) 94%, var(--menu-primary));
  color: var(--menu-text);
  text-align: center;
}
.menu-order-status__icon {
  display: grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  justify-self: center;
  border-radius: 9999px;
  background: var(--menu-primary);
  color: var(--menu-primary-contrast);
  font-size: 1.75rem;
}
.menu-order-status__copy {
  display: grid;
  gap: 0.35rem;
}
.menu-order-status__copy p,
.menu-order-status__copy h2 {
  margin: 0;
}
.menu-order-status__copy > p:first-child {
  color: var(--menu-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-black);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.menu-order-status__copy h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.35rem, 5vw, 2rem);
}
.menu-order-status__copy > p:last-child {
  color: var(--menu-muted);
}
.menu-order-status dl {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  text-align: left;
}
.menu-order-status dl div {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: 0.7rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
}
.menu-order-status dt {
  color: var(--menu-muted);
}
.menu-order-status dd {
  margin: 0;
  color: var(--menu-title);
  font-weight: var(--font-weight-extrabold);
  text-align: right;
}
.menu-order-status__error {
  margin: 0;
  color: var(--ui-error);
  font-size: 0.85rem;
}
.menu-order-status__again {
  justify-self: center;
  padding: 0.65rem calc(var(--spacing) * 4);
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-primary);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-extrabold);
}
.menu-order-status__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(var(--spacing) * 3);
}
.menu-order-status__primary {
  padding: 0.65rem calc(var(--spacing) * 4);
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-primary-contrast);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-extrabold);
}
.menu-order-status__actions button:disabled {
  cursor: wait;
  opacity: 0.6;
}
</style>
