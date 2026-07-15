import { computed } from 'vue'
import { useKitchenOrdersFetch } from './fetch/useKitchenOrdersFetch'
import {
  deriveKitchenOrderBoardStage,
  KitchenOrderStorage,
  type KitchenOrder,
  type KitchenOrderBoardStage,
  type KitchenOrderTransition,
} from '../../../../../../models/kitchen/order.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { getDemoKitchenCollection } from '../../../../demo/kitchen/scenarios'
import { useKitchenOrderTransition } from './mutations/useKitchenOrderTransition'

export function useKitchenConsoleOrders() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const appId = runtime.appId
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const fetchKitchenId = computed(() =>
    rootCollection.value && kitchenId.value ? kitchenId.value : ''
  )
  const demoOrders = computed(() =>
    runtime.source.value === 'demo' && kitchenId.value
      ? getDemoKitchenCollection<KitchenOrder>(kitchenId.value, 'orders')
      : []
  )
  const { orders, pending: ordersPending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, {
      kitchenCollectionPath: rootCollection,
      databaseId,
  })
  const { transitionKitchenOrder } = useKitchenOrderTransition({
    appId,
  })
  const page = useKitchenConsoleReadPage<KitchenOrder>({
    collectionName: KitchenOrderStorage.collection,
    selectedKitchen,
    kitchenId,
    items: orders,
    pending: ordersPending,
    collectionPath: ordersPath,
  })
  const consoleOrders = computed(() =>
    runtime.source.value === 'demo'
      ? demoOrders.value
      : page.collection.value.items
  )
  const pending = computed(() =>
    runtime.source.value === 'demo' ? false : page.collection.value.pending
  )
  const orderBoardPath = computed(() =>
    runtime.source.value === 'demo'
      ? `demo/kitchens/${kitchenId.value}/orders`
      : ordersPath.value
  )
  const visibleOrders = computed(() =>
    consoleOrders.value.filter(
      (order) => deriveKitchenOrderBoardStage(order) !== 'trash'
    )
  )
  const incomingOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'incoming')
  )
  const queueOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'queue')
  )
  const passOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'pass')
  )
  const recentOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'recent')
  )
  const unmappedOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'unmapped')
  )
  const ticketOrders = computed(() =>
    sortOrders(visibleOrders.value)
  )
  const debugOrder = (order: KitchenOrder) => ({
    id: order.id,
    orderNumber: order.order_number || '',
    status: order.status || '',
    orderType: order.order_type || '',
    estimatedReadyMinutes: (order as any).estimated_ready_minutes || 0,
    estimatedReadyAt: (order as any).estimated_ready_at || '',
    requestedFor: collectionRequestedFor(order) || order.requested_for || '',
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          id: item.id,
          dishId: item.dish_id,
          label: item.label,
          addOns: item.add_ons || [],
          variantId: item.variant_id || '',
          variantLabel: item.variant_label || '',
          unitPrice: item.unit_price || 0,
          quantity: item.quantity,
          checked: item.checked,
        }))
      : [],
  })
  const debugOrders = computed(() => ({
    incoming: incomingOrders.value.map(debugOrder),
    queue: queueOrders.value.map(debugOrder),
    pass: passOrders.value.map(debugOrder),
    recent: recentOrders.value.map(debugOrder),
    unmapped: unmappedOrders.value.map(debugOrder),
  }))
  const debugCount = (match: (order: KitchenOrder) => boolean) =>
    consoleOrders.value.filter(match).length
  const transitionOrder = async (
    transition: KitchenOrderTransition,
    orderId: string,
    options: { estimatedMinutes?: number | null; note?: string } = {}
  ) => {
    if (readOnly.value || !canWrite.value) return
    await transitionKitchenOrder(kitchenId.value, orderId, transition, options)
  }
  const acceptOrder = (orderId: string, estimatedMinutes: number | null = 45) =>
    transitionOrder('accept', orderId, { estimatedMinutes })
  const rejectOrder = (orderId: string, note: string) =>
    transitionOrder('reject', orderId, { note })
  const returnOrderToQueue = (orderId: string) =>
    transitionOrder('return_to_queue', orderId)
  const markOrderReady = (orderId: string) =>
    transitionOrder('mark_ready', orderId)
  const completeOrder = (orderId: string) =>
    transitionOrder('complete', orderId)
  const trashOrder = (orderId: string) =>
    transitionOrder('trash', orderId)
  const debug = computed(() => ({
    objects: {
      orders: debugOrders.value,
    },
    derived: {
      kitchenId: kitchenId.value,
      source: runtime.source.value,
      rootCollection: rootCollection.value,
      databaseId: databaseId.value,
      collectionPath: orderBoardPath.value,
      ordersCount: visibleOrders.value.length,
      rawOrdersCount: consoleOrders.value.length,
      incomingCount: incomingOrders.value.length,
      queueCount: queueOrders.value.length,
      passCount: passOrders.value.length,
      recentCount: recentOrders.value.length,
      unmappedCount: unmappedOrders.value.length,
      acceptedCount: debugCount((order) => order.status === 'accepted'),
      preOrderCount: debugCount((order) => order.order_type === 'pre_order'),
      trashedCount: debugCount((order) => order.status === 'trashed'),
      pending: pending.value,
      readOnly: readOnly.value,
      canWrite: canWrite.value,
    },
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath: orderBoardPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    orders: consoleOrders,
    ticketOrders,
    incomingOrders,
    queueOrders,
    passOrders,
    recentOrders,
    unmappedOrders,
    pending,
    acceptOrder,
    rejectOrder,
    returnOrderToQueue,
    markOrderReady,
    completeOrder,
    trashOrder,
    debug,
  }
}

const defaultTargetMinutes = 15

const timestampMs = (value: unknown, baseMs = 0) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') {
    return value > 1_000_000_000_000 ? value : value * 1000
  }

  const source = value as { seconds?: number; toMillis?: () => number } | null
  if (typeof source?.toMillis === 'function') return source.toMillis()

  const seconds = Number(source?.seconds)
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000

  const text = String(value ?? '').trim()
  const timeOnly = text.match(/^(\d{1,2}):(\d{2})$/)
  if (timeOnly) {
    const date = new Date(baseMs || Date.now())
    date.setHours(Number(timeOnly[1]), Number(timeOnly[2]), 0, 0)
    return date.getTime()
  }

  const parsed = Date.parse(text)
  return Number.isFinite(parsed) ? parsed : 0
}

