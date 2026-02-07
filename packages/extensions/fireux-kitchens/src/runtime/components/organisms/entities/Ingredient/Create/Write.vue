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

    <UFormField label="Supplier">
      <UInput
        v-model="form.supplier_name"
        placeholder="e.g. Metro"
        icon="i-lucide-truck"
      />
    </UFormField>

    <UInputNumber
      v-model="form.cost_per_unit"
      label="Cost per unit"
      placeholder="0.00"
      :min="0"
      :step="0.01"
    />

    <UFormField label="SKU">
      <UInput
        v-model="form.sku"
        placeholder="e.g. OIL-001"
        icon="i-lucide-barcode"
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
