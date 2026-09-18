import { readKitchenServices } from './kitchen-services'
import type { KitchenPublicService } from '../models/public-service.model'

export function readKitchenPublicServices(
  value: unknown,
  menuId?: string
): KitchenPublicService[] {
  return readKitchenServices(value)
    .filter(
      (service) =>
        service.enabled &&
        (menuId === undefined || service.menu_ids.includes(menuId)) &&
        service.interactions.some((interaction) => interaction.enabled)
    )
    .map((service) => {
      const ordering = service.interactions.filter(
        (interaction) => interaction.type !== 'browse' && interaction.enabled
      )
      return {
        id: service.id,
        name: service.name,
        ...(service.hours ? { hours: service.hours } : {}),
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
