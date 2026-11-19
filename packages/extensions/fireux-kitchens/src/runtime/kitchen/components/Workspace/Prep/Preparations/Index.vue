<template>
  <WorkspacePageHeader title="Preparations" variant="child" />
  <Preparations.Controls
    v-if="ready"
    v-model="query"
    label="preparations"
    singular="preparation"
    :count="visible.length"
  />
  <Preparations.Collection
    v-model="query"
    :rows="visible"
    :labels="{ singular: 'preparation', plural: 'preparations' }"
    :outcome="collectionOutcome"
    :error="error"
    icon="i-lucide-cooking-pot"
    external-controls
  />
  <Preparations.Ai v-if="ready" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as Preparations from './index'
import { useLibraryCatalogue } from '../useLibraryCatalogue'
import { useKitchenWorkspacePrepLibrary } from '../../../../composables/workspace/prep/library'

const {
  kitchenId,
  preparations,
  recipes,
  recipeLinks,
  preparationTo,
  outcome,
  error,
} = useKitchenWorkspacePrepLibrary('preparations')
const rows = computed(() =>
  preparations.value.map((record) => {
    const count = recipes.value.filter(
      (recipe) =>
        recipe.output_preparation_id === record.id ||
        recipeLinks.value.some(
          (link) =>
            link.preparationId === record.id && link.recipeId === recipe.id
        )
    ).length
    return {
      ...record,
      to: preparationTo(record.id),
      summary: `${count} ${count === 1 ? 'recipe' : 'recipes'}`,
    }
  })
)
const collectionOutcome = computed(() =>
  !kitchenId.value && outcome.value === 'empty' ? 'idle' : outcome.value
)
const ready = computed(() =>
  ['ready', 'empty'].includes(collectionOutcome.value)
)
const { query, visible } = useLibraryCatalogue(rows)
</script>
