import { computed, ref } from 'vue'
import type { KitchenOrder } from '../../../../utils/order.ts'
import { kitchenOrderTicketFooterLabel } from '../../../../utils/kitchen-order-label'

export interface KitchenOrderTicketProps {
  bodyActionLabel?: string
  headerActionLabel?: string
  interactive?: boolean
  order: KitchenOrder
  prominent?: boolean
  selected?: boolean
  showCustomerDetails?: boolean
  statusActionAriaLabel?: string
  statusActionLabel?: string
  statusActionPending?: boolean
  trashMode?: boolean
}

export interface KitchenOrderTicketLine {
  addOns: string[]
  id: string
  label: string
  qty: number
  variant: string
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
  const linesExpanded = ref(false)
  const orderRecord = computed(() => props.order as Record<string, unknown>)
  const fulfilmentMatch = computed(() =>
    record(orderRecord.value.fulfilment_match)
  )
  const collectionRecord = computed(() => record(orderRecord.value.collection))
  const tableRecord = computed(() => record(orderRecord.value.table))
  const roomServiceRecord = computed(() =>
    record(orderRecord.value.room_service)
  )
  const orderStatus = computed(() => normalizeString(props.order.status))
  const orderId = computed(() => normalizeString(props.order.id))
  const placedMs = computed(
    () =>
      timestampMs(props.order.created.at) || timestampMs(props.order.updated.at)
  )
  const pickupMs = computed(() =>
    timestampMs(
      collectionRequestedFor(props.order) || props.order.requested_for,
      placedMs.value
    )
  )
  const orderType = computed(() => resolveOrderType(props.order))
  const fulfilmentReference = computed(() =>
    normalizeString(fulfilmentMatch.value.reference)
  )
  const collectionMode = computed(() =>
    normalizeString(collectionRecord.value.mode)
  )
  const isScheduledCollection = computed(
    () =>
      orderType.value === 'collection' && collectionMode.value === 'scheduled'
  )
  const estimatedReadyMinutes = computed(() =>
    Number((props.order as any).estimated_ready_minutes || 0)
  )
  const estimatedReadyMs = computed(
    () =>
      timestampMs((props.order as any).estimated_ready_at) ||
      (estimatedReadyMinutes.value > 0
        ? Date.now() + estimatedReadyMinutes.value * 60_000
        : 0)
  )
  const isWaitingForAcceptance = computed(
    () => orderStatus.value === 'pending_acceptance'
  )
  const canTouchHeader = computed(
    () =>
      props.interactive !== false &&
      Boolean(orderId.value && props.headerActionLabel)
  )
  const canTouchBody = computed(
    () =>
      props.interactive !== false &&
      Boolean(orderId.value && props.bodyActionLabel)
  )
  const canShowStatusAction = computed(() =>
    Boolean(orderId.value && props.statusActionLabel)
  )
  const canUseStatusAction = computed(
    () => props.interactive !== false && canShowStatusAction.value
  )
  const headerIcon = computed(() =>
    orderType.value === 'collection'
      ? 'i-lucide-shopping-bag'
      : orderType.value === 'delivery'
        ? 'i-lucide-bike'
        : orderType.value === 'pre_order'
          ? 'i-lucide-calendar-clock'
          : orderType.value === 'room_service'
            ? 'i-lucide-concierge-bell'
            : orderType.value === 'dine_in' || orderType.value === 'eat_in'
              ? 'i-lucide-utensils'
              : orderType.value === 'takeaway'
                ? 'i-lucide-shopping-bag'
                : 'i-lucide-clock'
  )
  const headerLabel = computed(() => {
    if (orderType.value === 'collection') {
      if (!isScheduledCollection.value) return 'Collection'

      return pickupMs.value
        ? `Collection: ${formatTime(pickupMs.value)}`
        : 'Collection'
    }

    if (orderType.value === 'delivery') {
      return pickupMs.value
        ? `Deliver ${formatTime(pickupMs.value)}`
        : 'Delivery'
    }

    if (orderType.value === 'pre_order') {
      return pickupMs.value
        ? `Pre-order ${formatTime(pickupMs.value)}`
        : 'Pre-order'
    }

    if (orderType.value === 'dine_in') {
      const table =
        fulfilmentReference.value || normalizeString(tableRecord.value.number)
      if (!table) return 'Table service'

      return /^table\b/i.test(table) ? table : `Table ${table}`
    }
    if (orderType.value === 'room_service') {
      const room = normalizeString(roomServiceRecord.value.room)
      return room ? `Room service · ${room}` : 'Room service'
    }
    if (orderType.value === 'eat_in') {
      return fulfilmentReference.value
        ? `Eat here · ${fulfilmentReference.value}`
        : 'Eat here'
    }
    if (orderType.value === 'takeaway') {
      return fulfilmentReference.value
        ? `Take away · ${fulfilmentReference.value}`
        : 'Take away'
    }

    return placedMs.value
      ? `Placed ${formatTime(placedMs.value)}`
      : 'Time unset'
  })
  const statusLabel = computed(() => {
    if (orderStatus.value === 'pending_payment') return 'payment pending'
    if (orderStatus.value === 'pending_acceptance') return 'waiting'
    if (orderStatus.value === 'accepted' && orderType.value === 'pre_order') {
      return 'confirmed'
    }

    if (orderStatus.value === 'accepted' && estimatedReadyMs.value) {
      return `eta ${formatTime(estimatedReadyMs.value)}`
    }

    if (orderStatus.value === 'accepted' && estimatedReadyMinutes.value > 0) {
      return `eta ${estimatedReadyMinutes.value} min`
    }

    if (orderStatus.value === 'ready') return 'ready'
    if (!orderStatus.value || orderStatus.value === 'accepted') return ''

    return orderStatus.value.replace(/[_-]+/g, ' ')
  })
  const orderLabel = computed(() => {
    return kitchenOrderTicketFooterLabel(orderRecord.value)
  })
  const placedTimeLabel = computed(() =>
    placedMs.value ? formatTime(placedMs.value) : ''
  )
  const lines = computed<KitchenOrderTicketLine[]>(() =>
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
  const visibleLines = computed(() =>
    linesExpanded.value ? lines.value : lines.value.slice(0, 5)
  )
  const hiddenLineCount = computed(() => Math.max(0, lines.value.length - 5))
  const canToggleLines = computed(() => lines.value.length > 5)
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
    const paymentLine =
      paymentStatus && paymentStatus !== 'not_required'
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
    if (props.interactive === false || !orderId.value) return
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
    if (!canUseStatusAction.value || props.statusActionPending) return
    emit('touch-status', orderId.value)
  }

