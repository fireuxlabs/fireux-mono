// Local demo payloads for Ingredients (git-ignored).
// These files are for dev-only UI prototyping and are not part of the repo.

import type { Ingredient } from 'fireux-kitchens/runtime/models/ingredient.model'
import { IngredientModel as IngredientModelRuntime } from 'fireux-kitchens/runtime/models/ingredient.model'

const baseIngredient: Ingredient = {
  ...IngredientModelRuntime,
  app_id: 'line-pass',
  creator_id: 'uid_dev_ingredient',
  created_at: {} as any,
  updated_at: {} as any,
}

const buildIngredient = (overrides: Partial<Ingredient>): Ingredient =>
  ({
    ...baseIngredient,
    ...overrides,
  } as Ingredient)

export const demoIngredient: Ingredient = buildIngredient({
  id: 'beef-patty',
  name: 'Beef Patty',
  image_url:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=320&h=320&q=80',
})

export const demoIngredientList: Ingredient[] = [
  demoIngredient,
  buildIngredient({
    id: 'burger-buns',
    name: 'Burger Buns',
    image_url:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=320&h=320&q=80',
  }),
  buildIngredient({
    id: 'lettuce',
    name: 'Lettuce',
    image_url:
      'https://images.unsplash.com/photo-1622205313162-be1d5712a43c?auto=format&fit=crop&w=320&h=320&q=80',
  }),
  buildIngredient({
    id: 'tomato',
    name: 'Tomato',
    image_url:
      'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=320&h=320&q=80',
  }),
  buildIngredient({
    id: 'american-cheese',
    name: 'American Cheese',
    image_url:
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=320&h=320&q=80',
  }),
  buildIngredient({
    id: 'ketchup',
    name: 'Ketchup',
    image_url:
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=320&h=320&q=80',
  }),
]