const collectionRequestedFor = (order: KitchenOrder) => {
  const collection = (order as Record<string, unknown>).collection
  if (!collection || typeof collection !== 'object' || Array.isArray(collection)) {
    return ''
  }

  return String((collection as Record<string, unknown>).requested_for || '').trim()
}

const getCreatedMs = (order: KitchenOrder) =>
  timestampMs(order.created.at) || timestampMs(order.updated.at)

const getPickupMs = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  return timestampMs(
    collectionRequestedFor(order) || order.requested_for,
    createdMs
  )
}

const ordersAtStage = (
  orders: KitchenOrder[],
  stage: KitchenOrderBoardStage
) => sortOrders(
  orders.filter((order) => deriveKitchenOrderBoardStage(order) === stage)
)

const sortOrders = (orders: KitchenOrder[]) =>
  [...orders].sort((a, b) => {
    const aTime = getRailTime(a)
    const bTime = getRailTime(b)
    if (aTime !== bTime) return aTime - bTime
    return String(a.order_number || a.id).localeCompare(
      String(b.order_number || b.id)
    )
  })

const getRailTime = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  if (order.order_type !== 'collection') return createdMs

  const pickupMs = getPickupMs(order)
  return pickupMs
    ? pickupMs - defaultTargetMinutes * 60 * 1000
    : createdMs
}
