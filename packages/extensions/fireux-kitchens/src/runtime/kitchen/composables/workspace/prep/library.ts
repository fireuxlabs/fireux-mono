import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import { useIngredientCollection } from '../../../../ingredient/composables/useIngredientCollection'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenPreparationsRead } from '../../preparations/useKitchenPreparationsRead'
import { useKitchenRecipesRead } from '../../../recipe/composables/useKitchenRecipesRead'

export function useKitchenWorkspacePrepLibrary(
  view: MaybeRefOrGetter<'preparations' | 'recipes'>
) {
  const workspace = useKitchenWorkspace()
  const catalogue = useIngredientCollection({
    enabled: () => toValue(view) === 'recipes',
  })
  const inputLabels = computed(() =>
    Object.fromEntries(
      catalogue.ingredients.value.map((ingredient) => [
        ingredient.id,
        ingredient.name,
      ])
    )
  )
  const kitchenId = computed(() =>
    workspace.outcome.value === 'ready' ? workspace.id.value : ''
  )
  const ingredientKitchenId = computed(() =>
    toValue(view) === 'recipes' ? kitchenId.value : ''
  )
  const associations = useKitchenChildCollection<{ ingredient_id: string }>(
    'ingredients',
    ingredientKitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  const ingredientOutcome = computed(() => {
    const states = [catalogue.outcome.value, associations.outcome.value]
    if (states.includes('error')) return 'error'
    if (states.includes('pending')) return 'pending'
    if (states.includes('idle')) return 'idle'
    return ingredientOptions.value.length ? 'ready' : 'empty'
  })
  const ingredientError = computed(
    () => catalogue.error.value || associations.error.value
  )
  const ingredientOptions = computed(() =>
    associations.outcome.value === 'ready'
      ? associations.items.value.map((row) => ({
          value: row.ingredient_id,
          label: inputLabels.value[row.ingredient_id] || row.ingredient_id,
        }))
      : []
  )
  const output = useKitchenPreparationsRead(kitchenId)
  const instructions = useKitchenRecipesRead(kitchenId)
  const { preparations } = output
  const recipeLinks = computed(() =>
    output.recipeLinks.value.filter(
      (link) =>
        !instructions.explicitOutputRecipeIds.value.includes(link.recipeId)
    )
  )
  const { recipes } = instructions
  const outcome = computed(() => {
    if (workspace.outcome.value !== 'ready') return workspace.outcome.value
    const states = [output.outcome.value, instructions.outcome.value]
    if (states.includes('error')) return 'error'
    if (states.includes('pending')) return 'pending'
    if (states.includes('idle')) return 'idle'
    return preparations.value.length || recipes.value.length ? 'ready' : 'empty'
  })
  const error = computed(() => output.error.value || instructions.error.value)
  const preparationTo = (id = '') =>
    `/workspace/kitchen/prep/preparations${id ? `/${encodeURIComponent(id)}` : ''}`
  const recipeTo = (id = '') =>
    `/workspace/kitchen/prep/recipes${id ? `/${encodeURIComponent(id)}` : ''}`

  return {
    kitchenId,
    preparations,
    recipes,
    inputLabels,
    recipeLinks,
    preparationTo,
    recipeTo,
    outcome,
    error,
    ingredientOptions,
    ingredientOutcome,
    ingredientError,
  }
}
