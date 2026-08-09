// FILE: packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts

import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  IngredientCategory,
  IngredientKind,
  IngredientStatus,
} from './ingredient-taxonomy'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Domain Root
 * Storage: root canonical model
 * Root path: /ingredients/<ingredientId>
 * Scoped use: kitchens may own scoped usage records that link back through `ingredient_id`
 *
 * Decision note:
 * - Ingredient is reusable shared truth at root.
 * - `name` is canonical display identity, not a declared source language.
 * - Language variants may attach later by stable Ingredient id; they are not
 *   Ingredient root fields today.
 * - Every active Ingredient carries its canonical presentation image.
 * - Kitchen usage should be represented through scoped companion records rather than by mutating root identity.
 * - If that rule changes later, update the models README first, then this file.
 */
export const IngredientStorage = {
  shape: 'root',
  path: 'ingredients/{ingredientId}',
  collection: 'ingredients',
  idParam: 'ingredientId',
} as const

export const IngredientEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Ingredient',
  family: ['kitchen', 'supplier'],
  identity: 'root',
  authority: 'owning-app-database',
  appSupport: 'none',
  publicRead: 'projection',
  status: 'confirmed',
  console: false,
  root: IngredientStorage.path,
})

export const IngredientDefaults = {
  id: '' as string,
  schema_version: 2 as const,
  name: '' as string,
  aliases: [] as string[],
  slug: '' as string,
  category: 'other' as IngredientCategory,
  kind: 'base' as IngredientKind,
  parent_ingredient_id: undefined as string | undefined,
  status: 'active' as IngredientStatus,
  replaced_by_ingredient_id: undefined as string | undefined,
  image_url: '' as string,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

export type Ingredient = {
  [K in keyof typeof IngredientDefaults]: (typeof IngredientDefaults)[K]
}

export type IngredientCreateInput = Omit<
  Ingredient,
  'id' | 'schema_version' | 'slug' | 'created' | 'updated'
>

export type IngredientUpdateInput = Partial<
  Omit<Ingredient, 'id' | 'schema_version' | 'slug' | 'created' | 'updated'>
>
