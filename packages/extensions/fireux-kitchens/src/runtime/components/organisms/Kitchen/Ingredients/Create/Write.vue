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

    <UInputNumber
      v-model="form.on_hand_qty"
      label="On hand"
      placeholder="0"
      :min="0"
    />

    <UInputNumber
      v-model="form.par_qty"
      label="Par level"
      placeholder="0"
      :min="0"
    />

    <UInputNumber
      v-model="form.reorder_qty"
      label="Reorder qty"
      placeholder="0"
      :min="0"
    />

    <UFormField label="Storage location">
      <UInput
        v-model="form.storage_location"
        placeholder="e.g. Dry Storage A1"
        icon="i-lucide-map-pin"
      />
    </UFormField>

    <UFormField label="Supplier">
      <UInput
        v-model="form.supplier_name"
        placeholder="e.g. Metro"
        icon="i-lucide-truck"
      />
    </UFormField>

    <UFormField label="Supplier ID">
      <UInput
        v-model="form.supplier_id"
        placeholder="Optional supplier reference id"
        icon="i-lucide-fingerprint"
      />
    </UFormField>

    <UInputNumber
      v-model="form.cost_per_unit"
      label="Cost per unit"
      placeholder="0.00"
      :min="0"
      :step="0.01"
    />
  </div>
</template>

<script setup lang="ts">
import { ingredientUnitOptions } from './types'
import type { KitchenIngredientCreateForm } from './types'

const form = defineModel<KitchenIngredientCreateForm>('form', { required: true })
</script>
