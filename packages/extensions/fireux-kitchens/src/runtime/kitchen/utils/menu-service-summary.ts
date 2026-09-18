import type { KitchenMenu } from '../../menu/models/kitchen-menu.model'
import type { KitchenService } from '../models/service.model'
import { kitchenOrderTypeLabel } from './kitchen-order-label'
import { menuChoiceContextForOrderType } from '../../menu/utils/menu-context'
import { menuRouteProjection, type MenuRouteScope } from './kitchen-menu-route'
import {
  menuWebsiteOrderUrl,
  websiteOrderContexts,
} from './menu-website-snippet'

/** Configured relationships, never a claim that checkout is currently open. */
export function menuServiceSummaries(input: {
  menu: Pick<KitchenMenu, 'id' | 'slug' | 'status' | 'doc'>
  services: KitchenService[]
  scope: MenuRouteScope
  origin: string
}) {
  return input.services
    .filter((service) => service.menu_ids.includes(input.menu.id))
    .map((service) => ({
      id: service.id,
      label: service.name,
      state: service.enabled ? 'Enabled' : 'Off',
      hours: service.hours,
      sharedMenuCount: new Set(service.menu_ids).size,
      configurePath:
        '/workspace/kitchen/orders/services/' + encodeURIComponent(service.id),
      interactions: service.interactions.map((interaction) => {
        const context =
          interaction.type === 'browse'
            ? 'browse'
            : menuChoiceContextForOrderType(interaction.type)
        const customerContext = websiteOrderContexts.find(
          (type) => type === context
        )
        const state = !interaction.enabled
          ? 'Off'
          : interaction.type !== 'browse' && interaction.availability?.paused
            ? 'Paused'
            : 'Enabled'
        return {
          type: interaction.type,
          label:
            interaction.type === 'browse'
              ? 'Browse'
              : kitchenOrderTypeLabel(interaction.type),
          state,
          customerUrl:
            service.enabled &&
            state === 'Enabled' &&
            input.menu.status === 'published' &&
            (interaction.type === 'browse' ||
              (!input.menu.doc?.url.trim() &&
                Boolean(
                  service.hours?.timezone && service.hours.windows.length
                ))) &&
            customerContext
              ? menuWebsiteOrderUrl({
                  origin: input.origin,
                  scope: input.scope,
                  menuId: input.menu.slug,
                  context: customerContext,
                  serviceId: service.id,
                })
              : '',
          kiosk: context === 'kiosk',
          diagnostic:
            context !== 'browse' &&
            menuRouteProjection(context) === 'diagnostic',
        }
      }),
    }))
}
