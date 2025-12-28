import type { Kitchen } from '../../../../../../../models/objects/kitchen.model'

export interface KitchenPill {
  id: string
  name: string
}

export interface KitchenCell {
  id: string
  name: string
  app_id?: string | null
}

export interface KitchenProfile {
  id: string
  name: string
  description?: string
  app_id?: string | null
}

/**
 * UI mapping helpers for Kitchen view models.
 * Canon: view models live here, not in the model.
 */
export function useKitchenInterface() {
  const toPill = (kitchen: Kitchen): KitchenPill => ({
    id: kitchen.id,
    name: kitchen.name,
  })

  const toCell = (kitchen: Kitchen): KitchenCell => ({
    id: kitchen.id,
    name: kitchen.name,
    app_id: kitchen.app_id ?? null,
  })

  const toProfile = (kitchen: Kitchen): KitchenProfile => ({
    id: kitchen.id,
    name: kitchen.name,
    description: kitchen.description,
    app_id: kitchen.app_id ?? null,
  })

  return {
    toPill,
    toCell,
    toProfile,
  }
}
