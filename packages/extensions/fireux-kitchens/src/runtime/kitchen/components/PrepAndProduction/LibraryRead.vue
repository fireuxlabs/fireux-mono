<template>
  <KitchenPrepAndProductionLibrary
    v-if="outcome === 'ready' || outcome === 'empty'"
    :view="view"
    :selected-id="selectedId"
    :preparations="preparations"
    :recipes="recipes"
    :input-labels="inputLabels"
    :recipe-links="recipeLinks"
    :preparation-to="preparationTo"
    :recipe-to="recipeTo"
  >
    <template #actions="{ preparation, recipe }">
      <KitchenPrepAndProductionPreparationEditor
        v-if="preparation"
        :key="`${kitchenId}:${preparation.id}`"
        :record="preparation"
        :kitchen-id="kitchenId"
        :can-edit="outcome === 'ready'"
      />
      <KitchenPrepAndProductionRecipesEditor
        v-if="view === 'recipes' && (!selectedId || recipe)"
        :key="`${kitchenId}:${recipe?.id || 'new'}`"
        :record="recipe"
        :kitchen-id="kitchenId"
        :can-edit="outcome === 'ready' || outcome === 'empty'"
        :preparations="preparations"
        :ingredients="ingredientOptions"
        :ingredients-outcome="ingredientOutcome"
        :ingredients-error="ingredientError"
        @created="navigateTo(recipeTo($event))"
      />
    </template>
  </KitchenPrepAndProductionLibrary>
  <FireState
    v-else-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    entity="preparation library"
    :error="error"
  />
  <UAlert
    v-else
    title="Select a Kitchen"
    description="Choose a Kitchen to view its preparations and recipes."
    color="neutral"
    variant="soft"
  />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import { useKitchenChildCollection } from '../../composables/useKitchenChildCollection'
import { useIngredientCollection } from '../../../ingredient/composables/useIngredientCollection'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenPreparationsRead } from '../../preparation/composables/useKitchenPreparationsRead'
import { useKitchenRecipesRead } from '../../recipe/composables/useKitchenRecipesRead'
const props = defineProps<{
  view: 'preparations' | 'recipes'
  selectedId?: string
}>()
const workspace = useKitchenWorkspace()
const catalogue = useIngredientCollection({
  enabled: () => props.view === 'recipes',
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
  props.view === 'recipes' ? kitchenId.value : ''
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
</script>
