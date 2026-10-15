import { tableChannelEnabled } from './table-service.ts'
import type { KitchenMenu } from '../../menu/models/kitchen-menu.model'
import type { KitchenOffering } from '../models/offering.model'
import { kitchenOrderTypeLabel } from './kitchen-order-label'
import { menuChoiceContextForOrderType } from '../../menu/utils/menu-context'
import {
  menuRouteProjection,
  type MenuRouteScope,
} from '../../menu/utils/menu-route'
import {
  menuWebsiteOrderUrl,
  websiteOrderContexts,
} from './menu-website-snippet'

/** Configured relationships, never a claim that checkout is currently open. */
export function menuOfferingSummaries(input: {
  menu: Pick<KitchenMenu, 'id' | 'slug' | 'status' | 'doc' | 'schedule'>
  offerings: KitchenOffering[]
  scope: MenuRouteScope
  origin: string
}) {
  return input.offerings
    .filter((offering) => offering.menu_ids.includes(input.menu.id))
    .map((offering) => ({
      id: offering.id,
      label: offering.name,
      state: offering.enabled ? 'Enabled' : 'Off',
      hours: offering.hours,
      sharedMenuCount: new Set(offering.menu_ids).size,
      configurePath:
        '/workspace/kitchen/orders/channels/' + encodeURIComponent(offering.id),
      interactions: offering.interactions.map((interaction) => {
        const context =
          interaction.type === 'browse'
            ? 'browse'
            : interaction.type === 'dine_in'
              ? 'table'
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
            offering.enabled &&
            state === 'Enabled' &&
            (interaction.type !== 'dine_in' ||
              tableChannelEnabled(interaction, 'table_qr')) &&
            input.menu.status === 'published' &&
            (interaction.type === 'browse' ||
              (input.menu.schedule !== 'daily' &&
                !input.menu.doc?.url.trim() &&
                Boolean(
                  offering.hours?.timezone && offering.hours.windows.length
                ))) &&
            customerContext
              ? menuWebsiteOrderUrl({
                  origin: input.origin,
                  scope: input.scope,
                  menuId: input.menu.slug,
                  context: customerContext,
                  offeringId: offering.id,
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
