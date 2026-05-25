<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive Oil"
        icon="i-lucide-package"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import type { KitchenIngredientCreateForm } from './types'

const form = defineModel<KitchenIngredientCreateForm>('form', { required: true })
</script>
