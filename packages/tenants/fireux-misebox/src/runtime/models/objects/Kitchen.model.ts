/**
 * Kitchen Model (Tenant: Misebox)
 * Kitchen representation with ingredient management and ownership
 */

// Kitchen interface - minimal for now
export interface Kitchen {
  id: string
  name: string
  description?: string

  // Ownership
  owner_id: string // The chef who owns this kitchen
  app_id: string // Which app this kitchen belongs to

  // Ingredient management
  ingredients: string[] // Array of ingredient IDs that this kitchen has

  // Timestamps
  created_at: string
  updated_at: string
  created_by: string
}

// Creation input for new kitchens
export interface NewKitchenInput {
  name: string
}

// Kitchen normalization - minimal
export function normalizeKitchen(id: string, raw: any): Kitchen {
  return {
    id,
    name: raw.name || 'Kitchen',
    description: raw.description || '',
    owner_id: raw.owner_id || '',
    app_id: raw.app_id || '',
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    created_by: raw.created_by || '',
  }
}

// Kitchen configuration
export const kitchenConfig = {
  id: 'kitchen',
  objectType: 'kitchen',
  collectionName: 'kitchens',
  color: 'blue',
  searchableFields: ['name', 'description'],
}

// Export types
export type KitchenInput = Omit<Kitchen, 'id'>
export type KitchenUpdate = Partial<KitchenInput>