  function toggleLines() {
    if (!canToggleLines.value) return
    linesExpanded.value = !linesExpanded.value
  }

  async function copyTicket() {
    if (!orderId.value || !import.meta.client || !navigator.clipboard) return

    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          surface: 'kitchen_workspace_order_ticket',
          copied_at: new Date().toISOString(),
          order_id: orderId.value,
          label: orderLabel.value,
          header: headerLabel.value,
          status: statusLabel.value,
          order_type: orderType.value,
          lines: lines.value,
          customer_lines: customerLines.value,
          order: orderRecord.value,
        },
        null,
        2
      )
    )
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1400)
  }

  return {
    canShowStatusAction,
    canToggleLines,
    canUseStatusAction,
    canTouchBody,
    canTouchHeader,
    copied,
    copyTicket,
    customerLines,
    headerIcon,
    headerLabel,
    isWaitingForAcceptance,
    hiddenLineCount,
    lines,
    linesExpanded,
    orderId,
    orderLabel,
    placedTimeLabel,
    statusLabel,
    touchBody,
    touchHeader,
    touchStatus,
    toggleLines,
    trashOrder,
    visibleLines,
  }
}

function normalizeString(value: unknown) {
  return String(value ?? '').trim()
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function timestampMs(value: unknown, baseMs = 0) {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number')
    return value > 1_000_000_000_000 ? value : value * 1000

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

function collectionRequestedFor(order: KitchenOrder) {
  const collection = (order as Record<string, unknown>).collection
  if (
    !collection ||
    typeof collection !== 'object' ||
    Array.isArray(collection)
  ) {
    return ''
  }

  return normalizeString((collection as Record<string, unknown>).requested_for)
}

function resolveOrderType(order: KitchenOrder) {
  return normalizeString(order.order_type)
}
