import type { KitchenMenu } from '../../menu/models/kitchen-menu.model'
import { menuChoiceContextForOrderType } from '../../menu/utils/menu-context'
import type { KitchenOrderingService } from '../models/ordering.model'
import { kitchenOrderTypeLabel } from './kitchen-order-label'
import { resolveKitchenServiceHours } from './ordering-service-hours'
import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import { menuRouteProjection, type MenuRouteScope } from './kitchen-menu-route'
import {
  menuWebsiteOrderUrl,
  websiteOrderContexts,
} from './menu-website-snippet'

/** Workspace relationship presentation; this does not determine checkout readiness. */
export function menuServiceSummaries(input: {
  menu: Pick<KitchenMenu, 'id' | 'slug' | 'status' | 'doc'>
  services: KitchenOrderingService[]
  scope: MenuRouteScope
  origin: string
  kitchenHours?: WeekdayTimeWindowsConfig
}) {
  return input.services
    .filter((service) => service.menu_ids.includes(input.menu.id))
    .map((service) => {
      const context = menuChoiceContextForOrderType(service.type)
      const customerContext = websiteOrderContexts.find(
        (type) => type === context
      )
      const state = !service.enabled
        ? 'Off'
        : service.availability?.paused
          ? 'Paused'
          : 'Enabled'
      const inheritsHours =
        !service.service_hours ||
        service.service_hours.inherit_kitchen_operation_hours === true
      const hours = input.kitchenHours
        ? resolveKitchenServiceHours(service.service_hours, input.kitchenHours)
            ?.operation_hours
        : undefined
      return {
        type: service.type,
        label: kitchenOrderTypeLabel(service.type),
        state,
        hours,
        hoursSource: inheritsHours
          ? input.kitchenHours?.source === 'place'
            ? 'Venue hours via Kitchen'
            : 'Kitchen hours'
          : 'Separate service hours',
        sharedMenuCount: new Set(service.menu_ids).size,
        configurePath: `/workspace/kitchen/orders/ordering/${service.type}`,
        customerUrl:
          state === 'Enabled' &&
          input.menu.status === 'published' &&
          !input.menu.doc?.url.trim() &&
          customerContext
            ? menuWebsiteOrderUrl({
                origin: input.origin,
                scope: input.scope,
                menuId: input.menu.slug,
                context: customerContext,
              })
            : '',
        kiosk: context === 'kiosk',
        diagnostic: menuRouteProjection(context) === 'diagnostic',
      }
    })
}
