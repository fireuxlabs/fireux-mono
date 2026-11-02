import { readWeekdayTimeOpenState } from '../../utils/weekday-time'
import { normalizeKitchenOfferings } from '../../kitchen/utils/offering-policy'
import { tableChannelEnabled } from '../../kitchen/utils/table-service'
import type { MenuOrderTypeConfig } from '../models/menu-ordering.model'
import type { MenuOrderingConfig } from '../models/menu-ordering.model'

/** Derived availability for one catalogue; stored Menu data is never an ordering authority. */
export function kitchenMenuOrdering(
  value: unknown,
  menuId: string
): MenuOrderingConfig {
  const order_types = normalizeKitchenOfferings(value)
    .filter(
      (offering) =>
        offering.enabled &&
        offering.menu_ids.includes(menuId) &&
        offering.hours?.windows.length
    )
    .flatMap((offering) =>
      offering.interactions.flatMap((interaction) => {
        if (interaction.type === 'browse' || !interaction.enabled) return []
        if (
          (interaction.type === 'eat_in' || interaction.type === 'takeaway') &&
          !interaction.menu_ids?.includes(menuId)
        )
          return []
        const { enabled, ...policy } = interaction
        return [
          {
            ...policy,
            kitchen_offering_id: offering.id,
            kitchen_offering_name: offering.name,
            ...(offering.hours
              ? { offering_hours: { operation_hours: offering.hours } }
              : {}),
          },
        ]
      })
    )
  return { enabled: false, order_types }
}

/** Channel-specific services explicitly granted by Kitchen offerings. */
export function publicMenuOrderTypes(
  ordering: MenuOrderingConfig,
  channel: 'website' | 'kiosk' = 'website'
): MenuOrderTypeConfig[] {
  return ordering.order_types.filter(
    (config) =>
      (channel === 'kiosk'
        ? ['eat_in', 'takeaway']
        : ['collection', 'delivery', 'dine_in']
      ).includes(config.type) &&
      !config.availability?.paused &&
      tableChannelEnabled(config, 'table_qr')
  )
}

/** One currently open schedule is enough; unknown hours never grant ordering. */
export function publicMenuServiceOpen(
  ordering: MenuOrderingConfig,
  type: string,
  now = new Date(),
  channel: 'website' | 'kiosk' = 'website'
): boolean {
  return publicMenuOrderTypes(ordering, channel).some(
    (config) =>
      config.type === type &&
      readWeekdayTimeOpenState(config.offering_hours?.operation_hours, now).open
  )
}
