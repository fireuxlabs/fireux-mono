<template>
  <KitchenWorkspacePrepLibrary
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
      <KitchenWorkspacePrepPreparationsEditor
        v-if="preparation"
        :key="`${kitchenId}:${preparation.id}`"
        :record="preparation"
        :kitchen-id="kitchenId"
        :can-edit="outcome === 'ready'"
      />
      <KitchenWorkspacePrepRecipesEditor
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
  </KitchenWorkspacePrepLibrary>
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
import KitchenWorkspacePrepRecipesEditor from './Recipes/Editor.vue'
import { navigateTo } from '#imports'
import { useKitchenWorkspacePrepLibrary } from '../../../composables/workspace/prep/library'
const props = defineProps<{
  view: 'preparations' | 'recipes'
  selectedId?: string
}>()
const {
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
} = useKitchenWorkspacePrepLibrary(() => props.view)
</script>
