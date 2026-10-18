import type { KitchenOffering } from '../models/offering.model'
import type { Menu } from '../../menu/models/menu.model'
import {
  kitchenOfferingOptions,
  offeringsForOption,
  offeringOptionStatus,
  serviceOptionStatus,
} from './offering-options'
import { serviceMenuReadiness } from './service-menus'

/** A safe page/debug projection of the existing setup; no credentials, contacts or order data. */
export function serviceOverviewSnapshot(input: {
  kitchenId: string
  outcome: string
  menusOutcome: string
  canWrite: boolean
  offerings: KitchenOffering[]
  menus: Menu[]
}) {
  const settled = ['ready', 'empty'].includes(input.outcome)
  const menusReady = ['ready', 'empty'].includes(input.menusOutcome)
  const services = kitchenOfferingOptions.map((option) => {
    const records = settled ? offeringsForOption(input.offerings, option) : []
    return {
      type: option.key,
      name: option.label,
      status: settled ? serviceOptionStatus(records, option) : 'Loading',
      configurations: records.map((row) => ({
        id: row.id,
        name: row.name,
        separate: Boolean(row.separate),
        enabled: row.enabled,
        status: offeringOptionStatus(row, option),
        menuIds: [...row.menu_ids],
        menus: menusReady
          ? input.menus
              .filter((menu) => row.menu_ids.includes(menu.id))
              .map((menu) => ({
                id: menu.id,
                name: menu.name,
                status: menu.status,
                format: menu.format,
                schedule: menu.schedule,
              }))
          : [],
        readiness: serviceMenuReadiness(
          row.menu_ids,
          menusReady ? input.menus : []
        ),
        hours: row.hours,
        collectionTiming: row.collection_timing,
        options: row.interactions.map((interaction) => ({
          type: interaction.type,
          enabled: interaction.enabled,
          paused:
            interaction.type !== 'browse' &&
            Boolean(interaction.availability?.paused),
          ...(interaction.type === 'dine_in'
            ? { tableChannels: interaction.table_channels }
            : {}),
        })),
      })),
    }
  })
  return {
    selected: { kitchenId: input.kitchenId },
    services,
    derived: {
      outcome: input.outcome,
      menusOutcome: input.menusOutcome,
      canConfigure: input.canWrite,
      enabledServices: services
        .filter((service) => service.status === 'Enabled')
        .map((service) => service.type),
      model:
        'Misebox provides service types; saved configurations connect their menus, hours and availability.',
    },
  }
}
