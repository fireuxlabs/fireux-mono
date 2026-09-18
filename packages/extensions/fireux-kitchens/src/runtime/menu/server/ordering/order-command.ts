// Concurrent edit — 2026-07-20 15:11 CEST — Pre-order intake pass: require party size for advance table orders at the server boundary.
import { createError } from 'h3'
import type { KitchenOrderContactField } from '../../../kitchen/models/ordering.model'
import type {
  MenuOrderTypeConfig,
  MenuOrderingConfig,
} from '../../models/menu-ordering.model'
import type {
  MenuOrderingCollectionState,
  MenuOrderingRoomServiceState,
  MenuOrderingTableState,
} from '../../models/menu-order-draft.model'
import type {
  KitchenOrderChannel,
  KitchenOrderCustomer,
  KitchenOrderPaymentMethod,
  KitchenOrderType,
} from '../../../kitchen/utils/order.ts'
import { isMenuOrderingEnabled } from './config.ts'
import { tableChannelEnabled } from '../../../kitchen/utils/table-service'
import { readMenuOrderChannel } from './order-channels.ts'
import { readMenuOrderDestination } from './order-destination.ts'
import { menuOrderTypeStrategy } from './order-type.ts'
import type { CreateMenuOrderBody, RequestedMenuOrderItem } from './lines.ts'
import {
  resolveMenuOrderPaymentMethod,
  validateKitchenOrderDepositPolicy,
} from './payment.ts'
import { normalizeOrderType, readCustomer, text } from './order-request.ts'

export type MenuOrderSelection = {
  kitchenServiceId: string
  kitchenServiceName: string
  orderType: KitchenOrderType
  channel: KitchenOrderChannel
  orderTypeConfig?: MenuOrderTypeConfig
}

export type MenuOrderCommand = MenuOrderSelection & {
  actorId: string
  customerUid?: string
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

  const kitchenServiceId =
    typeof body?.kitchen_service_id === 'string'
      ? body.kitchen_service_id.trim()
      : ''
  const serviceTypes = ordering.order_types.filter(
    (config) => config.kitchen_service_id === kitchenServiceId
  )
  if (!kitchenServiceId || !serviceTypes.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a valid Kitchen service.',
    })
  }
  const allowedOrderTypes = serviceTypes.map((config) => config.type)
  const orderType = normalizeOrderType(body?.order_type, allowedOrderTypes)
  const channel = readMenuOrderChannel(body?.channel, orderType)
  const orderTypeConfig = serviceTypes.find((type) => type.type === orderType)
  if (orderTypeConfig && !tableChannelEnabled(orderTypeConfig, channel)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This table ordering option is switched off.',
    })
  }
  if (!orderTypeConfig?.service_hours?.operation_hours?.windows?.length) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Serving hours are unavailable for this Kitchen service.',
    })
  }
  if (orderTypeConfig?.availability?.paused) {
    throw createError({
      statusCode: 409,
      statusMessage:
        orderTypeConfig.availability.message ||
        'This ordering service is temporarily paused.',
    })
  }

  return {
    kitchenServiceId,
    kitchenServiceName: orderTypeConfig!.kitchen_service_name,
    orderType,
    channel,
    orderTypeConfig,
  }
}

export function prepareMenuOrderCommand(input: {
  actorId: string
  customerUid?: string
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
  validateRequiredCustomerFields(
    customer,
    input.selection.orderTypeConfig?.customer?.required_fields || []
  )
  validateOrderTypeCustomer(input.selection.orderType, customer)
  const destination = readMenuOrderDestination(
    input.body,
    menuOrderTypeStrategy(input.selection.orderType)
  )

  validateKitchenOrderDepositPolicy({
    orderTypeConfig: input.selection.orderTypeConfig,
    customer,
    currencyCode: input.currencyCode,
  })

  return {
    ...input.selection,
    actorId: input.actorId,
    ...(input.customerUid ? { customerUid: input.customerUid } : {}),
    paymentMethod,
    requestedFor,
    collection: destination.collection,
    customer,
    table: destination.table,
    roomService: destination.roomService,
    requestedItems: input.requestedItems,
  }
}

const customerFieldLabels: Record<KitchenOrderContactField, string> = {
  name: 'name',
  phone: 'mobile number',
  email: 'email address',
}

function validateRequiredCustomerFields(
  customer: KitchenOrderCustomer,
  requiredFields: KitchenOrderContactField[]
) {
  const missing = requiredFields.filter((field) => !text(customer[field]))
  if (!missing.length) return

  throw createError({
    statusCode: 400,
    statusMessage: `Add your ${missing.map((field) => customerFieldLabels[field]).join(', ')} before sending the order.`,
  })
}

function validateOrderTypeCustomer(
  orderType: KitchenOrderType,
  customer: KitchenOrderCustomer
) {
  if (orderType !== 'pre_order') return

  const partySize = Number(customer.party_size)
  if (!Number.isSafeInteger(partySize) || partySize < 1 || partySize > 500) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Add the number of guests for this pre-order.',
    })
  }
}

export function menuOrderIdempotencyRequest(
  command: MenuOrderCommand,
  defaultMenuId: string
) {
  return {
    channel: command.channel,
    ...(command.actorId !== 'menu' ? { actor_id: command.actorId } : {}),
    ...(command.customerUid ? { customer_uid: command.customerUid } : {}),
    kitchen_service_id: command.kitchenServiceId,
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
    ...(command.requestedFor ? { requested_for: command.requestedFor } : {}),
    ...(command.paymentMethod ? { payment_method: command.paymentMethod } : {}),
    ...(Object.keys(command.customer).length
      ? { customer: command.customer }
      : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService ? { room_service: command.roomService } : {}),
  }
}
