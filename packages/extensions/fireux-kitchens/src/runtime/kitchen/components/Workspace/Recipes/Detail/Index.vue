<template>
  <section class="recipe-detail workspace-surface">
    <div class="recipe-detail-heading">
      <UButton
        to="/workspace/kitchen/prep/recipes"
        label="Recipes"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      /><UButton
        v-if="editing || (recipe && canWrite)"
        :label="editing ? 'Cancel' : 'Edit recipe'"
        :icon="editing ? 'i-lucide-x' : 'i-lucide-pencil'"
        color="neutral"
        variant="soft"
        @click="editing ? closeEditor() : editRecipe()"
      />
    </div>
    <WorkspaceKitchenRecipesForm
      v-if="editing && editorRecipe"
      :key="`${kitchenId}/${editorRecipe.id}`"
      :recipe="editorRecipe"
      :kitchen-id="kitchenId"
      :root-collection="rootCollection"
      :database-id="databaseId"
      :can-write="canWrite && outcome === 'ready'"
      @saved="closeEditor"
    />
    <UAlert
      v-if="outcome === 'idle' || outcome === 'empty'"
      title="Select a kitchen"
      description="Choose a Kitchen before viewing its recipes."
      color="neutral"
    />
    <MoleculesStateCard
      v-else-if="error"
      state="error"
      title="Recipe unavailable"
      :description="String(error)"
    />
    <template v-else-if="recipe">
      <template v-if="!editing">
        <h1>{{ recipe.name }}</h1>
        <MoleculesStateCard
          v-if="ingredientsError"
          state="error"
          title="Ingredient details unavailable"
          description="Ingredient names could not be loaded. Recipe quantities and method remain available." />
        <p v-else-if="ingredientsPending" role="status">
          Loading ingredient details…
        </p>
        <MoleculesStateCard
          v-if="prepError"
          state="error"
          title="Prep items unavailable"
          description="Prep item details could not be loaded. Recipe quantities and method remain available." />
        <p v-else-if="prepPending" role="status">Loading prep items…</p>
        <WorkspaceKitchenRecipesPreparation
          :recipe="recipe"
          :ingredient-names="ingredientNames"
          :prep-item-names="prepItemNames"
          :prep-items="prepItems"
      /></template>
      <div v-if="canWrite && !editing" class="recipe-delete">
        <UButton
          label="Delete recipe"
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          :loading="deleting"
          @click="deleteSelectedRecipe"
        />
      </div>
    </template>
    <USkeleton v-else-if="pending" class="h-64" />
    <UAlert v-else title="Recipe not found" color="neutral" variant="soft" />
    <DiagnosticsDebugPanel
      launcher
      title="Kitchen recipe"
      object-origin="fetched"
      :objects="{ recipe }"
      :derived="debug"
    />
    <ContextRecord
      v-if="recipe && canWrite"
      :key="`${kitchenId}/${recipeId}`"
      title="Recipe AI context"
      endpoint="/api/workspace/kitchen/context"
      :scope="{ kitchenId, subject: 'recipe', recordId: recipeId }"
    />
  </section>
</template>
<script setup lang="ts">
import type { Recipe } from '../../../../models/recipe.model'
import { useRecipeScope } from '../../../../composables/recipe/useRecipeScope'
import { useKitchenPrepItems } from '../../../../composables/prep-item/useKitchenPrepItems'
import { navigateTo } from '#imports'
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceRecipe } from '../../../../composables/workspace/recipes/useKitchenWorkspaceRecipe'
import { useRecipeDelete } from '../../../../composables/recipe/useRecipeDelete'
import { useKitchenIngredients } from '../../../../composables/ingredients/useKitchenIngredients'
const {
  recipe,
  recipeId,
  kitchenId,
  storageKitchenId,
  outcome,
  rootCollection,
  databaseId,
  dishUsage,
  pending,
  canWrite,
  debug,
  error,
} = useKitchenWorkspaceRecipe()
const {
  ingredients,
  pending: ingredientsPending,
  error: ingredientsError,
} = useKitchenIngredients(storageKitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const {
  prepItems,
  pending: prepPending,
  error: prepError,
} = useKitchenPrepItems(storageKitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const prepItemNames = computed(() =>
  Object.fromEntries(prepItems.value.map((item) => [item.id, item.name]))
)
const ingredientNames = computed(() =>
  Object.fromEntries(
    ingredients.value.map((item) => [
      item.ingredient_id,
      item.name || item.ingredient_id,
    ])
  )
)
const editing = ref(false)
const editorRecipe = ref<Recipe | null>(null)
function closeEditor() {
  editing.value = false
  editorRecipe.value = null
}
function editRecipe() {
  if (!canWrite.value || !recipe.value) return
  editorRecipe.value = JSON.parse(JSON.stringify(recipe.value))
  editing.value = true
}
watch(
  [recipe, outcome],
  () => {
    if (!editing.value) return
    if (outcome.value === 'missing') {
      closeEditor()
      return
    }
    if (
      outcome.value === 'ready' &&
      recipe.value?.id === editorRecipe.value?.id
    )
      editorRecipe.value = recipe.value
  },
  { flush: 'sync' }
)
const deleting = ref(false)
const toast = useToastify()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const { deleteRecipe } = useRecipeDelete()
watch(
  [kitchenId, recipeId],
  () => {
    closeEditor()
  },
  { flush: 'sync' }
)
const captureScope = useRecipeScope([kitchenId, recipeId], () => {
  closeEditor()
  deleting.value = false
})
const deleteSelectedRecipe = async () => {
  const isCurrent = captureScope()
  if (!canWrite.value || !recipe.value || deleting.value) return

  const title = normalizeString(recipe.value.name || recipeId.value)
  const usageCount = dishUsage.value.length
  const usageNote = usageCount
    ? `\n\n${usageCount} dish record${usageCount === 1 ? '' : 's'} reference this recipe. This delete will not cascade.`
    : ''
  const ok = window.confirm(
    `Delete recipe "${title}"?\n\nThis will only delete the recipe document.${usageNote}`
  )
  if (!ok) return

  deleting.value = true

  try {
    await deleteRecipe(recipeId.value, { kitchenId: kitchenId.value })
    if (!isCurrent()) return
    toast.add({ title: 'Recipe deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/workspace/kitchen/prep/recipes')
  } catch (error) {
    if (!isCurrent()) return
    const message = String(
      (error as any)?.message || error || 'Failed to delete recipe'
    )
    toast.add({
      title: 'Recipe delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
</script>
<style scoped>
.recipe-detail {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 28px;
}
.recipe-detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h1 {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.recipe-delete {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--ui-border);
}
</style>
