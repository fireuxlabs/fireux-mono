<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive oil"
        icon="i-lucide-package"
      />
    </UFormField>

    <UFormField label="Slug">
      <UInput
        :model-value="slug"
        icon="i-lucide-hash"
        readonly
        disabled
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IngredientCreateForm } from './types';

const form = defineModel<IngredientCreateForm>('form', { required: true })

const slug = computed(() =>
  String(form.value.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
)
</script>
