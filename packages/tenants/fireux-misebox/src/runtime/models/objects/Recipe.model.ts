import type { FirestoreObject } from 'fireux-core/src/runtime/models/objects/object.model'

export interface Recipe extends FirestoreObject {
  // Basic Information
  title: string
  description: string
  chef_id?: string // Optional - can be created by chefs or global recipes
  chef_name?: string // Chef name for display

  // Recipe Details
  cuisine_type: string[]
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number

  // Ingredients & Instructions
  ingredients: RecipeIngredient[]
  instructions: RecipeInstruction[]

  // Nutritional Information (optional)
  nutrition?: RecipeNutrition

  // Media & Presentation
  featured_image?: string
  images: string[]
  video_url?: string

  // Metadata
  tags: string[]
  dietary_restrictions: string[] // e.g., 'vegetarian', 'gluten-free', 'dairy-free'
  allergens: string[] // e.g., 'nuts', 'shellfish', 'eggs'

  // Social Features
  is_public: boolean
  is_featured: boolean
  likes_count: number
  saves_count: number
  views_count: number

  // Business Features
  cost_estimate?: {
    ingredients_cost: number
    labor_cost?: number
    total_cost: number
    currency: string
  }

  // App/Domain Scoping
  parent_app_id?: string // For Niederhorn-specific recipes
  source: 'global' | 'app_specific' // Global MiseBox or app-specific

  // Status
  status: 'draft' | 'published' | 'archived'
  published_at?: string | Date
}

export interface RecipeIngredient {
  name: string
  amount: number
  unit: string
  notes?: string
  category?: string // e.g., 'protein', 'vegetable', 'spice'
  is_optional: boolean
}

export interface RecipeInstruction {
  step_number: number
  instruction: string
  time_minutes?: number
  temperature?: {
    value: number
    unit: 'C' | 'F'
  }
  image?: string
  notes?: string
}

export interface RecipeNutrition {
  calories_per_serving: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  fiber_grams: number
  sugar_grams: number
  sodium_mg: number
}

// Configuration for the Recipe object type
export const recipeConfig = {
  id: 'recipe',
  collectionName: 'recipes',
  objectType: 'Recipe',
  color: 'purple', // Recipe color theme
  defaultValues: {
    title: '',
    description: '',
    cuisine_type: [],
    difficulty_level: 'Beginner' as const,
    prep_time_minutes: 15,
    cook_time_minutes: 30,
    total_time_minutes: 45,
    servings: 4,
    ingredients: [],
    instructions: [],
    images: [],
    tags: [],
    dietary_restrictions: [],
    allergens: [],
    is_public: true,
    is_featured: false,
    likes_count: 0,
    saves_count: 0,
    views_count: 0,
    source: 'global' as const,
    status: 'draft' as const,
  },
} as const

// Export types for use
export type RecipeInput = Omit<
  Recipe,
  'slug' | 'appId' | 'created_at' | 'updated_at' | 'creator_id'
>
export type RecipeUpdate = Partial<RecipeInput>
