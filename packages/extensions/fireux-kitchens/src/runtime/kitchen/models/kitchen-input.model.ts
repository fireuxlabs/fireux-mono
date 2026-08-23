import type { Kitchen } from './kitchen.model.ts'

export type KitchenCreateInput = {
  place_id?: string
  name?: string
}

export type KitchenUpdateInput = Partial<
  Pick<Kitchen, 'slug' | 'status' | 'visibility'>
>
