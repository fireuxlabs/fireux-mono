import { normalizeKitchenOfferings } from './offering-policy'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'

/** Public service doorway; private interaction and customer policy stay excluded. */
export type KitchenPublicOffering = {
  id: string
  name: string
  separate?: boolean
  collection_timing?: 'same_day' | 'next_day'
  hours?: WeekdayTimeWindowsConfig
  paused: boolean
}

export function readKitchenPublicOfferings(
  value: unknown,
  menuId?: string
): KitchenPublicOffering[] {
  return normalizeKitchenOfferings(value)
    .filter(
      (offering) =>
        offering.enabled &&
        (menuId === undefined || offering.menu_ids.includes(menuId)) &&
        offering.interactions.some((interaction) => interaction.enabled)
    )
    .map((offering) => {
      const ordering = offering.interactions.filter(
        (interaction) => interaction.type !== 'browse' && interaction.enabled
      )
      return {
        id: offering.id,
        name: offering.name,
        ...(offering.separate ? { separate: true } : {}),
        ...(offering.collection_timing
          ? { collection_timing: offering.collection_timing }
          : {}),
        ...(offering.hours ? { hours: offering.hours } : {}),
        paused:
          ordering.length > 0 &&
          ordering.every(
            (interaction) =>
              interaction.type !== 'browse' &&
              interaction.availability?.paused === true
          ),
      }
    })
}
