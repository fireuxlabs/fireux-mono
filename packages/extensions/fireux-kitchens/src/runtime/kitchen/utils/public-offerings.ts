import { normalizeKitchenOfferings } from './offering-policy'
import type { KitchenPublicOffering } from '../models/public-offering.model'

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
