import type { Kitchen } from './kitchen.model.ts'

export type KitchenCreateInput = Partial<Pick<Kitchen, 'id' | 'slug'>>

export type KitchenUpdateInput = Partial<
  Pick<Kitchen, 'slug' | 'status' | 'visibility'>
>
