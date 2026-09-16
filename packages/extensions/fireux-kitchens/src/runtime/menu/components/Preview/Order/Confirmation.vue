<template>
  <div class="menu-order-dispatch">
    <h2 class="menu-order-screen-title">Confirmation</h2>

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

    <ul v-if="itemLines.length" class="menu-order-items">
      <li v-for="item in itemLines" :key="item.id">
        <span class="grid min-w-0 gap-0.5">
          <span>{{ item.quantity }}x {{ item.label }}</span>
          <small v-if="item.variant" class="text-xs text-dimmed">
            {{ item.variant }}
          </small>
          <small v-if="item.addOns.length" class="text-xs text-dimmed">
            + {{ item.addOns.join(', ') }}
          </small>
        </span>
        <strong v-if="item.totalLabel">{{ item.totalLabel }}</strong>
      </li>
    </ul>

    <p v-if="totalLabel" class="menu-order-total">
      <span>Total</span>
      <strong>{{ totalLabel }}</strong>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuOrderPreviewController } from '../../../models/menu-order-preview.model.ts'

const props = defineProps<{
  funnel: MenuOrderPreviewController
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
    ? (value as Record<string, unknown>)
    : {}
const optionLabels = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((option) => text(record(option).label))
    .filter(Boolean)
const requestLabel = computed(() => {
  if (props.funnel.order.orderType === 'collection') return 'Collection request'
  if (props.funnel.order.orderType === 'delivery') return 'Delivery order'
  if (props.funnel.order.orderType === 'dine_in') return 'Dine-in order'
  if (props.funnel.order.orderType === 'room_service')
    return 'Room-service order'
  if (props.funnel.order.orderType === 'eat_in') return 'Eat-here order'
  if (props.funnel.order.orderType === 'takeaway') return 'Take-away order'

  return 'Order'
})
const order = computed(() => record(props.funnel.processing.order))
const receipt = computed(() => record(order.value.receipt))
const fulfilmentMatch = computed(() =>
  record(order.value.fulfilment_match || receipt.value.fulfilment_match)
)
const customer = computed(() =>
  record(order.value.customer || receipt.value.customer)
)
const payment = computed(() => record(order.value.payment))
const paymentAccepted = computed(() => text(payment.value.status) === 'paid')
const orderStatus = computed(() =>
  text(props.funnel.processing.status || order.value.status)
)
const isKioskFunnel = computed(() =>
  ['eat_in', 'takeaway'].includes(props.funnel.order.orderType)
)
const customerName = computed(() => text(customer.value.name))
const fulfilmentReference = computed(() =>
  text(fulfilmentMatch.value.reference)
)
const counterReference = computed(() =>
  text(fulfilmentMatch.value.type) === 'counter'
    ? fulfilmentReference.value
    : ''
)
const destinationLabel = computed(() => {
  if (
    text(fulfilmentMatch.value.type) === 'table' &&
    fulfilmentReference.value
  ) {
    return /^table\b/i.test(fulfilmentReference.value)
      ? fulfilmentReference.value
      : `Table ${fulfilmentReference.value}`
  }
  const table = record(order.value.table || receipt.value.table)
  const roomService = record(
    order.value.room_service || receipt.value.room_service
  )
  if (text(table.number)) {
    return /^table\b/i.test(text(table.number))
      ? text(table.number)
      : `Table ${text(table.number)}`
  }
  if (text(roomService.room)) {
    return /^room\b/i.test(text(roomService.room))
      ? text(roomService.room)
      : `Room ${text(roomService.room)}`
  }

  return ''
})
const detailTitle = computed(() => {
  if (counterReference.value) {
    return props.funnel.order.orderType === 'eat_in'
      ? `Eat here · ${counterReference.value}`
      : `Take away · ${counterReference.value}`
  }
  const orderNumber = props.funnel.processing.order_number
  return orderNumber ? `Order ${orderNumber}` : requestLabel.value
})
const readyDetail = computed(() => {
  const orderType = props.funnel.order.orderType
  if (orderType === 'dine_in') {
    return destinationLabel.value
      ? `${destinationLabel.value} is ready for service.`
      : 'Your order is ready for service.'
  }
  if (orderType === 'delivery') return 'Your order is ready for dispatch.'
  if (orderType === 'room_service') {
    return destinationLabel.value
      ? `${destinationLabel.value} is ready for delivery.`
      : 'Your room-service order is ready for delivery.'
  }

  return counterReference.value
    ? `${counterReference.value} is ready. Please collect from the counter.`
    : 'Your order is ready for collection.'
})
const completedDetail = computed(() => {
  const orderType = props.funnel.order.orderType
  if (orderType === 'dine_in') return 'Your order has been served.'
  if (orderType === 'delivery') return 'Your order has been dispatched.'
  if (orderType === 'room_service') return 'Your order has been delivered.'

  return 'Your order has been collected.'
})
const detailStatus = computed(() => {
  if (orderStatus.value === 'trashed') {
    return 'Order status is no longer available.'
  }
  if (orderStatus.value === 'cancelled') {
    return 'The kitchen could not accept this order.'
  }
  if (orderStatus.value === 'completed') return completedDetail.value
  if (orderStatus.value === 'ready') return readyDetail.value
  if (orderStatus.value === 'pending_payment') {
    return 'Payment is required before the kitchen can process this order.'
  }
  if (orderStatus.value === 'pending_acceptance') {
    return 'Waiting for the kitchen to accept your order.'
  }
  if (isKioskFunnel.value && counterReference.value) {
    return `We will call ${counterReference.value} when it is ready.`
  }
  if (isKioskFunnel.value && customerName.value) {
    return `${customerName.value}, we will call you when it is ready.`
  }
  if (paymentAccepted.value)
    return 'Payment accepted. The kitchen has the order details.'
  if (text(payment.value.status) === 'pending') return 'Payment is in progress.'
  if (destinationLabel.value)
    return `${destinationLabel.value}. The kitchen has the order details.`

  return 'The kitchen has the order details.'
})
const confirmationLabel = computed(() => {
  const orderNumber = props.funnel.processing.order_number
  if (!props.funnel.processing.exists)
    return `${requestLabel.value} is not sent yet.`
  if (orderStatus.value === 'trashed')
    return 'Order status is no longer available.'
  if (orderStatus.value === 'cancelled') return 'This order was not accepted.'
  if (orderStatus.value === 'completed') return completedDetail.value
  if (orderStatus.value === 'ready') {
    return customerName.value
      ? `${customerName.value}, your order is ready.`
      : 'Your order is ready.'
  }
  if (orderStatus.value === 'pending_payment') {
    return 'Complete payment to send this order to the kitchen.'
  }
  if (orderStatus.value === 'pending_acceptance') {
    return orderNumber
      ? `Order ${orderNumber} is waiting for kitchen confirmation.`
      : 'Your order is waiting for kitchen confirmation.'
  }
  if (isKioskFunnel.value) {
    if (counterReference.value) {
      return `Your counter number is ${counterReference.value}. The kitchen has your order.`
    }
    return orderNumber
      ? `Order ${orderNumber} is in the kitchen queue.`
      : 'Your order is in the kitchen queue.'
  }
  if (orderStatus.value === 'accepted') {
    return orderNumber
      ? `${requestLabel.value} ${orderNumber} was accepted.`
      : `${requestLabel.value} was accepted.`
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
  props.funnel.processing.items.map((item, index) => {
    const source = record(item)
    const quantity = Math.max(1, numberValue(source.quantity) || 1)
    const unitPrice = numberValue(source.unitPrice || source.unit_price_chf)
    const total = numberValue(source.total_chf) || unitPrice * quantity
    const label = text(source.name || source.label) || 'Item'
    const variant = text(
      record(source.variant).label ||
        source.variantLabel ||
        source.variant_label
    )
    const hasDraftAddOns = Array.isArray(source.addOns)
    const addOns = optionLabels(
      hasDraftAddOns ? source.addOns : source.add_ons
    ).filter((addOn) => !hasDraftAddOns || !label.includes(addOn))

    return {
      id: text(source.lineId || source.id) || `item-${index + 1}`,
      addOns,
      label,
      quantity,
      totalLabel: total ? money(total) : '',
      variant: variant && !label.includes(variant) ? variant : '',
    }
  })
)
const totalLabel = computed(() => {
  const total = numberValue(props.funnel.processing.total_chf)

  return total ? money(total) : ''
})
</script>
