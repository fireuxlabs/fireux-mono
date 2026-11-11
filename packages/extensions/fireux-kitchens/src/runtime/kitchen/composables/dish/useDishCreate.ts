import type { WatchSource } from 'vue'
import { useDishMutation } from './useDishMutation'

type DishCreateDraft = {
  price?: number
  name: string
  description?: string
  item_kind?: string
  group_ids?: string[]
  preparation_station_ids?: string[]
  is_flagship?: boolean
}
export type DishCreateResult = { id: string }

export function useDishCreate(ownerSources: WatchSource[] = []) {
  const { mutate } = useDishMutation(ownerSources)
  const createDish = (
    draft: DishCreateDraft,
    target: { kitchenId: string }
  ): Promise<DishCreateResult> => mutate('POST', { draft }, target.kitchenId)
  return { createDish }
}
