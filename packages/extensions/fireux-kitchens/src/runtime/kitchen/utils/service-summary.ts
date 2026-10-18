import { tableChannelEnabled } from './table-service'
import type { KitchenOffering } from '../models/offering.model'

/** Public labels only: never return customer, notification or fulfilment policy. */
export function kitchenServiceSummary(offerings: KitchenOffering[]): string[] {
  const labels = new Set<string>()
  for (const offering of offerings) {
    if (!offering.enabled || !offering.menu_ids.length) continue
    for (const interaction of offering.interactions) {
      if (!interaction.enabled) continue
      if (
        (interaction.type === 'eat_in' || interaction.type === 'takeaway') &&
        !interaction.menu_ids?.length
      )
        continue
      if (interaction.type === 'browse') labels.add('Browse menus')
      else if (interaction.type === 'dine_in') {
        if (tableChannelEnabled(interaction, 'staff_pos'))
          labels.add('Table service')
        if (tableChannelEnabled(interaction, 'table_qr'))
          labels.add('QR table ordering')
      } else {
        const label = {
          collection: 'Collection',
          delivery: 'Delivery',
          room_service: 'Room service',
          eat_in: 'Eat in',
          takeaway: 'Takeaway',
          pre_order: 'Pre-order',
        }[interaction.type]
        if (label) labels.add(label)
      }
    }
  }
  return [...labels]
}
