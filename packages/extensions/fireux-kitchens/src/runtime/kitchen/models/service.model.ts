import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { KitchenOrderTypeConfig } from './ordering.model'

export type KitchenServiceInteraction =
  | { type: 'browse'; enabled: boolean }
  | (KitchenOrderTypeConfig & { enabled: boolean })

/** A Kitchen offering. Its identity is independent of how a guest uses it. */
export type KitchenService = {
  id: string
  name: string
  enabled: boolean
  menu_ids: string[]
  hours?: WeekdayTimeWindowsConfig
  interactions: KitchenServiceInteraction[]
}

export type KitchenServiceChanges = Partial<
  Pick<KitchenService, 'name' | 'enabled' | 'menu_ids'>
> & { hours?: WeekdayTimeWindowsConfig | null }

export type KitchenServiceInteractionChanges = Omit<
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
