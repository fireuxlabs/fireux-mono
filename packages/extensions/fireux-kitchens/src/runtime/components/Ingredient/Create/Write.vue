<template>
  <div class="space-y-3">
    <UFormField label="Name" required>
      <UInput
        v-model="form.name"
        placeholder="e.g. Olive oil"
        icon="i-lucide-package"
      />
    </UFormField>

    <div class="grid gap-3 sm:grid-cols-2">
      <UFormField label="Category" required>
        <USelect v-model="form.category" :items="INGREDIENT_CATEGORY_OPTIONS" />
      </UFormField>

      <UFormField label="Kind" required>
        <USelect v-model="form.kind" :items="INGREDIENT_KIND_OPTIONS" />
      </UFormField>
    </div>

    <UFormField label="Aliases" hint="Synonyms only—not translations">
      <UInput v-model="form.aliases" placeholder="e.g. Rucola, Arugula" />
    </UFormField>

    <UFormField
      label="Parent Ingredient ID"
      hint="Optional relationship to an existing active Ingredient"
    >
      <UInput v-model="form.parent_ingredient_id" placeholder="e.g. mushroom" />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import type { IngredientCreateForm } from './types'
import {
  INGREDIENT_CATEGORY_OPTIONS,
  INGREDIENT_KIND_OPTIONS,
} from '../../../models/ingredient-taxonomy'

const form = defineModel<IngredientCreateForm>('form', { required: true })
</script>
