<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">
      Confirmation
    </h2>

    <p class="menu-order-placeholder">
      {{ confirmationLabel }}
    </p>

    <section
      v-if="funnel.processing.exists"
      class="menu-order-dispatch__section"
    >
      <UIcon
        name="i-lucide-receipt-text"
        class="menu-order-dispatch__icon"
        aria-hidden="true"
      />

      <div class="menu-order-dispatch__copy">
        <strong>{{ detailTitle }}</strong>
        <span>{{ detailStatus }}</span>
      </div>
    </section>

    <ul
      v-if="itemLines.length"
      class="menu-order-items"
    >
      <li
        v-for="item in itemLines"
        :key="item.id"
      >
        <span>{{ item.quantity }}x {{ item.label }}</span>
        <strong v-if="item.totalLabel">{{ item.totalLabel }}</strong>
      </li>
    </ul>

    <p
      v-if="totalLabel"
      class="menu-order-total"
    >
      <span>Total</span>
      <strong>{{ totalLabel }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  funnel: MenuOrderingFunnelController
}>()

const money = (value: number) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: props.funnel.order.currencyCode.trim().toUpperCase(),
  }).format(value)
const text = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const requestLabel = computed(() => {
  if (props.funnel.order.orderType === 'collection') return 'Collection request'
  if (props.funnel.order.orderType === 'delivery') return 'Delivery order'
  if (['eat_in', 'takeaway'].includes(props.funnel.order.orderType)) return 'Kiosk order'

  return 'Order'
})
const order = computed(() => record(props.funnel.processing.order))
const receipt = computed(() => record(order.value.receipt))
const customer = computed(() =>
  record(order.value.customer || receipt.value.customer)
)
const payment = computed(() => record(order.value.payment))
const paymentAccepted = computed(() =>
  text(payment.value.status) === 'paid'
)
const orderStatus = computed(() =>
  text(order.value.status || props.funnel.processing.status)
)
const fireState = computed(() =>
  text(order.value.fire_state || props.funnel.processing.fire_state)
)
const isKioskFunnel = computed(() =>
  ['eat_in', 'takeaway'].includes(props.funnel.order.orderType)
)
const customerName = computed(() => text(customer.value.name))
const readyForCounter = computed(() =>
  isKioskFunnel.value &&
    (
      ['ready', 'on_pass'].includes(orderStatus.value) ||
      fireState.value === 'ready_to_fire'
    )
)
const detailTitle = computed(() => {
  const orderNumber = props.funnel.processing.order_number
  return orderNumber ? `Order ${orderNumber}` : requestLabel.value
})
const detailStatus = computed(() => {
  if (readyForCounter.value) {
    return customerName.value
      ? `${customerName.value}, your order is ready. Please collect from the counter.`
      : 'Your order is ready. Please collect from the counter.'
  }
  if (isKioskFunnel.value && customerName.value) {
    return `${customerName.value}, we will call you when it is ready.`
  }
  if (paymentAccepted.value) return 'Payment accepted. The kitchen has the order details.'
  if (text(payment.value.status) === 'pending') return 'Payment is in progress.'

  return 'The kitchen has the order details.'
})
const confirmationLabel = computed(() => {
  const orderNumber = props.funnel.processing.order_number
  if (!props.funnel.processing.exists) return `${requestLabel.value} is not sent yet.`
  if (readyForCounter.value) {
    return customerName.value
      ? `${customerName.value}, your order is ready.`
      : 'Your order is ready.'
  }
  if (isKioskFunnel.value) {
    return orderNumber
      ? `Order ${orderNumber} is with the kitchen.`
      : 'Your order is with the kitchen.'
  }
  if (paymentAccepted.value) {
    return orderNumber
      ? `Payment accepted for ${requestLabel.value.toLowerCase()} ${orderNumber}.`
      : `Payment accepted for this ${requestLabel.value.toLowerCase()}.`
  }

  return orderNumber
    ? `${requestLabel.value} ${orderNumber} is with the kitchen.`
    : `${requestLabel.value} is with the kitchen.`
})
const itemLines = computed(() =>
  props.funnel.processing.items
    .map((item, index) => {
      const source = record(item)
      const quantity = Math.max(1, numberValue(source.quantity) || 1)
      const unitPrice = numberValue(source.unitPrice || source.unit_price_chf)
      const total = numberValue(source.total_chf) || unitPrice * quantity
      const label = text(source.name || source.label) || 'Item'

      return {
        id: text(source.lineId || source.id) || `item-${index + 1}`,
        label,
        quantity,
        totalLabel: total ? money(total) : '',
      }
    })
)
const totalLabel = computed(() => {
  const total = numberValue(props.funnel.processing.total_chf)

  return total ? money(total) : ''
})
</script>
