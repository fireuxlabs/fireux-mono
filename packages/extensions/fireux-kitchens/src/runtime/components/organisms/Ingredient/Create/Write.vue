<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive oil"
        icon="i-lucide-package"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import type { IngredientCreateForm } from './types';

const form = defineModel<IngredientCreateForm>('form', { required: true })
</script>
