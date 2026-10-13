import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useKitchenAccess } from '../../useKitchenAccess'
import { useKitchenOrderFetch } from '../../orders/useKitchenOrderFetch'
import {
  deriveKitchenOrderBoardStage,
  KitchenOrderStorage,
  type KitchenOrder,
  type KitchenOrderBoardStage,
  type KitchenOrderTransition,
} from '../../../utils/order.ts'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../useKitchenWorkspaceReadPage'
import { useKitchenOrderTransition } from '../../orders/useKitchenOrderTransition'
import { useKitchenOrderNumbering } from '../../orders/useKitchenOrderNumbering'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'

export function useKitchenWorkspaceOrders() {
  const workspace = useKitchenWorkspace()
  const session = useAppSession()
  const access = useKitchenAccess()
  const config = useFireUXConfig()
  const selectedKitchen = workspace.data
  const kitchenId = workspace.id
  const rootCollection = computed(() => 'kitchens')
  const appId = computed(() => config.appId)
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const storageKitchenId = computed(() =>
    workspace.outcome.value === 'ready' &&
    selectedKitchen.value?.id === kitchenId.value &&
    kitchenId.value
      ? kitchenId.value
      : ''
  )
  const {
    orders: fetchedOrders,
    error: sourceError,
    outcome: ordersOutcome,
    ordersPath,
  } = useKitchenOrderFetch(storageKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const {
    captureIntent,
    error: transitionError,
    isTransitioning: isOrderTransitioning,
    pendingCount: transitioningCount,
    transitionKitchenOrder,
  } = useKitchenOrderTransition({ appId })
  const {
    resetNumbering: resetKitchenOrderNumbering,
    error: numberingError,
    pending: numberingPending,
  } = useKitchenOrderNumbering({ appId, kitchenId })
  const outcome = computed(() => {
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    if (!kitchenId.value) return 'idle'
    if (!storageKitchenId.value) return 'pending'
    return ordersOutcome.value
  })
  const readError = computed(() => {
    if (workspace.outcome.value !== 'ready')
      return workspace.outcome.value === 'error'
        ? session.error.value ||
            access.error.value ||
            new Error('Kitchen could not be loaded.')
        : undefined
    return storageKitchenId.value ? sourceError.value : undefined
  })
  const canWrite = computed(() =>
    Boolean(
      storageKitchenId.value &&
        workspace.accountReady.value &&
        workspace.hasAccount.value &&
        access.ids.value.includes(kitchenId.value)
    )
  )
  const readOnly = computed(() => !canWrite.value)
  const pending = computed(() => outcome.value === 'pending')
  const orders = computed(() =>
    outcome.value === 'ready' ? fetchedOrders.value : []
  )
  const page = useKitchenWorkspaceReadPage<KitchenOrder>({
    collectionName: KitchenOrderStorage.collection,
    selectedKitchen,
    kitchenId,
    items: orders,
    pending,
    collectionPath: ordersPath,
  })
  const workspaceOrders = computed(() => page.collection.value.items)
  const orderBoardPath = ordersPath
  const visibleOrders = computed(() =>
    workspaceOrders.value.filter(
      (order) => deriveKitchenOrderBoardStage(order) !== 'trash'
    )
  )
  const incomingOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'incoming')
  )
  const scheduledOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'scheduled')
  )
  const paymentOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'payment')
  )
  const queueOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'queue')
  )
  const passOrders = computed(() => ordersAtStage(visibleOrders.value, 'pass'))
  const recentOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'recent')
  )
  const unmappedOrders = computed(() =>
    ordersAtStage(visibleOrders.value, 'unmapped')
  )
  const railCounts = computed(() => [
    ...(paymentOrders.value.length
      ? [{ label: 'Awaiting payment', count: paymentOrders.value.length }]
      : []),
    { label: 'Incoming', count: incomingOrders.value.length },
    { label: 'Scheduled', count: scheduledOrders.value.length },
    { label: 'Queue', count: queueOrders.value.length },
    { label: 'Pass', count: passOrders.value.length },
    { label: 'Recent', count: recentOrders.value.length },
    ...(unmappedOrders.value.length
      ? [{ label: 'Needs mapping', count: unmappedOrders.value.length }]
      : []),
  ])
  const ticketOrders = computed(() => sortOrders(visibleOrders.value))
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
    payment: paymentOrders.value.map(debugOrder),
    incoming: incomingOrders.value.map(debugOrder),
    queue: queueOrders.value.map(debugOrder),
    pass: passOrders.value.map(debugOrder),
    recent: recentOrders.value.map(debugOrder),
    unmapped: unmappedOrders.value.map(debugOrder),
  }))
  const debugCount = (match: (order: KitchenOrder) => boolean) =>
    workspaceOrders.value.filter(match).length
  const transitionOrder = async (
    transition: KitchenOrderTransition,
    orderId: string,
    options: { estimatedMinutes?: number | null; note?: string } = {}
  ) => {
    if (readOnly.value || !canWrite.value)
      throw new Error('This Kitchen is read-only.')
    return transitionKitchenOrder(kitchenId.value, orderId, transition, options)
  }
  const acceptOrder = (orderId: string, estimatedMinutes: number | null = 45) =>
    transitionOrder('accept', orderId, { estimatedMinutes })
  const startPreparation = (orderId: string) =>
    transitionOrder('start_preparation', orderId)
  const rejectOrder = (orderId: string, note: string) =>
    transitionOrder('reject', orderId, { note })
  const returnOrderToQueue = (orderId: string) =>
    transitionOrder('return_to_queue', orderId)
  const markOrderReady = (orderId: string) =>
    transitionOrder('mark_ready', orderId)
  const completeOrder = (orderId: string) =>
    transitionOrder('complete', orderId)
  const trashOrder = (orderId: string) => transitionOrder('trash', orderId)
  const resetNumbering = async () => {
    if (readOnly.value || !canWrite.value)
      throw new Error('This Kitchen is read-only.')
    return resetKitchenOrderNumbering()
  }
  const debug = computed(() => ({
    objects: {
      orders: workspaceOrders.value,
    },
    derived: {
      board: debugOrders.value,
      kitchenId: kitchenId.value,
      dataType: 'live',
      rootCollection: rootCollection.value,
      databaseId: databaseId.value,
      collectionPath: orderBoardPath.value,
      ordersCount: visibleOrders.value.length,
      rawOrdersCount: workspaceOrders.value.length,
      incomingCount: incomingOrders.value.length,
      paymentCount: paymentOrders.value.length,
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
    captureIntent,
    selectedKitchen,
    kitchenId,
    storageKitchenId,
    collectionPath: orderBoardPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    orders: workspaceOrders,
    visibleOrders,
    ticketOrders,
    incomingOrders,
    scheduledOrders,
    startPreparation,
    paymentOrders,
    queueOrders,
    passOrders,
    recentOrders,
    unmappedOrders,
    railCounts,
    pending,
    outcome,
    readError,
    transitionError,
    numberingError,
    numberingPending,
    transitioningCount,
    isOrderTransitioning,
    acceptOrder,
    rejectOrder,
    returnOrderToQueue,
    markOrderReady,
    completeOrder,
    trashOrder,
    resetNumbering,
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
  const collection = order.collection
  if (
    !collection ||
    typeof collection !== 'object' ||
    Array.isArray(collection)
  ) {
    return ''
  }

  return String(collection.requested_for || '').trim()
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

const ordersAtStage = (orders: KitchenOrder[], stage: KitchenOrderBoardStage) =>
  sortOrders(
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
  return pickupMs ? pickupMs - defaultTargetMinutes * 60 * 1000 : createdMs
}
