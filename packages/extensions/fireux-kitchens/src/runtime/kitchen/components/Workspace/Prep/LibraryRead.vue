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
      <UButton
        v-if="recipe && outcome === 'ready'"
        label="Remove recipe"
        color="error"
        variant="ghost"
        @click="recipeToRemove = recipe"
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
  <UModal
    :open="Boolean(recipeToRemove)"
    title="Remove recipe?"
    description="Only an unused Recipe can be permanently removed."
    :dismissible="!removing"
    @update:open="closeRemoval"
  >
    <template #body>
      <p>{{ recipeToRemove?.name }}</p>
      <p v-if="removeError" role="alert">{{ removeError }}</p>
    </template>
    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="ghost"
        :disabled="removing"
        @click="closeRemoval(false)"
      />
      <UButton
        label="Delete permanently"
        color="error"
        :loading="removing"
        :disabled="removing"
        @click="removeRecipe"
      />
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import KitchenWorkspacePrepRecipesEditor from './Recipes/Editor.vue'
import { navigateTo } from '#imports'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { usePrepMutation } from '../../../composables/prep/usePrepMutation'
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
const recipeToRemove = ref<{ id: string; name: string } | null>(null)
const removing = ref(false)
const removeError = ref('')
const scope = [kitchenId, () => props.view, () => props.selectedId]
const command = usePrepMutation(scope)
const capture = useCommandScope([...scope, command.scopeKey])
watch(
  [...scope, command.scopeKey],
  () => {
    removing.value = false
    closeRemoval(false)
  },
  { flush: 'sync' }
)
function closeRemoval(open: boolean) {
  if (open || removing.value) return
  recipeToRemove.value = null
  removeError.value = ''
}
async function removeRecipe() {
  const recipeId = recipeToRemove.value?.id
  if (
    !recipeId ||
    removing.value ||
    outcome.value !== 'ready' ||
    recipeId !== props.selectedId ||
    props.view !== 'recipes'
  )
    return
  const current = capture()
  removing.value = true
  removeError.value = ''
  try {
    await command.deleteRecipe(kitchenId.value, recipeId, current)
    if (!current()) return
    removing.value = false
    closeRemoval(false)
    await navigateTo(recipeTo())
  } catch (error) {
    if (current())
      removeError.value =
        error instanceof Error ? error.message : 'Recipe could not be removed.'
  } finally {
    if (current()) removing.value = false
  }
}
</script>
