<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive oil"
        icon="i-lucide-package"
      />
    </UFormField>

    <UFormField label="Unit" required>
      <USelect v-model="form.unit" :options="ingredientUnitOptions" />
    </UFormField>

    <UFormField label="Category">
      <UInput
        v-model="form.category"
        placeholder="e.g. Produce"
        icon="i-lucide-tag"
      />
    </UFormField>

    <UFormField label="Description">
      <UTextarea
        v-model="form.description"
        :rows="3"
        placeholder="Optional notes for this ingredient"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { ingredientUnitOptions } from './types'
import type { IngredientCreateForm } from './types'

const form = defineModel<IngredientCreateForm>('form', { required: true })
</script>
