import { useDishCollection } from './fetch/useDishCollection'
import { useDishFetch } from './fetch/useDishFetch'
import { useDishCreate } from './mutations/useDishCreate'
import { useDishUpdate } from './mutations/useDishUpdate'
import { useDishDelete } from './mutations/useDishDelete'
import { useDishInterface } from './utils/view/useDishInterface'
import { resolveDishSemanticLine } from './utils/view/resolveDishSemanticLine'

export {
  useDishCollection,
  useDishFetch,
  useDishCreate,
  useDishUpdate,
  useDishDelete,
  useDishInterface,
  resolveDishSemanticLine,
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
export function useDish() {
  return {
    ...useDishCreate(),
    ...useDishUpdate(),
    ...useDishDelete(),
    ...useDishInterface(),
  }
}
