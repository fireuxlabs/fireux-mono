import { FieldValue } from 'firebase-admin/firestore'
import type { MenuOrderCommand } from './order-command.ts'
import type { MenuOrderContext } from './context.ts'
import type { ResolvedMenuOrderItem } from './order-items.ts'
import type { ResolvedMenuOrderFulfilment } from './order-fulfilment.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'
import {
  numberValue,
  orderId,
  orderNumber,
} from './order-request.ts'

export type MenuOrderRecordIdentity = {
  id: string
  number: string
  receiptCreatedAt: string
  timestamp: FieldValue
}

export function createMenuOrderRecordIdentity(): MenuOrderRecordIdentity {
  return {
    id: orderId(),
    number: orderNumber(),
    receiptCreatedAt: new Date().toISOString(),
    timestamp: FieldValue.serverTimestamp(),
  }
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
  const {
    command,
    context,
    fulfilment,
    identity,
  } = input
  const strategy = menuOrderTypeStrategy(command.orderType)
  const path =
    `apps/${context.appId}/kitchens/${context.kitchenId}/orders/${identity.id}`
  const receiptItems = input.items.map((item) => ({
    id: item.id,
    menu_id: item.menu_id,
    label: item.label,
    quantity: item.quantity,
    unit_price_chf: numberValue(item.unit_price),
    total_chf:
      numberValue(item.unit_price) *
      Math.max(1, Number(item.quantity || 1) || 1),
    ...(item.add_ons?.length ? { add_ons: item.add_ons } : {}),
    ...(item.variant_label ? { variant_label: item.variant_label } : {}),
  }))
  const payload = {
    id: identity.id,
    kitchen_id: context.kitchenId,
    menu_id: context.menuId,
    order_number: identity.number,
    status: fulfilment.status,
    order_type: command.orderType,
    ...(strategy.recordsRequestedFor && command.requestedFor
      ? { requested_for: command.requestedFor }
      : {}),
    ...(command.collection ? { collection: command.collection } : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService
      ? { room_service: command.roomService }
      : {}),
    estimated_ready_minutes: 0,
    estimated_ready_at: '',
    ...(Object.keys(fulfilment.customer).length
      ? { customer: fulfilment.customer }
      : {}),
    ...(fulfilment.matchSnapshot
      ? { fulfilment_match: fulfilment.matchSnapshot }
      : {}),
    ...(fulfilment.policySnapshot
      ? { fulfilment_policy: fulfilment.policySnapshot }
      : {}),
    channel: command.channel,
    ...(command.actorId !== 'menu'
      ? { creator_id: command.actorId }
      : {}),
    items: input.items,
    payment: fulfilment.payment,
    created_at: identity.timestamp,
    updated_at: identity.timestamp,
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
  const response = {
    id: identity.id,
    path,
    order_number: identity.number,
    status: fulfilment.status,
    order_type: command.orderType,
    channel: command.channel,
    ...(command.collection ? { collection: command.collection } : {}),
    ...(command.table ? { table: command.table } : {}),
    ...(command.roomService
      ? { room_service: command.roomService }
      : {}),
    receipt: {
      id: identity.id,
      order_number: identity.number,
      order_type: command.orderType,
      channel: command.channel,
      status: fulfilment.status,
      created_at: identity.receiptCreatedAt,
      ...(strategy.recordsRequestedFor && command.requestedFor
        ? { requested_for: command.requestedFor }
        : {}),
      ...(command.collection ? { collection: command.collection } : {}),
      ...(command.table ? { table: command.table } : {}),
      ...(command.roomService
        ? { room_service: command.roomService }
        : {}),
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
  }
}
