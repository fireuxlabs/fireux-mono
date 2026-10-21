<template>
  <div class="grid gap-6">
    <UFormField label="Name" required
      ><UInput v-model="name" aria-label="Recipe name" class="w-full"
    /></UFormField>
    <UFormField label="Description"
      ><UTextarea
        v-model="description"
        aria-label="Recipe description"
        :rows="2"
        class="w-full"
    /></UFormField>
    <div class="grid grid-cols-2 gap-3">
      <UFormField label="Yield" required
        ><UInput
          v-model="yieldValue.quantity"
          type="number"
          min="0.001"
          step="any"
          aria-label="Yield quantity"
          class="w-full"
      /></UFormField>
      <UFormField label="Unit" required
        ><UInput
          v-model="yieldValue.unit"
          placeholder="portions, kg, litres…"
          aria-label="Yield unit"
          class="w-full"
      /></UFormField>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RecipePreparation } from '../../../../models/recipe-preparation'
const name = defineModel<string>('name', { required: true })
const description = defineModel<string>('description', { required: true })
const yieldValue = defineModel<RecipePreparation['yield']>('yield', {
  required: true,
})
</script>
