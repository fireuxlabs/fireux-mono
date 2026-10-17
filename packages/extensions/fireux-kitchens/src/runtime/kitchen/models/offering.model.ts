import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { KitchenOrderTypeConfig } from './ordering.model'

export type KitchenOfferingInteraction =
  | { type: 'browse'; enabled: boolean }
  | (KitchenOrderTypeConfig & { enabled: boolean })

/** A Kitchen offering. Its identity is independent of how a guest uses it. */
export type KitchenOffering = {
  id: string
  name: string
  enabled: boolean
  menu_ids: string[]
  /** Named entrance, independent of collection timing. */
  separate?: boolean
  collection_timing?: 'same_day' | 'next_day'
  hours?: WeekdayTimeWindowsConfig
  interactions: KitchenOfferingInteraction[]
}

export type KitchenOfferingChanges = Partial<
  Pick<KitchenOffering, 'name' | 'enabled' | 'menu_ids' | 'collection_timing'>
> & { hours?: WeekdayTimeWindowsConfig | null }

export type KitchenOfferingInteractionChanges = Omit<
  Partial<KitchenOrderTypeConfig>,
  'type' | 'fulfilment'
> & {
  enabled?: boolean
  fulfilment?: Omit<
    NonNullable<KitchenOrderTypeConfig['fulfilment']>,
    'deposit'
  > & {
    deposit?:
      | NonNullable<KitchenOrderTypeConfig['fulfilment']>['deposit']
      | null
  }
}
