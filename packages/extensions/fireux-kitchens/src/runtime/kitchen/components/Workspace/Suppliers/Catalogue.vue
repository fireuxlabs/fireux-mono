<template>
  <div class="space-y-6">
    <UButton
      :to="supplierBasePath"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to supplier
    </UButton>
    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-store"
      title="Catalogue browsing is not connected"
      description="Supplier catalogues are managed in Bringli. They are not available to browse in this Kitchen yet."
    />
  </div>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceSupplier } from '../../../composables/workspace/suppliers/useKitchenWorkspaceSupplier'
const { supplierBasePath } = useKitchenWorkspaceSupplier()
</script>
