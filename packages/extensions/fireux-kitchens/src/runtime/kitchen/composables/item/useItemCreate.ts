import type { WatchSource } from 'vue'
import { useItemMutation } from './useItemMutation'

type ItemCreateDraft = {
  price?: number
  name: string
  description?: string
  item_kind?: string
  preparation_station_ids?: string[]
  is_flagship?: boolean
}
export type ItemCreateResult = { id: string }

export function useItemCreate(ownerSources: WatchSource[] = []) {
  const { mutate } = useItemMutation(ownerSources)
  const createItem = (
    draft: ItemCreateDraft,
    target: { kitchenId: string }
  ): Promise<ItemCreateResult> => mutate('POST', { draft }, target.kitchenId)
  return { createItem }
}
