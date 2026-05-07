import {
    useRecipeCollection,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/recipe/fetch/useRecipeCollection'
import {
    useRecipeCreate,
} from 'fireux-kitchens/runtime/composables/fireux/firestore/recipe/mutations/useRecipeCreate'
import { computed } from 'vue'
import { useRecipeDelete } from './useRecipeDelete'
import { useRecipeUpdate } from './useRecipeUpdate'

export function useRecipes() {
  const { recipes, count } = useRecipeCollection()

  const all = computed(() => recipes.value ?? [])
  const pending = computed(() => !count.value && recipes.value === undefined)
  const error = computed(() => null)

  const create = useRecipeCreate()
  const update = useRecipeUpdate()
  const deleteRecipe = useRecipeDelete()

  return { all, pending, error, ...create, ...update, ...deleteRecipe }
}
