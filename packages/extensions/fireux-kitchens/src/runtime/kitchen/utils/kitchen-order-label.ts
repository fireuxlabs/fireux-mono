type KitchenOrderLabelInput = {
  service_number?: unknown
  order_number?: unknown
  order_type?: unknown
  customer?: unknown
}

const text = (value: unknown) => String(value ?? '').trim()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function kitchenOrderServiceNumber(order: KitchenOrderLabelInput) {
  const serviceNumber = Number(order.service_number)
  if (Number.isInteger(serviceNumber) && serviceNumber > 0) return serviceNumber

  const legacyNumber = Number(order.order_number)
  return Number.isInteger(legacyNumber) && legacyNumber > 0 ? legacyNumber : 0
}

export function kitchenOrderOperatorLabel(order: KitchenOrderLabelInput) {
  const number = kitchenOrderServiceNumber(order)
  if (!number) return 'Order'

  const orderLabel = `Order: ${number}`
  if (text(order.order_type) !== 'collection') return orderLabel

  const customerName = kitchenOrderCollectionCustomerName(order)
  return customerName ? `${orderLabel}-${customerName}` : orderLabel
}

export function kitchenOrderTicketFooterLabel(
  order: KitchenOrderLabelInput,
  placedTime = ''
) {
  const number = kitchenOrderServiceNumber(order)
  const customerName =
    text(order.order_type) === 'collection'
      ? kitchenOrderCollectionCustomerName(order)
      : ''

  return [number ? `Order ${number}` : 'Order', customerName, text(placedTime)]
    .filter(Boolean)
    .join(' - ')
}

function kitchenOrderCollectionCustomerName(order: KitchenOrderLabelInput) {
  return text(record(order.customer).name).split(/\s+/u)[0]
}
