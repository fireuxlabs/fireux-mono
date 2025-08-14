/**
 * Ingredient Model (Tenant: Misebox)
 * Simple ingredient representation for rapid development
 */

// Simple Ingredient interface
export interface Ingredient {
  id: string
  name: string
  category?: string
  tags: string[]

  // Creator information
  createdBy: { id: string; avatar?: string }
  createdAt: string
  updatedAt?: string

  // Supplier relationship (new)
  supplierId?: string // ID of supplier who added this ingredient
  supplierInfo?: {
    business_name: string
    business_type: string
    verified?: boolean
  }
}

// Simple creation input
export interface NewIngredientInput {
  name: string
  category?: string
  tags?: string[]
  createdBy: { id: string; avatar?: string }

  // Optional supplier information
  supplierId?: string
  supplierInfo?: {
    business_name: string
    business_type: string
    verified?: boolean
  }
}

// Simple normalization - just handle the basics
export function normalizeIngredient(id: string, raw: any): Ingredient {
  return {
    id,
    name: raw.name || 'Ingredient',
    category: raw.category,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdBy: raw.createdBy || raw.created_by || { id: 'unknown' },
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at,

    // Supplier relationship
    supplierId: raw.supplierId || raw.supplier_id,
    supplierInfo: raw.supplierInfo || raw.supplier_info,
  }
}

// Simple config
export const ingredientConfig = {
  id: 'ingredient',
  objectType: 'ingredient',
  collectionName: 'ingredients',
  color: 'green',
  searchableFields: ['name', 'category', 'tags'],
}

// Export simple types
export type IngredientInput = Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
export type IngredientUpdate = Partial<IngredientInput>
