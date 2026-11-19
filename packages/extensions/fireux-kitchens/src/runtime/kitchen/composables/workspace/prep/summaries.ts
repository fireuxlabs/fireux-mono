import { computed, type Ref } from 'vue'
import { useKitchenPreparationsRead } from '../../preparations/useKitchenPreparationsRead'
import { useKitchenRecipesRead } from '../../../workspace/prep/recipes/read'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'

export type PrepSummary = {
  outcome: 'idle' | 'pending' | 'error' | 'ready'
  status: string
  flags: string[]
}

/** The Prep entrance owns these acquisitions; its child cards only project them. */
export function createPrepSummaries(
  kitchenId: Ref<string>,
  kitchenOutcome: Ref<string>
) {
  const preparations = useKitchenPreparationsRead(kitchenId)
  const recipes = useKitchenRecipesRead(kitchenId)
  const ingredients = useKitchenChildCollection<{ ingredient_id: string }>(
    'ingredients',
    kitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  const stations = useKitchenChildCollection<{ id: string }>(
    'stations',
    kitchenId,
    { kitchenCollectionPath: 'kitchens' }
  )
  function summary(
    outcomes: string[],
    count: number,
    singular: string,
    plural: string,
    flags: string[] = []
  ): PrepSummary {
    if (kitchenOutcome.value === 'error')
      return {
        outcome: 'error',
        status: 'Could not load this summary.',
        flags: [],
      }
    if (kitchenOutcome.value === 'idle' || kitchenOutcome.value === 'empty')
      return {
        outcome: 'idle',
        status: 'Choose an available Kitchen.',
        flags: [],
      }
    if (kitchenOutcome.value !== 'ready' || !kitchenId.value)
      return { outcome: 'pending', status: 'Loading…', flags: [] }
    if (outcomes.includes('error'))
      return {
        outcome: 'error',
        status: 'Could not load this summary.',
        flags: [],
      }
    if (outcomes.some((value) => !['ready', 'empty'].includes(value)))
      return { outcome: 'pending', status: 'Loading…', flags: [] }
    return {
      outcome: 'ready',
      status: `${count} ${count === 1 ? singular : plural}`,
      flags,
    }
  }
  const summaries = computed(() => ({
    preparations: summary(
      [preparations.outcome.value],
      preparations.preparations.value.length,
      'preparation',
      'preparations'
    ),
    recipes: summary(
      [recipes.outcome.value],
      recipes.recipes.value.length,
      'recipe',
      'recipes',
      [
        ...(recipes.recipes.value.some((recipe) => !recipe.inputs.length)
          ? ['Some recipes have no inputs recorded.']
          : []),
        ...(recipes.recipes.value.some((recipe) => !recipe.method.length)
          ? ['Some recipes have no method recorded.']
          : []),
      ]
    ),
    ingredients: summary(
      [ingredients.outcome.value],
      ingredients.items.value.length,
      'selected ingredient',
      'selected ingredients'
    ),
    stations: summary(
      [stations.outcome.value],
      stations.items.value.length,
      'station',
      'stations'
    ),
  }))
  return { summaries, preparations: preparations.preparations }
}
