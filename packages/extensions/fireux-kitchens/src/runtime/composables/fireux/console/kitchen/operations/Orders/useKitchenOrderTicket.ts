import {
  computed,
  ref,
} from 'vue'
import type { KitchenOrder } from '../../../../../../models/kitchen/order.model'

export interface KitchenOrderTicketProps {
  bodyActionLabel?: string
  headerActionLabel?: string
  order: KitchenOrder
  statusActionAriaLabel?: string
  statusActionLabel?: string
  statusActionPending?: boolean
  trashMode?: boolean
}

export type KitchenOrderTicketEmit = {
  (event: 'trash', id: string): void
  (event: 'touch-header', id: string): void
  (event: 'touch-body', id: string): void
  (event: 'touch-status', id: string): void
}

export function useKitchenOrderTicket(
  props: KitchenOrderTicketProps,
  emit: KitchenOrderTicketEmit
) {
  const copied = ref(false)
  const orderRecord = computed(() => props.order as Record<string, unknown>)
  const fulfilmentMatch = computed(() =>
    record(orderRecord.value.fulfilment_match)
  )
  const collectionRecord = computed(() => record(orderRecord.value.collection))
  const tableRecord = computed(() => record(orderRecord.value.table))
  const roomServiceRecord = computed(() => record(orderRecord.value.room_service))
  const orderStatus = computed(() => normalizeString(props.order.status))
  const orderId = computed(() => normalizeString(props.order.id))
  const placedMs = computed(
    () =>
      timestampMs((props.order as any).created?.at) ||
      timestampMs((props.order as any).created_at) ||
      timestampMs((props.order as any).updated?.at) ||
      timestampMs((props.order as any).updated_at)
  )
  const pickupMs = computed(() =>
    timestampMs(
      collectionRequestedFor(props.order) ||
        orderValue(props.order, [
          'requested_for',
          'pickup_at',
          'pickup_time',
          'collection_at',
          'due_at',
        ]),
      placedMs.value
    )
  )
  const serviceMode = computed(() => resolveServiceMode(props.order))
  const fulfilmentReference = computed(() =>
    normalizeString(fulfilmentMatch.value.reference)
  )
  const collectionMode = computed(() =>
    normalizeString(collectionRecord.value.mode)
  )
  const isScheduledCollection = computed(() =>
    serviceMode.value === 'collection' &&
      collectionMode.value === 'scheduled' &&
      Boolean(pickupMs.value)
  )
  const estimatedReadyMinutes = computed(() =>
    Number((props.order as any).estimated_ready_minutes || 0)
  )
  const estimatedReadyMs = computed(() =>
    timestampMs((props.order as any).estimated_ready_at) ||
      (
        estimatedReadyMinutes.value > 0
          ? Date.now() + estimatedReadyMinutes.value * 60_000
          : 0
      )
  )
  const isWaitingForAcceptance = computed(() =>
    orderStatus.value === 'pending_acceptance'
  )
  const canTouchHeader = computed(() =>
    Boolean(orderId.value && props.headerActionLabel)
  )
  const canTouchBody = computed(() =>
    Boolean(orderId.value && props.bodyActionLabel)
  )
  const canShowStatusAction = computed(() =>
    Boolean(orderId.value && props.statusActionLabel)
  )
  const headerIcon = computed(() =>
    serviceMode.value === 'collection'
      ? 'i-lucide-shopping-bag'
      : serviceMode.value === 'delivery'
        ? 'i-lucide-bike'
        : serviceMode.value === 'pre_order'
          ? 'i-lucide-calendar-clock'
        : serviceMode.value === 'room_service'
          ? 'i-lucide-concierge-bell'
        : serviceMode.value === 'dine_in' || serviceMode.value === 'eat_in'
          ? 'i-lucide-utensils'
          : serviceMode.value === 'takeaway'
            ? 'i-lucide-shopping-bag'
            : 'i-lucide-clock'
  )
  const headerLabel = computed(() => {
    if (serviceMode.value === 'collection') {
      if (isScheduledCollection.value) return `Scheduled pickup ${formatTime(pickupMs.value)}`

      return 'Queue collection'
    }

    if (serviceMode.value === 'delivery') {
      return pickupMs.value
        ? `Deliver ${formatTime(pickupMs.value)}`
        : 'Delivery'
    }

    if (serviceMode.value === 'pre_order') {
      return pickupMs.value
        ? `Pre-order ${formatTime(pickupMs.value)}`
        : 'Pre-order'
    }

    if (serviceMode.value === 'dine_in') {
      const table = fulfilmentReference.value || normalizeString(tableRecord.value.number)
      if (!table) return 'Table service'

      return /^table\b/i.test(table) ? table : `Table ${table}`
    }
    if (serviceMode.value === 'room_service') {
      const room = normalizeString(roomServiceRecord.value.room)
      return room ? `Room service · ${room}` : 'Room service'
    }
    if (serviceMode.value === 'eat_in') {
      return fulfilmentReference.value
        ? `Eat here · ${fulfilmentReference.value}`
        : 'Eat here'
    }
    if (serviceMode.value === 'takeaway') {
      return fulfilmentReference.value
        ? `Take away · ${fulfilmentReference.value}`
        : 'Take away'
    }

    return placedMs.value ? `Placed ${formatTime(placedMs.value)}` : 'Time unset'
  })
  const statusLabel = computed(() => {
    if (orderStatus.value === 'pending_payment') return 'payment pending'
    if (orderStatus.value === 'pending_acceptance') return 'waiting'
    if (orderStatus.value === 'open' && serviceMode.value === 'pre_order') return 'confirmed'

    if (orderStatus.value === 'open' && estimatedReadyMs.value) {
      return `eta ${formatTime(estimatedReadyMs.value)}`
    }

    if (orderStatus.value === 'open' && estimatedReadyMinutes.value > 0) {
      return `eta ${estimatedReadyMinutes.value} min`
    }

    const fireState = normalizeString((props.order as any).fire_state)
    if (fireState === 'held') return 'held'
    if (fireState === 'ready_to_fire') return 'ready'
    if (!orderStatus.value || orderStatus.value === 'open') return ''

    return orderStatus.value.replace(/[_-]+/g, ' ')
  })
  const orderLabel = computed(() => {
    const number = normalizeString(props.order.order_number)
    return number ? `Order #${number}` : orderId.value || 'Order'
  })
  const lines = computed(() =>
    Array.isArray(props.order.items)
      ? props.order.items.map((item) => ({
          id: normalizeString(item.id) || normalizeString(item.label),
          label: normalizeString(item.label) || 'Item',
          addOns: Array.isArray(item.add_ons)
            ? item.add_ons
                .map((addOn) => normalizeString(addOn.label))
                .filter(Boolean)
            : [],
          variant: normalizeString(item.variant_label),
          qty: Number(item.quantity || 0),
        }))
      : []
  )
  const customerLines = computed(() => {
    const customer = record(orderRecord.value.customer)
    const payment = record(orderRecord.value.payment)
    const amount = Number(payment.amount_chf || 0)
    const paymentStatus = normalizeString(payment.status)
    const paymentMethod = normalizeString(payment.method)
    const paymentMethodLabels: Record<string, string> = {
      cash: 'cash on delivery',
      card_to_driver: 'card on delivery',
      card_at_pickup: 'card at pickup',
      online_card: 'online card',
      deposit: 'deposit',
    }
    const paymentLine = paymentStatus && paymentStatus !== 'not_required'
      ? `Payment ${paymentStatus}${amount ? ` · CHF ${amount.toFixed(2)}` : ''}`
      : paymentMethod
        ? `Payment ${paymentMethodLabels[paymentMethod] || paymentMethod}`
        : ''

    return [
      normalizeString(tableRecord.value.number),
      normalizeString(roomServiceRecord.value.room),
      normalizeString(customer.name),
      normalizeString(customer.phone),
      normalizeString(customer.address),
      Number(customer.party_size || 0) > 0
        ? `${Number(customer.party_size)} people`
        : '',
      normalizeString(orderRecord.value.kitchen_note),
      paymentLine,
      normalizeString(customer.notes),
    ].filter(Boolean)
  })

  function trashOrder() {
    if (!orderId.value) return
    emit('trash', orderId.value)
  }

  function touchHeader() {
    if (!canTouchHeader.value) return
    emit('touch-header', orderId.value)
  }

  function touchBody() {
    if (!canTouchBody.value) return
    emit('touch-body', orderId.value)
  }

  function touchStatus() {
    if (!canShowStatusAction.value || props.statusActionPending) return
    emit('touch-status', orderId.value)
  }

  async function copyTicket() {
    if (!orderId.value || !import.meta.client || !navigator.clipboard) return

    await navigator.clipboard.writeText(JSON.stringify({
      surface: 'kitchen_console_order_ticket',
      copied_at: new Date().toISOString(),
      order_id: orderId.value,
      label: orderLabel.value,
      header: headerLabel.value,
      status: statusLabel.value,
      service_mode: serviceMode.value,
      lines: lines.value,
      customer_lines: customerLines.value,
      order: orderRecord.value,
    }, null, 2))
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1400)
  }

  return {
    canShowStatusAction,
    canTouchBody,
    canTouchHeader,
    copied,
    copyTicket,
    customerLines,
    headerIcon,
    headerLabel,
    isWaitingForAcceptance,
    lines,
    orderId,
    orderLabel,
    statusLabel,
    touchBody,
    touchHeader,
    touchStatus,
    trashOrder,
  }
}

