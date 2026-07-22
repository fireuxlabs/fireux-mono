// Concurrent edit — 2026-07-22 00:37 CEST — Dish media ownership: expose the named Dish image mutation in the Dish stack.
import type { Ref } from 'vue'
import type { Dish } from '../../../../models/kitchen/dish.model'
import { useKitchenDishCollection } from './fetch/useKitchenDishCollection'
import { useDishFetch } from './fetch/useDishFetch'
import { useDishCreate } from './mutations/useDishCreate'
import { useDishUpdate } from './mutations/useDishUpdate'
import { useDishDelete } from './mutations/useDishDelete'
import { useDishImageUpload } from './mutations/useDishImageUpload'
import { useDishComputed } from './utils/view/useDishComputed'
import { useDishInterface } from './utils/view/useDishInterface'

export type { Dish }
export type { DishCard, DishProfile } from './utils/view/useDishInterface'

export {
  useKitchenDishCollection,
  useDishFetch,
  useDishCreate,
  useDishUpdate,
  useDishDelete,
  useDishImageUpload,
  useDishComputed,
  useDishInterface,
}

/**
 * FireUX stack family: Scoped child entity.
 * Entity: Dish.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * Dish is scoped to Kitchen-owned menu/dish publishing and operations.
 * It is not a global root entity or a selected console workspace.
 */
type UseDishOptions = {
  kitchenCollectionPath?: string | Ref<string | null | undefined>
  databaseId?: string | Ref<string | null | undefined>
}

export function useDish(options: UseDishOptions = {}) {
  return {
    ...useDishCreate(options),
    ...useDishUpdate(options),
    ...useDishDelete(options),
    ...useDishImageUpload(),
    ...useDishComputed(),
    ...useDishInterface(),
  }
}
