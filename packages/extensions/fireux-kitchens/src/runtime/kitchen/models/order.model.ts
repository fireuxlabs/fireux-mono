/** Supported vocabulary; availability comes from the consuming App declaration. */
export const OrderChannels = ['pos', 'kiosk', 'website', 'app', 'api'] as const
export type OrderChannel = (typeof OrderChannels)[number]
export type OrderingConfiguration = { channels: OrderChannel[] }

/**
 * Minimal internal Order contract using UBL Order/OrderLine/LineItem/Item vocabulary.
 * This is a UBL-informed subset, not a conformant UBL document or shared package API.
 * Kitchen owns the first consumer until another industry proves a shared contract.
 */
export type Order = {
  id: string
  number: string
  channel: OrderChannel
  lines: OrderLine[]
}

export type OrderLine = {
  id: string
  item: { name: string }
  quantity: number
  unit_code: string
}

/** A saved draft's concurrency token is separate from the Order's business facts. */
export type SavedOrderDraft = { order: Order; revision: number }