export function kitchenOrderHandoffActionLabel(order: KitchenOrder) {
  const serviceMode = resolveServiceMode(order)
  if (serviceMode === 'dine_in') return 'Delivered'
  if (serviceMode === 'eat_in' || serviceMode === 'takeaway') return 'Collected'

  return 'Send'
}

function normalizeString(value: unknown) {
  return String(value ?? '').trim()
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function timestampMs(value: unknown, baseMs = 0) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value > 1_000_000_000_000 ? value : value * 1000

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const text = normalizeString(value)
  const timeOnly = text.match(/^(\d{1,2}):(\d{2})$/)
  if (timeOnly) {
    const date = new Date(baseMs || Date.now())
    date.setHours(Number(timeOnly[1]), Number(timeOnly[2]), 0, 0)
    return date.getTime()
  }

  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

function orderValue(order: KitchenOrder, keys: string[]) {
  const source = order as Record<string, unknown>
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

function collectionRequestedFor(order: KitchenOrder) {
  const collection = (order as Record<string, unknown>).collection
  if (!collection || typeof collection !== 'object' || Array.isArray(collection)) {
    return ''
  }

  return normalizeString((collection as Record<string, unknown>).requested_for)
}

function resolveServiceMode(order: KitchenOrder) {
  const value = normalizeString(
    orderValue(order, [
      'order_type',
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'channel',
    ])
  ).toLowerCase()

  if (
    ['collection', 'collect', 'pickup', 'pick_up'].includes(value) ||
    value.includes('collection') ||
    value.includes('pickup')
  ) {
    return 'collection'
  }
  if (['delivery', 'deliver'].includes(value) || value.includes('delivery')) {
    return 'delivery'
  }
  if (['pre_order', 'pre-order', 'preorder'].includes(value) || value.includes('pre order')) {
    return 'pre_order'
  }
  if (['dine_in', 'dine-in', 'table'].includes(value) || value.includes('dine')) {
    return 'dine_in'
  }
  if (['eat_in', 'eat-in'].includes(value) || value.includes('eat in')) {
    return 'eat_in'
  }
  if (
    ['takeaway', 'take-away'].includes(value) ||
    value.includes('takeaway') ||
    value.includes('take away')
  ) {
    return 'takeaway'
  }

  return value
}
