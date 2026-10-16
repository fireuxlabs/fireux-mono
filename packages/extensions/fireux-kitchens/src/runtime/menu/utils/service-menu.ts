import type { MenuDirectoryEntry } from '../models/menu-directory.response'

export type MenuService = 'collection' | 'delivery' | 'table' | 'room_service'

/** Explicit enabled service options only; names never determine eligibility. */
export function menuServiceOfferings(
  menu: MenuDirectoryEntry,
  service: MenuService
) {
  const ids = new Set(
    (menu.offering_options || [])
      .filter(
        (option) =>
          option.type === (service === 'table' ? 'dine_in' : service) &&
          !option.paused
      )
      .map((option) => option.kitchen_offering_id)
  )
  return (menu.offerings || []).filter(
    (offering) =>
      ids.has(offering.id) &&
      !offering.paused &&
      Boolean(offering.hours?.windows.length)
  )
}
