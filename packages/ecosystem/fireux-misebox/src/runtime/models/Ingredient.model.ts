/**
 * Ingredient Model (Tenant: Misebox)
 * Simple ingredient representation for rapid development
 */

// Simple Ingredient interface - just the essentials
export interface Ingredient {
  id: string
  name: string
  // Optional fields used by UI components
  description?: string
  category?: string
  categories?: string[]
  tags?: string[]
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
  storage?: {
    method?: string
    temperature?: string
    shelf_life?: string
  }
  allergens?: string[]
  local?: boolean
  organic?: boolean
  seasonal?: boolean
  createdAt?: string
  updatedAt?: string
  created_at?: string
  // Supplier info displayed in UI when present
  supplierId?: string
  supplierInfo?: {
    business_name?: string
    verified?: boolean
  }
}

// Simple creation input
export interface NewIngredientInput {
  name: string
}

// Simple normalization - just the essentials
export function normalizeIngredient(id: string, raw: any): Ingredient {
  return {
    id,
    name: raw.name || 'Ingredient',
  }
}

// Simple config
export const ingredientConfig = {
  id: 'ingredient',
  objectType: 'ingredient',
  collectionName: 'ingredients',
  color: 'green',
  searchableFields: ['name'],
}

// Export simple types
export type IngredientInput = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
export type IngredientUpdate = Partial<IngredientInput>
