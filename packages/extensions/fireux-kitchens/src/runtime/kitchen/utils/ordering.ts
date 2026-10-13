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
  if (!identity.id.trim() || typeof identity.number !== 'string')
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
  const itemId = line.item.id
  if (itemId !== undefined && (typeof itemId !== 'string' || !itemId.trim() || itemId.length > 128)) throw new Error('Order item reference is invalid.')
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
      { id, item: { ...(itemId !== undefined ? { id: itemId.trim() } : {}), name }, quantity: line.quantity, unit_code: unitCode },
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
      (key) => !['id', 'number', 'channel', 'lines', 'placed_by', 'location', 'fulfilment', 'customer', 'delivery_address', 'requested_at'].includes(key)
    ) ||
    typeof row.id !== 'string' ||
    !row.id.trim() ||
    row.id.length > 128 ||
    typeof row.number !== 'string' ||
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
      Object.keys(item).some((key) => !['id', 'name'].includes(key)) ||
      typeof item.name !== 'string' ||
      item.name.length > 300 ||
      typeof line.unit_code !== 'string' ||
      line.unit_code.length > 32
    )
      throw new Error('Order line is invalid.')
    order = addOrderLine(order, line as unknown as OrderLine)
  }
  if (row.placed_by !== undefined) {
    const context = readOrderContext(row.placed_by, true)
    order.placed_by = context as NonNullable<Order['placed_by']>
  }
  if (row.location !== undefined) {
    order.location = readOrderContext(row.location, false)
  }
  if (row.fulfilment !== undefined) {
    if (typeof row.fulfilment !== 'string' || !['', 'on_site', 'takeaway', 'collection', 'delivery'].includes(row.fulfilment)) throw new Error('Order fulfilment is invalid.')
    order.fulfilment = row.fulfilment as NonNullable<Order['fulfilment']>
  }
  if (row.customer !== undefined) {
    if (!row.customer || typeof row.customer !== 'object' || Array.isArray(row.customer)) throw new Error('Order customer is invalid.')
    const customer = row.customer as Record<string, unknown>
    if (!Object.keys(customer).length || Object.keys(customer).some((key) => !['name', 'phone'].includes(key) || typeof customer[key] !== 'string' || !(customer[key] as string).trim() || (customer[key] as string).length > (key === 'name' ? 200 : 64))) throw new Error('Order customer is invalid.')
    order.customer = { ...(customer.name !== undefined ? { name: (customer.name as string).trim() } : {}), ...(customer.phone !== undefined ? { phone: (customer.phone as string).trim() } : {}) }
  }
  if (row.delivery_address !== undefined) {
    if (typeof row.delivery_address !== 'string' || !row.delivery_address.trim() || row.delivery_address.length > 500) throw new Error('Delivery address is invalid.')
    order.delivery_address = row.delivery_address.trim()
  }
  if (row.requested_at !== undefined) {
    if (typeof row.requested_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.requested_at) || !Number.isFinite(Date.parse(row.requested_at)) || new Date(row.requested_at).toISOString() !== row.requested_at) throw new Error('Requested time is invalid.')
    order.requested_at = row.requested_at
  }
  return order
}

/** Descriptive order context is not authentication or access authority. */
function readOrderContext(value: unknown, actor: boolean): { id?: string; name: string; kind?: 'person' | 'system' } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Order context is invalid.')
  const row = value as Record<string, unknown>
  const allowed = actor ? ['id', 'name', 'kind'] : ['id', 'name']
  if (Object.keys(row).some((key) => !allowed.includes(key)) ||
      typeof row.name !== 'string' || !row.name.trim() || row.name.length > 200 ||
      (row.id !== undefined && (typeof row.id !== 'string' || !row.id.trim() || row.id.length > 128)) ||
      (actor && row.kind !== 'person' && row.kind !== 'system')) throw new Error('Order context is invalid.')
  return { name: row.name.trim(), ...(row.id !== undefined ? { id: (row.id as string).trim() } : {}), ...(actor ? { kind: row.kind as 'person' | 'system' } : {}) }
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
      ...(row.placed_by != null ? { placed_by: row.placed_by } : {}),
      ...(row.location != null ? { location: row.location } : {}),
      ...(row.fulfilment != null ? { fulfilment: row.fulfilment } : {}),
      ...(row.customer != null ? { customer: row.customer } : {}),
      ...(row.delivery_address != null ? { delivery_address: row.delivery_address } : {}),
      ...(row.requested_at != null ? { requested_at: row.requested_at } : {}),
    }),
    revision: Number(row.revision),
  }
}
