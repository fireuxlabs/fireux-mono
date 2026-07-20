// Concurrent edit — 2026-07-20 13:12 CEST — Driver dispatch privacy: define the minimal non-PII beacon and watch contracts.

export const DriverDispatchVisibleStatuses = [
  'pending_acceptance',
  'incoming',
  'new',
  'open',
] as const

export type DriverDispatchVisibleStatus =
  (typeof DriverDispatchVisibleStatuses)[number]

export type DriverDispatchBeacon = {
  id: string
  kitchen: {
    id: string
    name: string
    slug: string
  }
  status: DriverDispatchVisibleStatus
  item_count: number
  watcher_count: number
  watching: boolean
  created_at?: string
}

export type DriverDispatchPage = {
  items: DriverDispatchBeacon[]
}

export type DriverDispatchWatchInput = {
  kitchen_id: string
  order_id: string
}

export type DriverDispatchWatchResult = {
  ok: true
  changed: boolean
  kitchen_id: string
  order_id: string
}

export function isDriverDispatchVisibleStatus(
  value: unknown
): value is DriverDispatchVisibleStatus {
  return DriverDispatchVisibleStatuses.includes(
    value as DriverDispatchVisibleStatus
  )
}
