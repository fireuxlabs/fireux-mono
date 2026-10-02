// Concurrent edit — 2026-07-19 21:10 CEST — Pre-order WhatsApp pass: snapshot a pending Kitchen alert atomically with its Order.
// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: hash the customer capability on Order and return the raw token only from creation.
// Concurrent edit — 2026-07-21 16:24 CEST — FireUX Finance pass: persist currency-aware minor-unit pricing with every new Order.
import { FieldValue } from 'firebase-admin/firestore'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { KitchenOrderFulfilmentMatch } from '../../../kitchen/utils/order.ts'
import { menuRoutePath } from '../../../kitchen/utils/kitchen-menu-route.ts'
import { normalizeKitchenOrderWhatsAppPhone } from '../../../kitchen/utils/ordering-whatsapp.ts'
import type { MenuOrderCommand } from './order-command.ts'
import type { MenuOrderContext } from './context.ts'
import type { ResolvedMenuOrderItem } from './order-items.ts'
import type { ResolvedMenuOrderFulfilment } from './order-fulfilment.ts'
import type { MenuOrderTypeStrategy } from './order-type.ts'
import { menuOrderTypeStrategy } from './order-type.ts'
import { createMenuOrderCapability } from './order-capability.ts'
import { createKitchenOrderPricing } from '../../../kitchen/server/orders/pricing.ts'
import { numberValue, orderId, orderNumber } from './order-request.ts'

export type MenuOrderRecordIdentity = {
  capabilityHash: string
  capabilityToken: string
  id: string
  number: string
  receiptCreatedAt: string
  timestamp: FieldValue
}

export function createMenuOrderRecordIdentity(): MenuOrderRecordIdentity {
  const capability = createMenuOrderCapability()

  return {
    capabilityHash: capability.hash,
    capabilityToken: capability.token,
    id: orderId(),
    number: orderNumber(),
    receiptCreatedAt: new Date().toISOString(),
    timestamp: FieldValue.serverTimestamp(),
  }
}

function counterReference(identity: MenuOrderRecordIdentity) {
  const fragment = identity.id
    .split('-')
    .pop()
    ?.replace(/[^a-z0-9]/gi, '')
    .slice(0, 4)
    .toUpperCase()

  return fragment || identity.number.slice(-4).toUpperCase()
}

function simpleFulfilmentMatch(
  command: MenuOrderCommand,
  strategy: MenuOrderTypeStrategy,
  identity: MenuOrderRecordIdentity
): KitchenOrderFulfilmentMatch | undefined {
  if (strategy.handoff === 'table_service' && command.table?.number) {
    return {
      type: 'table',
      reference: command.table.number,
      handoff: 'table_service',
    }
  }
  if (strategy.handoff === 'tray' || strategy.handoff === 'bag') {
    return {
      type: 'counter',
      reference: counterReference(identity),
      handoff: strategy.handoff,
    }
  }

  return undefined
}

