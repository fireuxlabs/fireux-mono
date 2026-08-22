import {
  KitchenStationDefaults,
  type KitchenStation,
} from '../../utils/station.ts'
import { kitchenDemoCreated, kitchenDemoUpdated } from '../core/fixtures'
import type { KitchenDemoIdentity } from '../core/types'

export const station = (
  identity: KitchenDemoIdentity,
  id: string,
  name: string,
  description: string,
  sortOrder: number
): KitchenStation => ({
  ...KitchenStationDefaults,
  id,
  kitchen_id: identity.kitchenId,
  name,
  description,
  sort_order: sortOrder,
  created: kitchenDemoCreated(identity),
  updated: kitchenDemoUpdated(),
})
