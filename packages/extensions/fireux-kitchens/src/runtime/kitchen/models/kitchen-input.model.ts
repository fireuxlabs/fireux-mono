import type { Kitchen } from './kitchen.model.ts'

export type KitchenCreateInput = {
  place_id: string
}

export type KitchenShellCreateInput = {
  intent: 'create_shell'
  name: string
  owner_user_id?: string
}

export type KitchenUpdateInput = Partial<
  Pick<Kitchen, 'slug' | 'status' | 'visibility' | 'currency'>
>
