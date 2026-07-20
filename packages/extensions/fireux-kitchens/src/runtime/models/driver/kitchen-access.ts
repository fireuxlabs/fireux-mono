// Concurrent edit — 2026-07-20 13:08 CEST — Driver kitchen access: define the bounded grant and revoke request contract.

export const DRIVER_KITCHEN_LINK_LIMIT = 50

export const DriverKitchenAccessRelations = [
  'exclusive',
  'preferred',
  'available',
] as const

export type DriverKitchenAccessRelation =
  (typeof DriverKitchenAccessRelations)[number]

export type DriverKitchenAccessInput = {
  action: 'grant' | 'revoke'
  driver_id: string
  kitchen_id: string
  relation?: DriverKitchenAccessRelation
}

export type DriverKitchenAccessResult = {
  ok: true
  action: DriverKitchenAccessInput['action']
  app_id: string
  driver_id: string
  kitchen_id: string
  changed: boolean
  active_kitchen_ids: string[]
}

export function isDriverKitchenAccessRelation(
  value: unknown
): value is DriverKitchenAccessRelation {
  return DriverKitchenAccessRelations.includes(
    value as DriverKitchenAccessRelation
  )
}
