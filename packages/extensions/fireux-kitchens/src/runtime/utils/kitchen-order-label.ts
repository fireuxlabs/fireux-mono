const text = (value: unknown) => String(value ?? '').trim()

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function kitchenOrderServiceNumber(order: Record<string, unknown>) {
  const serviceNumber = Number(order.service_number)
  if (Number.isInteger(serviceNumber) && serviceNumber > 0) return serviceNumber

  const legacyNumber = Number(order.order_number)
  return Number.isInteger(legacyNumber) && legacyNumber > 0 ? legacyNumber : 0
}

export function kitchenOrderOperatorLabel(order: Record<string, unknown>) {
  const number = kitchenOrderServiceNumber(order)
  if (!number) return 'Order'

  const orderLabel = `Order ${number}`
  if (text(order.order_type) !== 'collection') return orderLabel

  const customerName = text(record(order.customer).name).split(/\s+/u)[0]
  return customerName ? `${customerName} · ${orderLabel}` : orderLabel
}
