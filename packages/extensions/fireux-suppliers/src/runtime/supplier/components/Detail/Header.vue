<template>
  <UPageHeader
    :title="supplier.identity.slug || supplier.id"
    description="Supplier details."
  >
    <template #headline>Supplier</template>
    <template #links>
      <UButton
        to="/suppliers"
        label="All Suppliers"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
import type { Supplier } from '../../models/Supplier.model'
defineProps<{ supplier: Supplier }>()
</script>
