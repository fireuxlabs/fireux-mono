import { serverTimestamp } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestoreCreate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreCreate'
import { resolveKitchenScopeCollectionPath } from '../../../../../firestore/kitchen/utils/paths/useKitchenChildCollection'
import {
  KitchenOrderStorage,
  type KitchenOrder,
  type KitchenOrderCustomer,
  type KitchenOrderFireState,
  type KitchenOrderItem,
  type KitchenOrderRoomService,
  type KitchenOrderTable,
  type KitchenOrderType,
} from '../../../../../../../models/kitchen/order.model'

type CreateKitchenOrderInput = {
  kitchenId: string
  dish_id?: string
  label?: string
  items?: KitchenOrderItem[]
  quantity?: number
  order_type?: KitchenOrderType
  requested_for?: string
  fire_state?: KitchenOrderFireState
  currency_code?: string
  kitchenCollectionPath?: string
  app_id?: string
  creator_id?: string
  customer?: KitchenOrderCustomer
  room_service?: KitchenOrderRoomService
  table?: KitchenOrderTable
  kitchen_note?: string
}

const makeOrderId = () => {
  const now = Date.now()
  const rand = Math.random().toString(16).slice(2)
  return `order-${now}-${rand}`
}

const makeOrderNumber = () => {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}${m}${d}-${hh}${mm}`
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeOrderType = (value: unknown): KitchenOrderType => {
  const type = normalizeString(value)
  if (
    type === 'dine_in' ||
    type === 'eat_in' ||
    type === 'takeaway' ||
    type === 'collection' ||
    type === 'delivery' ||
    type === 'pre_order' ||
    type === 'room_service'
  ) {
    return type
  }

  return 'dine_in'
}
const normalizeFireState = (value: unknown): KitchenOrderFireState => {
  const state = normalizeString(value)
  if (state === 'ready_to_fire' || state === 'held') return state
  return 'fired'
}

export function useKitchenOrderCreate() {
  const { setDocument } = useFirestoreCreate()
  const { appId } = useFireUXConfig()

  const createOrder = async (input: CreateKitchenOrderInput) => {
    const kitchenId = normalizeString(input.kitchenId)
    if (!kitchenId) throw new Error('Missing kitchenId')
    const currencyCode = normalizeString(input.currency_code).toUpperCase()
    if (!currencyCode) throw new Error('Missing kitchen currency_code')

    const kitchenCollectionPath =
      normalizeString(input.kitchenCollectionPath) || resolveKitchenScopeCollectionPath(appId)

    const orderId = makeOrderId()
    const orderType = normalizeOrderType(input.order_type)
    const fireState = normalizeFireState(input.fire_state)
    const requestedFor = normalizeString(input.requested_for)
    const collection = orderType === 'collection'
      ? requestedFor
        ? { mode: 'scheduled' as const, requested_for: requestedFor }
        : { mode: 'queue' as const }
      : {}

    const items = Array.isArray(input.items) && input.items.length
      ? input.items.map((item, index) => ({
          ...item,
          id: normalizeString(item.id) || `item-${index + 1}`,
          dish_id: normalizeString(item.dish_id),
          label: normalizeString(item.label),
          quantity: Math.max(1, Number(item.quantity || 1)),
          checked: Boolean(item.checked),
        }))
      : [
          {
            id: 'item-1',
            dish_id: normalizeString(input.dish_id),
            label: normalizeString(input.label),
            quantity: Number(input.quantity || 1),
            checked: false,
          },
        ]

    if (!items.every((item) => item.dish_id && item.label)) {
      throw new Error('Order items need dish ids and labels.')
    }

    const payload: KitchenOrder = {
      id: orderId,
      kitchen_id: kitchenId,

      order_number: makeOrderNumber(),
      status: 'open',
      order_type: orderType,
      requested_for: (orderType === 'collection' ? '' : requestedFor) as any,
      collection,
      table: input.table || {},
      room_service: input.room_service || {},
      estimated_ready_minutes: 0,
      estimated_ready_at: '' as any,
      fire_state: fireState,

      items,
      fulfilment_policy: {},
      fulfilment_match: {},
      driver_responses: {},
      customer: input.customer || {},
      kitchen_note: normalizeString(input.kitchen_note),
      payment: {
        required: false,
        status: 'not_required',
        currency_code: currencyCode,
      },

      app_id: (input.app_id || appId || '') as any,
      creator_id: (input.creator_id || '') as any,
      channel: 'staff_pos',
      created_at: serverTimestamp() as any,
      updated_at: serverTimestamp() as any,
      created: {
        at: serverTimestamp() as any,
        by: (input.creator_id || '') as any,
        app_id: (input.app_id || appId || '') as any,
      },
      updated: {
        at: serverTimestamp() as any,
        by: (input.creator_id || '') as any,
      },
    }

    await setDocument<KitchenOrder>(
      `${kitchenCollectionPath}/${kitchenId}/${KitchenOrderStorage.collection}`,
      orderId,
      payload,
      { stamp: false }
    )

    return orderId
  }

  return { createOrder }
}
