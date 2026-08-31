<template>
  <USelect
    v-if="items.length"
    v-model="selectedSupplierId"
    :items="items"
    value-key="value"
    aria-label="Select Supplier"
    class="w-full sm:max-w-72"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierInterface'
import { useKitchenWorkspaceSuppliers } from '../../../composables/workspace/Suppliers/useKitchenWorkspaceSuppliers'

const { suppliers, selectedSupplierId } = useKitchenWorkspaceSuppliers()
const { cell } = useSupplierInterface()
const items = computed(() =>
  suppliers.value.flatMap((supplier) => {
    const card = cell(supplier)
    return card
      ? [
          {
            label: card.title || card.id,
            value: card.id,
          },
        ]
      : []
  })
)
</script>
