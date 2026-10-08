import type { KitchenIdentity } from './kitchen.model.ts'

export type KitchenCreateInput = { place_id: string }
export type KitchenShellCreateInput = {
  intent: 'create_shell'
  name: string
  owner_user_id?: string
}

export type KitchenUpdateInput = {
  'identity.slug'?: KitchenIdentity['slug']
  'identity.status'?: KitchenIdentity['status']
  'identity.visibility'?: KitchenIdentity['visibility']
  'tables.count'?: number
}
