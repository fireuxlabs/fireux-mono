<template>
  <WorkspacePageHeader title="Recipes" variant="child">
    <template #actions>
      <Recipes.Create
        v-if="ready"
        :key="kitchenId"
        :kitchen-id="kitchenId"
        :can-edit="true"
        :preparations="preparations"
        :ingredients="ingredientOptions"
        :ingredients-outcome="ingredientOutcome"
        :ingredients-error="ingredientError"
        @created="navigateTo(recipeTo($event))"
      />
    </template>
  </WorkspacePageHeader>
  <Recipes.Controls
    v-if="ready"
    v-model="query"
    label="recipes"
    singular="recipe"
    :count="visible.length"
  />
  <Recipes.Collection
    v-model="query"
    :rows="visible"
    :labels="{ singular: 'recipe', plural: 'recipes' }"
    :outcome="collectionOutcome"
    :error="error"
    icon="i-lucide-notebook-tabs"
    external-controls
  />
  <Recipes.Ai v-if="ready" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateTo } from '#imports'
import * as Recipes from './index'
import { useLibraryCatalogue } from '../useLibraryCatalogue'
import { useKitchenWorkspacePrepLibrary } from '../../../../composables/workspace/prep/library'

const {
  kitchenId,
  preparations,
  recipes,
  recipeTo,
  outcome,
  error,
  ingredientOptions,
  ingredientOutcome,
  ingredientError,
} = useKitchenWorkspacePrepLibrary('recipes')
const rows = computed(() =>
  recipes.value.map((record) => ({
    ...record,
    to: recipeTo(record.id),
    summary: record.yield
      ? `${record.yield.quantity} ${record.yield.unit}`
      : undefined,
  }))
)
const collectionOutcome = computed(() =>
  !kitchenId.value && outcome.value === 'empty' ? 'idle' : outcome.value
)
const ready = computed(() =>
  ['ready', 'empty'].includes(collectionOutcome.value)
)
const { query, visible } = useLibraryCatalogue(rows)
</script>
