<template>
  <section class="recipe-inputs-editor">
    <h3>Inputs</h3>
    <div
      v-for="(row, index) in inputs"
      :key="index"
      class="recipe-inputs-editor__row"
    >
      <div class="recipe-inputs-editor__fields">
        <UFormField label="Type"
          ><USelect
            v-model="row.kind"
            :items="kinds"
            :disabled="disabled"
            @update:model-value="row.reference_id = ''"
        /></UFormField>
        <UFormField
          :label="row.kind === 'ingredient' ? 'Ingredient' : 'Preparation'"
          ><USelect
            v-model="row.reference_id"
            :items="choices(row)"
            :disabled="disabled"
        /></UFormField>
        <UFormField label="Quantity"
          ><!-- @vue-generic {string | number, {}} -->
          <UInput
            v-model="row.quantity"
            type="number"
            min="0.001"
            step="any"
            :disabled="disabled"
        /></UFormField>
        <UFormField label="Unit"
          ><UInput
            v-model="row.unit"
            placeholder="g, ml, portions"
            :maxlength="40"
            :disabled="disabled"
        /></UFormField>
      </div>
      <UFormField label="Note"
        ><UInput v-model="row.note" :maxlength="500" :disabled="disabled"
      /></UFormField>
      <UButton
        :aria-label="`Remove input ${index + 1}`"
        label="Remove"
        icon="i-lucide-trash-2"
        color="neutral"
        variant="ghost"
        :disabled="disabled"
        @click="inputs.splice(index, 1)"
      />
    </div>
    <UButton
      label="Add input"
      icon="i-lucide-plus"
      color="neutral"
      variant="soft"
      :disabled="disabled || inputs.length >= 100"
      @click="
        inputs.push({
          kind: 'ingredient',
          reference_id: '',
          quantity: 1,
          unit: 'g',
          note: '',
        })
      "
    />
  </section>
</template>
<script setup lang="ts">
import type { RecipeDraft } from '../../../../../recipe/editor'
const inputs = defineModel<RecipeDraft['inputs']>({ required: true })
const props = defineProps<{
  ingredients: Array<{ value: string; label: string }>
  preparations: Array<{ value: string; label: string }>
  disabled: boolean
}>()
const kinds = [
  { value: 'ingredient', label: 'Ingredient' },
  { value: 'preparation', label: 'Preparation' },
]
const choices = (row: RecipeDraft['inputs'][number]) => {
  const rows =
    row.kind === 'ingredient' ? props.ingredients : props.preparations
  return row.reference_id &&
    !rows.some((option) => option.value === row.reference_id)
    ? [
        { value: row.reference_id, label: `${row.reference_id} (unavailable)` },
        ...rows,
      ]
    : rows
}
</script>
<style scoped>
.recipe-inputs-editor,
.recipe-inputs-editor__row {
  display: grid;
  gap: calc(var(--spacing) * 3);
}
.recipe-inputs-editor__row {
  padding-block: calc(var(--spacing) * 3);
  border-block-end: 1px solid var(--ui-border);
}
.recipe-inputs-editor__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}
@media (max-width: 480px) {
  .recipe-inputs-editor__fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
