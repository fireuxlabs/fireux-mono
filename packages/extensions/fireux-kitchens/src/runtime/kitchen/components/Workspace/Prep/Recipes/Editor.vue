<template>
  <UButton
    :label="record ? 'Edit' : 'Add recipe'"
    :aria-label="record ? 'Edit Recipe' : 'Add Recipe'"
    :icon="record ? 'i-lucide-pencil' : 'i-lucide-plus'"
    color="neutral"
    variant="soft"
    :disabled="!canEdit"
    @click="start"
  />
  <UModal v-model:open="open" :title="record ? 'Edit Recipe' : 'Add Recipe'">
    <template #body>
      <form class="recipe-editor" @submit.prevent="save">
        <UFormField label="Name" required
          ><UInput v-model="draft.name" :maxlength="140" :disabled="saving"
        /></UFormField>
        <UFormField label="Description"
          ><UTextarea
            v-model="draft.description"
            :maxlength="2000"
            :rows="2"
            :disabled="saving"
        /></UFormField>
        <UFormField label="Produces"
          ><USelect
            v-model="outputSelection"
            :items="outputOptions"
            :disabled="saving"
        /></UFormField>
        <div class="recipe-editor__yield">
          <UFormField label="Expected yield"
            ><!-- @vue-generic {string | number, {}} -->
            <UInput
              v-model="draft.yieldQuantity"
              type="number"
              min="0.001"
              step="any"
              :disabled="saving"
          /></UFormField>
          <UFormField label="Yield unit"
            ><UInput
              v-model="draft.yieldUnit"
              placeholder="portions, g, ml"
              :maxlength="40"
              :disabled="saving"
          /></UFormField>
        </div>
        <FireState
          :outcome="ingredientsOutcome"
          entity="Kitchen ingredients"
          :error="ingredientsError"
        />
        <KitchenWorkspacePrepRecipesEditorInputs
          v-model="draft.inputs"
          :ingredients="ingredients"
          :preparations="preparationOptions"
          :disabled="saving"
        />
        <KitchenWorkspacePrepRecipesEditorMethod
          v-model="draft.method"
          :disabled="saving"
        />
        <UFormField label="Source title"
          ><UInput
            v-model="draft.sourceTitle"
            :maxlength="200"
            :disabled="saving"
        /></UFormField>
        <UFormField label="Source URL"
          ><UInput
            v-model="draft.sourceUrl"
            type="url"
            :maxlength="2000"
            :disabled="saving"
        /></UFormField>
        <div v-if="error" role="alert">
          <p>{{ error }}</p>
          <FireCopyError :message="error" />
        </div>
        <div class="fx-card__actions">
          <UButton
            label="Cancel"
            type="button"
            color="neutral"
            variant="ghost"
            @click="open = false"
          /><UButton
            :label="record ? 'Save changes' : 'Create recipe'"
            type="submit"
            :loading="saving"
            :disabled="!changed || !canEdit || saving"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import type { Recipe } from '../../../../recipe/models/model'
import type { Preparation } from '../../../../preparation/models/model'
import { useKitchenWorkspacePrepRecipeEditor } from '../../../../composables/workspace/prep/recipe/editor'
const props = defineProps<{
  record?: Recipe
  kitchenId: string
  canEdit: boolean
  preparations: Preparation[]
  ingredients: Array<{ value: string; label: string }>
  ingredientsOutcome: ReadOutcome
  ingredientsError?: unknown
}>()
const emit = defineEmits<{ created: [id: string] }>()
const {
  open,
  draft,
  changed,
  saving,
  error,
  outputSelection,
  outputOptions,
  preparationOptions,
  start,
  save,
} = useKitchenWorkspacePrepRecipeEditor(
  {
    record: () => props.record,
    kitchenId: () => props.kitchenId,
    canEdit: () => props.canEdit,
    preparations: () => props.preparations,
  },
  (id) => emit('created', id)
)
</script>
<style scoped>
.recipe-editor {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.recipe-editor__yield {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}
</style>