export function assembleMenuOrderRecord(input: {
  command: MenuOrderCommand
  context: MenuOrderContext
  currencyCode: string
  fulfilment: ResolvedMenuOrderFulfilment
  identity: MenuOrderRecordIdentity
  items: ResolvedMenuOrderItem[]
  subtotal: number
}) {
  const { command, context, fulfilment, identity } = input
  const strategy = menuOrderTypeStrategy(command.orderType)
  const pricing = createKitchenOrderPricing({
    currencyCode: input.currencyCode,
    subtotal: input.subtotal,
    deliveryFee: fulfilment.deliveryFee,
    total: fulfilment.total,
  })
  const fulfilmentMatch =
    fulfilment.matchSnapshot ||
    simpleFulfilmentMatch(command, strategy, identity)
  const whatsappRecipient =
    command.orderType === 'pre_order' &&
    command.orderTypeConfig?.notifications?.whatsapp?.enabled === true
      ? normalizeKitchenOrderWhatsAppPhone(
          command.orderTypeConfig.notifications.whatsapp.recipient_phone
        )
      : ''
  const path = `kitchens/${context.kitchenId}/orders/${identity.id}`
  const receiptItems = input.items.map((item) => ({
    id: item.id,
    source_item_id: item.source_item_id,
    ...(item.sellable_id
      ? {
          sellable_id: item.sellable_id,
          sellable_revision: item.sellable_revision,
        }
      : {}),
    menu_id: item.menu_id,
    label: item.label,
    quantity: item.quantity,
    unit_price_chf: numberValue(item.unit_price),
    total_chf:
      numberValue(item.unit_price) *
      Math.max(1, Number(item.quantity || 1) || 1),
    ...(item.add_ons?.length ? { add_ons: item.add_ons } : {}),
    ...(item.variant_label ? { variant_label: item.variant_label } : {}),
    ...(item.variant_id ? { variant_id: item.variant_id } : {}),
  }))
  const payload = {
    id: identity.id,
    kitchen_id: context.kitchenId,
    menu_id: context.menuId,
    order_number: identity.number,
    status: fulfilment.status,
    kitchen_service_id: command.kitchenServiceId,
    kitchen_service_name: command.kitchenServiceName,
    order_type: command.orderType,
    ...(command.channel !== 'staff_pos'
      ? { customer_capability_hash: identity.capabilityHash }
      : {}),
    ...(command.customerUid ? { customer_uid: command.customerUid } : {}),
    ...(strategy.recordsRequestedFor && command.requestedFor
      ? { requested_for: command.requestedFor }
      : {}),
    ...(command.collection ? { collection: command.collection } : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService ? { room_service: command.roomService } : {}),
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    ...(Object.keys(fulfilment.customer).length
      ? { customer: fulfilment.customer }
      : {}),
    ...(fulfilmentMatch ? { fulfilment_match: fulfilmentMatch } : {}),
    ...(fulfilment.policySnapshot
      ? { fulfilment_policy: fulfilment.policySnapshot }
      : {}),
    channel: command.channel,
    items: input.items,
    pricing,
    payment: fulfilment.payment,
    ...(whatsappRecipient
      ? {
          notifications: {
            whatsapp: {
              recipient_phone: whatsappRecipient,
              state: 'pending',
              attempts: 0,
              created_at: identity.timestamp,
              updated_at: identity.timestamp,
            },
          },
        }
      : {}),
    created: {
      at: identity.timestamp,
      by: command.actorId,
      app_id: context.appId,
    },
    updated: {
      at: identity.timestamp,
      by: command.actorId,
    },
  }
  const customerOrderLink = command.customerUid
    ? {
        customerUid: command.customerUid,
        orderId: identity.id,
        payload: {
          id: identity.id,
          order_path: path,
          app_id: context.appId,
          kitchen_id: context.kitchenId,
          kitchen_name: context.kitchenName || '',
          menu_id: context.menuId,
          menu_name:
            readRecordString(context.menuData, 'name') || context.menuId,
          menu_path: menuRoutePath({
            scope: context.routeScope,
            menuId: context.routeMenuId,
            serviceId: command.kitchenServiceId,
            context:
              command.orderType === 'delivery' ||
              command.orderType === 'collection' ||
              command.orderType === 'pre_order'
                ? command.orderType
                : 'generic',
          }),
          created_at: identity.timestamp,
        },
      }
    : undefined
  const response = {
    id: identity.id,
    ...(command.channel !== 'staff_pos'
      ? { capability_token: identity.capabilityToken }
      : {}),
    path,
    order_number: identity.number,
    status: fulfilment.status,
    kitchen_service_id: command.kitchenServiceId,
    kitchen_service_name: command.kitchenServiceName,
    order_type: command.orderType,
    channel: command.channel,
    ...(command.collection ? { collection: command.collection } : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService ? { room_service: command.roomService } : {}),
    ...(fulfilmentMatch ? { fulfilment_match: fulfilmentMatch } : {}),
    receipt: {
      id: identity.id,
      order_number: identity.number,
      kitchen_service_id: command.kitchenServiceId,
      kitchen_service_name: command.kitchenServiceName,
      order_type: command.orderType,
      channel: command.channel,
      status: fulfilment.status,
      created_at: identity.receiptCreatedAt,
      ...(strategy.recordsRequestedFor && command.requestedFor
        ? { requested_for: command.requestedFor }
        : {}),
      ...(command.collection ? { collection: command.collection } : {}),
      ...(command.table ? { table: command.table } : {}),
      ...(command.roomService ? { room_service: command.roomService } : {}),
      ...(fulfilmentMatch ? { fulfilment_match: fulfilmentMatch } : {}),
      currency: input.currencyCode,
      subtotal_chf: input.subtotal,
      ...(fulfilment.deliveryFee
        ? { delivery_fee_chf: fulfilment.deliveryFee }
        : {}),
      total_chf: fulfilment.total,
      payment: fulfilment.payment,
      ...(Object.keys(fulfilment.customer).length
        ? { customer: fulfilment.customer }
        : {}),
      items: receiptItems,
      kitchen: {
        id: context.kitchenId,
      },
      menu: {
        id: context.menuId,
      },
    },
    payment: fulfilment.payment,
  }

  return {
    id: identity.id,
    path,
    payload,
    response,
    customerOrderLink,
  }
}
