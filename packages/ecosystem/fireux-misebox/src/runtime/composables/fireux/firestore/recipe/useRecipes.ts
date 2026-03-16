import { computed } from 'vue'
import {
  useRecipeCollection as useCanonicalRecipeCollection,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/runtime-kitchen/recipe/fetch/useRecipeCollection'
import { useRecipeCreate } from './useRecipeCreate'
import { useRecipeUpdate } from './useRecipeUpdate'
import { useRecipeDelete } from './useRecipeDelete'

export function useRecipes() {
  const { recipes, count } = useCanonicalRecipeCollection()

  const all = computed(() => recipes.value ?? [])
  const pending = computed(() => !count.value && recipes.value === undefined)
  const error = computed(() => null)

  const create = useRecipeCreate()
  const update = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  return { all, pending, error, ...create, ...update, ...deleteRecipe }
}
