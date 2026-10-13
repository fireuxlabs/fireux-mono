import {
  OrderChannels,
  type Order,
  type OrderLine,
  type OrderChannel,
  type OrderingConfiguration,
} from '../models/order.model'

/** Creates an in-memory draft; submission, authority and persistence are separate. */
export function createOrderDraft(
  identity: { id: string; number: string },
  channel: unknown,
  configuration: unknown
): Order {
  if (!identity.id.trim() || !identity.number.trim())
    throw new Error('Order identity is required.')
  return {
    ...identity,
    channel: requireOrderChannel(channel, configuration),
    lines: [],
  }
}

export function readOrderingConfiguration(
  value: unknown
): OrderingConfiguration {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Ordering channels must be declared by the App.')
  const channels = (value as Record<string, unknown>).channels
  if (
    !Array.isArray(channels) ||
    channels.some(
      (channel) => !OrderChannels.includes(channel as OrderChannel)
    ) ||
    new Set(channels).size !== channels.length
  )
    throw new Error('Ordering channel declaration is invalid.')
  return { channels: [...channels] as OrderChannel[] }
}

export function requireOrderChannel(
  value: unknown,
  configuration: unknown
): OrderChannel {
  const { channels } = readOrderingConfiguration(configuration)
  if (!channels.includes(value as OrderChannel))
    throw new Error('This ordering channel is not supported by the App.')
  return value as OrderChannel
}

/** Adds one distinct line. Its identity is supplied by the caller, unique within this Order. */
export function addOrderLine(order: Order, line: OrderLine): Order {
  if (!line || typeof line !== 'object' || Array.isArray(line))
    throw new Error('Enter a valid order line.')
  const id = typeof line.id === 'string' ? line.id.trim() : ''
  const name = typeof line.item?.name === 'string' ? line.item.name.trim() : ''
  const unitCode =
    typeof line.unit_code === 'string' ? line.unit_code.trim() : ''
  if (!id || id.length > 128)
    throw new Error('Order line identity must be 1 to 128 characters.')
  if (order.lines.some((existing) => existing.id === id))
    throw new Error('Order line identity must be unique within the order.')
  if (!name || name.length > 300)
    throw new Error('Order item name must be 1 to 300 characters.')
  if (
    typeof line.quantity !== 'number' ||
    !Number.isFinite(line.quantity) ||
    line.quantity <= 0
  )
    throw new Error('Order line quantity must be a positive finite number.')
  if (!unitCode || unitCode.length > 32)
    throw new Error('Order line unit code must be 1 to 32 characters.')
  return {
    ...order,
    lines: [
      ...order.lines,
      { id, item: { name }, quantity: line.quantity, unit_code: unitCode },
    ],
  }
}

/** Updates only an existing line's quantity; zero never implicitly removes it. */
export function updateOrderLineQuantity(
  order: Order,
  lineId: string,
  quantity: number
): Order {
  if (!order.lines.some((line) => line.id === lineId))
    throw new Error('Order line was not found.')
  if (
    typeof quantity !== 'number' ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  )
    throw new Error('Order line quantity must be a positive finite number.')
  return {
    ...order,
    lines: order.lines.map((line) =>
      line.id === lineId ? { ...line, quantity } : line
    ),
  }
}

export function removeOrderLine(order: Order, lineId: string): Order {
  if (!order.lines.some((line) => line.id === lineId))
    throw new Error('Order line was not found.')
  return { ...order, lines: order.lines.filter((line) => line.id !== lineId) }
}

export const OrderDraftCollection = 'order-drafts'

/** Strict detached Order input, shared by storage and trusted commands. */
export function readOrder(value: unknown): Order {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Order is invalid.')
  const row = value as Record<string, unknown>
  if (
    Object.keys(row).some(
      (key) => !['id', 'number', 'channel', 'lines'].includes(key)
    ) ||
    typeof row.id !== 'string' ||
    !row.id.trim() ||
    row.id.length > 128 ||
    typeof row.number !== 'string' ||
    !row.number.trim() ||
    row.number.length > 120 ||
    !Array.isArray(row.lines) ||
    row.lines.length > 200
  )
    throw new Error('Order is invalid.')
  let order = createOrderDraft(
    { id: row.id.trim(), number: row.number.trim() },
    row.channel,
    { channels: [...OrderChannels] }
  )
  for (const value of row.lines) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('Order line is invalid.')
    const line = value as Record<string, unknown>
    const item = line.item as Record<string, unknown> | undefined
    if (
      Object.keys(line).some(
        (key) => !['id', 'item', 'quantity', 'unit_code'].includes(key)
      ) ||
      typeof line.id !== 'string' ||
      line.id.length > 128 ||
      !item ||
      typeof item !== 'object' ||
      Array.isArray(item) ||
      Object.keys(item).some((key) => key !== 'name') ||
      typeof item.name !== 'string' ||
      item.name.length > 300 ||
      typeof line.unit_code !== 'string' ||
      line.unit_code.length > 32
    )
      throw new Error('Order line is invalid.')
    order = addOrderLine(order, line as unknown as OrderLine)
  }
  return order
}

export function readSavedOrderDraft(
  id: string,
  value: unknown,
  kitchenId: string
): import('../models/order.model').SavedOrderDraft {
  if (!value || typeof value !== 'object')
    throw new Error('Saved draft is invalid.')
  const row = value as Record<string, unknown>
  if (
    row.schema_version !== 1 ||
    row.kitchen_id !== kitchenId ||
    !Number.isSafeInteger(row.revision) ||
    Number(row.revision) < 1
  )
    throw new Error('Saved draft is invalid.')
  return {
    order: readOrder({
      id,
      number: row.number,
      channel: row.channel,
      lines: row.lines,
    }),
    revision: Number(row.revision),
  }
}
