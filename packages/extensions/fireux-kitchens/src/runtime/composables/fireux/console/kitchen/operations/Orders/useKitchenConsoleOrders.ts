import { computed } from 'vue'
import { useKitchenOrdersFetch } from './fetch/useKitchenOrdersFetch'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../models/order.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'
import { getDemoKitchenCollection } from '../../../../demo/kitchen/scenarios'
import { useKitchenOrderDelete } from './mutations/useKitchenOrderDelete'
import { useKitchenOrderStage } from './mutations/useKitchenOrderStage'

export function useKitchenConsoleOrders() {
  const {
    selection,
    runtime,
  } = useKitchenConsole()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
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
  const { trashKitchenOrder } = useKitchenOrderDelete({
    kitchenCollectionPath: rootCollection,
    databaseId,
  })
  const { stageKitchenOrder } = useKitchenOrderStage({
    kitchenCollectionPath: rootCollection,
    databaseId,
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
    consoleOrders.value.filter((order) => getOrderStatus(order) !== 'trashed')
  )
  const queueOrders = computed(() =>
    sortOrders(
      visibleOrders.value.filter((order) =>
        !isArchivedOrder(order) && !isPassOrder(order)
      )
    )
  )
  const passOrders = computed(() =>
    sortOrders(visibleOrders.value.filter(isPassOrder))
  )
  const archiveOrders = computed(() =>
    sortOrders(visibleOrders.value.filter(isArchivedOrder))
  )
  const ticketOrders = computed(() =>
    sortOrders(visibleOrders.value)
  )
  const debugOrder = (order: KitchenOrder) => ({
    id: order.id,
    orderNumber: order.order_number || '',
    status: order.status || '',
    orderType: order.order_type || getServiceMode(order) || '',
    fireState: order.fire_state || '',
    requestedFor: orderValue(order, [
      'requested_for',
      'pickup_at',
      'pickup_time',
      'collection_at',
      'due_at',
    ]) || '',
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
    queue: queueOrders.value.map(debugOrder),
    pass: passOrders.value.map(debugOrder),
    archive: archiveOrders.value.map(debugOrder),
  }))
  const debugCount = (match: (order: KitchenOrder) => boolean) =>
    consoleOrders.value.filter(match).length
  const moveOrderToStage = async (
    stage: 'queue' | 'pass' | 'archive',
    orderId: string
  ) => {
    if (readOnly.value || !canWrite.value) return
    await stageKitchenOrder(kitchenId.value, orderId, stage)
  }
  const queueOrder = (orderId: string) => moveOrderToStage('queue', orderId)
  const passOrder = (orderId: string) => moveOrderToStage('pass', orderId)
  const archiveOrder = (orderId: string) =>
    moveOrderToStage('archive', orderId)
  const trashOrder = async (orderId: string) => {
    if (readOnly.value || !canWrite.value) return
    await trashKitchenOrder(kitchenId.value, orderId)
  }
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
      queueCount: queueOrders.value.length,
      passCount: passOrders.value.length,
      archiveCount: archiveOrders.value.length,
      openCount: debugCount((order) => order.status === 'open'),
      preOrderCount: debugCount((order) => order.order_type === 'pre_order'),
      heldCount: debugCount((order) => order.fire_state === 'held'),
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
    queueOrders,
    passOrders,
    archiveOrders,
    pending,
    queueOrder,
    passOrder,
    archiveOrder,
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

const orderValue = (order: KitchenOrder, keys: string[]) => {
  const source = order as Record<string, unknown>
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

const getCreatedMs = (order: KitchenOrder) =>
  timestampMs((order as any).created?.at) ||
  timestampMs((order as any).created_at) ||
  timestampMs((order as any).updated?.at) ||
  timestampMs((order as any).updated_at)

const getPickupMs = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  return timestampMs(
    orderValue(order, [
      'requested_for',
      'pickup_at',
      'pickup_time',
      'collection_at',
      'due_at',
    ]),
    createdMs
  )
}

const getServiceMode = (order: KitchenOrder) => {
  const value = String(
    orderValue(order, [
      'order_type',
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'channel',
    ]) ?? ''
  )
    .trim()
    .toLowerCase()

  if (['collection', 'collect', 'pickup', 'pick_up'].includes(value)) {
    return 'collection'
  }
  if (['delivery', 'deliver'].includes(value)) return 'delivery'
  return value
}

const getOrderStatus = (order: KitchenOrder) =>
  String(order.status || '').trim().toLowerCase()

const getFireState = (order: KitchenOrder) =>
  String(order.fire_state || '').trim().toLowerCase()

const isArchivedOrder = (order: KitchenOrder) =>
  ['archived', 'closed'].includes(getOrderStatus(order))

const isPassOrder = (order: KitchenOrder) =>
  ['on_pass', 'pass'].includes(getOrderStatus(order)) ||
  getFireState(order) === 'ready_to_fire'

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
  if (getServiceMode(order) !== 'collection') return createdMs

  const pickupMs = getPickupMs(order)
  return pickupMs
    ? pickupMs - defaultTargetMinutes * 60 * 1000
    : createdMs
}
