<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive Oil"
        icon="i-lucide-package"
      />
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
        :rows="2"
        placeholder="Optional notes for this ingredient"
      />
    </UFormField>

    <UFormField label="Unit" required>
      <USelect v-model="form.unit" :options="ingredientUnitOptions" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { ingredientUnitOptions } from './types'
import type { KitchenIngredientCreateForm } from './types'

const form = defineModel<KitchenIngredientCreateForm>('form', { required: true })
</script>
