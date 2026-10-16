import type { WatchSource } from 'vue'
import { useDishMutation } from './useDishMutation'

type DishCreateDraft = {
  name: string
  description?: string
  item_kind?: string
  is_flagship?: boolean
}
export type DishCreateResult = { id: string }

export function useDishCreate(ownerSources: WatchSource[] = []) {
  const { mutate } = useDishMutation(ownerSources)
  const createDish = (
    draft: DishCreateDraft,
    overrides: { kitchenId?: string } = {}
  ): Promise<DishCreateResult> => mutate('POST', { draft }, overrides.kitchenId)
  return { createDish }
}
