import { createError } from 'h3'
import type {
  MenuOrderingConfig,
  MenuOrderTypeConfig,
} from '../../../models/kitchen/menu/menu.model.ts'
import type {
  MenuOrderingCollectionState,
  MenuOrderingRoomServiceState,
  MenuOrderingTableState,
} from '../../../models/kitchen/menu/menu-ordering.model.ts'
import type {
  KitchenOrderChannel,
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../models/kitchen/order.model.ts'
import { isMenuOrderingEnabled } from './config.ts'
import { readMenuOrderChannel } from './order-channels.ts'
import { readMenuOrderDestination } from './order-destination.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'
import type {
  CreateMenuOrderBody,
  RequestedMenuOrderItem,
} from './lines.ts'
import {
  resolveMenuOrderPaymentMethod,
  validateMenuOrderDepositPolicy,
} from './payment.ts'
import {
  normalizeOrderType,
  readCustomer,
  text,
} from './order-request.ts'

export type MenuOrderSelection = {
  orderType: KitchenOrderType
  channel: KitchenOrderChannel
  orderTypeConfig?: MenuOrderTypeConfig
}

export type MenuOrderCommand = MenuOrderSelection & {
  actorId: string
  paymentMethod?: KitchenOrderPaymentMethod
  requestedFor: string
  collection: MenuOrderingCollectionState | null
  customer: KitchenOrderCustomer
  table?: MenuOrderingTableState
  roomService?: MenuOrderingRoomServiceState
  requestedItems: RequestedMenuOrderItem[]
}

export function readMenuOrderSelection(
  body: CreateMenuOrderBody | null,
  ordering: MenuOrderingConfig
): MenuOrderSelection {
  if (!isMenuOrderingEnabled(ordering)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'This menu is not accepting orders yet.',
    })
  }

  const allowedOrderTypes = ordering.order_types.map((type) => type.type)
  const orderType = normalizeOrderType(body?.order_type, allowedOrderTypes)
  const channel = readMenuOrderChannel(body?.channel, orderType)

  return {
    orderType,
    channel,
    orderTypeConfig: ordering.order_types.find((type) =>
      type.type === orderType
    ),
  }
}

export function prepareMenuOrderCommand(input: {
  actorId: string
  body: CreateMenuOrderBody | null
  currencyCode: string
  requestedItems: RequestedMenuOrderItem[]
  selection: MenuOrderSelection
}): MenuOrderCommand {
  const paymentMethod = resolveMenuOrderPaymentMethod({
    orderTypeConfig: input.selection.orderTypeConfig,
    requestedPaymentMethod: input.body?.payment_method,
  })
  const requestedFor = text(input.body?.requested_for)
  const customer = readCustomer(input.body?.customer)
  const destination = readMenuOrderDestination(
    input.body,
    menuOrderTypeStrategy(input.selection.orderType)
  )

  validateMenuOrderDepositPolicy({
    orderTypeConfig: input.selection.orderTypeConfig,
    customer,
    currencyCode: input.currencyCode,
  })

  return {
    ...input.selection,
    actorId: input.actorId,
    paymentMethod,
    requestedFor,
    collection: destination.collection,
    customer,
    table: destination.table,
    roomService: destination.roomService,
    requestedItems: input.requestedItems,
  }
}

export function menuOrderIdempotencyRequest(
  command: MenuOrderCommand,
  defaultMenuId: string
) {
  return {
    channel: command.channel,
    ...(command.actorId !== 'menu' ? { actor_id: command.actorId } : {}),
    order_type: command.orderType,
    items: command.requestedItems.map((item) => ({
      item_id: item.itemId,
      menu_id: item.menuId || defaultMenuId,
      quantity: item.quantity,
      variant: item.variant
        ? {
            id: text(item.variant.id),
            label: text(item.variant.label),
          }
        : null,
      add_ons: item.addOns.map((addOn) => ({
        id: text(addOn.id),
        label: text(addOn.label),
      })),
    })),
    ...(command.collection ? { collection: command.collection } : {}),
    ...(command.requestedFor
      ? { requested_for: command.requestedFor }
      : {}),
    ...(command.paymentMethod
      ? { payment_method: command.paymentMethod }
      : {}),
    ...(Object.keys(command.customer).length
      ? { customer: command.customer }
      : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService
      ? { room_service: command.roomService }
      : {}),
  }
}
