import { computed } from 'vue'
import { useKitchenOrdersFetch } from './fetch/useKitchenOrdersFetch'
import {
  KitchenOrderStorage,
  type KitchenOrder,
} from '../../../../../../models/order.model'
import { useKitchenConsole } from '../../core/useKitchenConsole'
import { useKitchenConsoleReadPage } from '../Shared/useKitchenConsoleReadPage'

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
  const { orders, pending: ordersPending, ordersPath } =
    useKitchenOrdersFetch(fetchKitchenId, {
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
  const consoleOrders = computed(() => page.collection.value.items)
  const pending = computed(() => page.collection.value.pending)
  const ticketOrders = computed(() =>
    [...consoleOrders.value].sort((a, b) => {
      const aTime = getRailTime(a)
      const bTime = getRailTime(b)
      if (aTime !== bTime) return aTime - bTime
      return String(a.order_number || a.id).localeCompare(
        String(b.order_number || b.id)
      )
    })
  )
  const isNextTicket = (index: number) => {
    if (!ticketOrders.value.length) return false

    return ticketRailNextPosition === 'left'
      ? index === 0
      : index === ticketOrders.value.length - 1
  }
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    databaseId: databaseId.value,
    collectionPath: ordersPath.value,
    count: consoleOrders.value.length,
    pending: pending.value,
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath: ordersPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    orders: consoleOrders,
    ticketOrders,
    isNextTicket,
    pending,
    debug,
  }
}

const defaultTargetMinutes = 15
// TODO: move this to /console/kitchen/orders/settings when ticket rail settings exist.
const ticketRailNextPosition: 'left' | 'right' = 'left'

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
      'pickup_at',
      'pickup_time',
      'collection_at',
      'requested_for',
      'due_at',
    ]),
    createdMs
  )
}

const getServiceMode = (order: KitchenOrder) => {
  const value = String(
    orderValue(order, [
      'service_mode',
      'serviceMode',
      'fulfilment_type',
      'fulfillment_type',
      'order_type',
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

const getRailTime = (order: KitchenOrder) => {
  const createdMs = getCreatedMs(order)
  if (getServiceMode(order) !== 'collection') return createdMs

  const pickupMs = getPickupMs(order)
  return pickupMs
    ? pickupMs - defaultTargetMinutes * 60 * 1000
    : createdMs
}
