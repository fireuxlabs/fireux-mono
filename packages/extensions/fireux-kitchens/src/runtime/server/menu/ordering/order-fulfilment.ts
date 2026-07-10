import { createError } from 'h3'
import type { MenuOrderingConfig } from '../../../models/kitchen/menu/menu.model.ts'
import type {
  KitchenOrderCustomer,
  KitchenOrderPayment,
} from '../../../models/kitchen/order.model.ts'
import {
  checkMenuDeliveryAddress,
  checkMenuDeliveryPlaceId,
  resolveMenuDeliveryOrigin,
  type MenuDeliveryAddressResult,
} from './delivery-address.ts'
import type { MenuOrderCommand } from './order-command.ts'
import type { MenuOrderContext } from './context.ts'
import { menuOrderTypeStrategy } from './order-types/index.ts'
import { resolveMenuOrderPayment } from './payment.ts'
import {
  money,
  numberValue,
} from './order-request.ts'
import { validateMenuOrderSchedule } from './schedule.ts'

export type ResolvedMenuOrderFulfilment = {
  customer: KitchenOrderCustomer
  deliveryFee: number
  deliveryMinimum: number
  matchSnapshot?: Record<string, unknown>
  payment: KitchenOrderPayment
  policySnapshot?: Record<string, unknown>
  status: string
  total: number
}

export async function resolveMenuOrderFulfilment(input: {
  command: MenuOrderCommand
  context: MenuOrderContext
  currencyCode: string
  ordering: MenuOrderingConfig
  subtotal: number
}): Promise<ResolvedMenuOrderFulfilment> {
  const { command } = input
  const strategy = menuOrderTypeStrategy(command.orderType)
  validateMenuOrderSchedule({
    collection: command.collection,
    hours: input.ordering.service_hours?.operation_hours,
    noticeHours: command.orderTypeConfig?.notice_hours,
    orderType: command.orderType,
    requestedFor: command.requestedFor,
  })

  let customer = command.customer
  let delivery: MenuDeliveryAddressResult | null = null
  if (strategy.resolvesDelivery) {
    const zones = command.orderTypeConfig?.fulfilment?.delivery_zones || []
    const origin = await resolveMenuDeliveryOrigin(
      input.context.kitchenPlaceId || input.context.kitchenId,
      zones
    )
    delivery = customer.address_place_id
      ? await checkMenuDeliveryPlaceId(customer.address_place_id, zones, origin)
      : await checkMenuDeliveryAddress(customer.address || '', zones, origin)
    if (!delivery.deliverable) {
      throw createError({
        statusCode: 400,
        statusMessage:
          delivery.reason || 'This address is outside the delivery area.',
      })
    }

    const verifiedAddress = delivery.address
    if (verifiedAddress?.formatted) {
      customer = {
        ...customer,
        address: verifiedAddress.formatted,
        ...(verifiedAddress.place_id
          ? { address_place_id: verifiedAddress.place_id }
          : {}),
      }
      if (!verifiedAddress.place_id) delete customer.address_place_id
    }
  }

  const deliveryMinimum = numberValue(delivery?.zone?.min_order_chf)
  if (
    strategy.resolvesDelivery &&
    delivery?.zone &&
    deliveryMinimum > 0 &&
    input.subtotal < deliveryMinimum
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        `Minimum order is ${money(deliveryMinimum, input.currencyCode)} ` +
        'for this delivery area.',
    })
  }

  const deliveryFee = numberValue(delivery?.zone?.fee_chf)
  const total = input.subtotal + deliveryFee
  const payment = resolveMenuOrderPayment({
    orderType: command.orderType,
    orderTypeConfig: command.orderTypeConfig,
    customer,
    currencyCode: input.currencyCode,
    paymentMethod: command.paymentMethod,
    subtotalChf: input.subtotal,
    totalChf: total,
  })
  const paymentRequired = payment.required && payment.status !== 'paid'
  const status = paymentRequired
    ? 'pending_payment'
    : strategy.initialStatus
  const policySnapshot = command.orderTypeConfig
    ? {
        order_type: command.orderTypeConfig.type,
        ...(command.orderTypeConfig.notice_hours
          ? { notice_hours: command.orderTypeConfig.notice_hours }
          : {}),
        ...(command.orderTypeConfig.message
          ? { message: command.orderTypeConfig.message }
          : {}),
        ...(command.orderTypeConfig.fulfilment
          ? { ...command.orderTypeConfig.fulfilment }
          : {}),
      }
    : undefined
  const matchSnapshot = delivery?.zone
    ? {
        type: 'delivery_zone',
        zone: delivery.zone,
        delivery_address: delivery.address,
        subtotal_chf: input.subtotal,
        fee_chf: deliveryFee,
        min_order_chf: deliveryMinimum,
      }
    : undefined

  return {
    customer,
    deliveryFee,
    deliveryMinimum,
    matchSnapshot,
    payment,
    policySnapshot,
    status,
    total,
  }
}
