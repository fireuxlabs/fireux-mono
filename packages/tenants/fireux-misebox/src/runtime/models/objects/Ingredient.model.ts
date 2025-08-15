/**
 * Ingredient Model (Tenant: Misebox)
 * Simple ingredient representation for rapid development
 */

// Simple Ingredient interface - just the essentials
export interface Ingredient {
  id: string
  name: string
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
