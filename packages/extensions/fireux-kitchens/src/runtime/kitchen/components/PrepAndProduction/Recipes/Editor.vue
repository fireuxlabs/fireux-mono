<template>
  <UButton
    label="Edit"
    aria-label="Edit Recipe"
    icon="i-lucide-pencil"
    color="neutral"
    variant="soft"
    :disabled="!canEdit"
    @click="start"
  />
  <UModal v-model:open="open" title="Edit Recipe">
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
        <KitchenPrepAndProductionRecipesEditorInputs
          v-model="draft.inputs"
          :ingredients="ingredients"
          :preparations="preparationOptions"
          :disabled="saving"
        />
        <KitchenPrepAndProductionRecipesEditorMethod
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
            label="Save changes"
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
import { computed, ref } from 'vue'
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import type { Recipe } from '../../../recipe/models/model'
import type { Preparation } from '../../../preparation/models/model'
import { recipeDraft, recipeDraftChanges } from '../../../recipe/editor'
import { usePrepMutation } from '../../../composables/prep/usePrepMutation'
const props = defineProps<{
  record: Recipe
  kitchenId: string
  canEdit: boolean
  preparations: Preparation[]
  ingredients: Array<{ value: string; label: string }>
}>()
const open = ref(false),
  baseline = ref(recipeDraft(props.record))
const command = usePrepMutation([
  () => props.kitchenId,
  () => props.record.id,
  () => props.canEdit,
])
const preparationOptions = computed(() =>
  props.preparations.map((row) => ({ value: row.id, label: row.name }))
)
const unlinkedOutput = '__unlinked__'
const outputOptions = computed(() => [
  { value: unlinkedOutput, label: 'Not linked' },
  ...(props.record.output_preparation_id &&
  !props.preparations.some(
    (row) => row.id === props.record.output_preparation_id
  )
    ? [
        {
          value: props.record.output_preparation_id,
          label: `${props.record.output_preparation_id} (unavailable)`,
        },
      ]
    : []),
  ...preparationOptions.value,
])
const { draft, changed, saving, error, begin, save } = useIdentityEditor({
  open,
  scope: [() => props.kitchenId, () => props.record.id],
  canEdit: () => props.canEdit,
  createDraft: () => recipeDraft(props.record),
  signature: JSON.stringify,
  save: async (value, isCurrent) => {
    const changes = recipeDraftChanges(value, baseline.value)
    if (!Object.keys(changes).length) return
    await command.update(
      'recipes',
      props.kitchenId,
      props.record.id,
      changes,
      isCurrent
    )
  },
  onSaved: () => {
    open.value = false
  },
  errorMessage: 'Recipe could not be saved.',
})
const outputSelection = computed({
  get: () => draft.value.output || unlinkedOutput,
  set: (value: string) => {
    draft.value.output = value === unlinkedOutput ? '' : value
  },
})
function start() {
  baseline.value = recipeDraft(props.record)
  begin()
}
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
