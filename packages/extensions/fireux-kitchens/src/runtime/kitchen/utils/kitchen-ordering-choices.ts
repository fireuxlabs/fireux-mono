import type { MenuDirectoryEntry } from '../../menu/models/menu-directory.response'
import type { KitchenPublicOffering } from '../models/public-offering.model'
import { menuRoutePath, type MenuRouteScope } from '../../menu/utils/menu-route'

export const kitchenOnlineOptions = [
  {
    type: 'collection',
    label: 'Collection',
    icon: 'i-lucide-shopping-bag',
    description: 'Collect from the venue',
  },
  {
    type: 'delivery',
    label: 'Delivery',
    icon: 'i-lucide-truck',
    description: 'Delivered to your address',
  },
  {
    type: 'pre_order',
    label: 'Pre-order',
    icon: 'i-lucide-calendar-clock',
    description: 'Arrange a meal in advance',
  },
] as const
export type KitchenOnlineOption = (typeof kitchenOnlineOptions)[number]['type']

/** Reuse the server's published Menu/service projection; checkout rechecks every selection. */
export function kitchenOrderingChoices(
  menus: MenuDirectoryEntry[],
  scope: MenuRouteScope
) {
  return kitchenOnlineOptions
    .map((option) => {
      const offerings = new Map<
        string,
        {
          id: string
          name: string
          schedule?: KitchenPublicOffering
          menus: Array<{
            id: string
            name: string
            description?: string
            to: string
          }>
        }
      >()
      for (const menu of menus) {
        if (menu.kind === 'doc' || menu.status !== 'published' || !menu.slug)
          continue
        for (const service of menu.offering_options || []) {
          if (
            service.type !== option.type ||
            service.paused ||
            !service.kitchen_offering_id
          )
            continue
          const to = menuRoutePath({
            scope,
            menuId: menu.slug,
            context: option.type,
            offeringId: service.kitchen_offering_id,
          })
          if (!to) continue
          let offering = offerings.get(service.kitchen_offering_id)
          if (!offering) {
            const schedule = menu.offerings?.find(
              (row) => row.id === service.kitchen_offering_id
            )
            offering = {
              id: service.kitchen_offering_id,
              name: service.kitchen_offering_name,
              ...(schedule ? { schedule: { ...schedule, paused: false } } : {}),
              menus: [],
            }
            offerings.set(offering.id, offering)
          }
          if (!offering.menus.some((row) => row.id === menu.id))
            offering.menus.push({
              id: menu.id,
              name: menu.name,
              description: menu.description,
              to,
            })
        }
      }
      return { ...option, offerings: [...offerings.values()] }
    })
    .filter((option) => option.offerings.length)
}
