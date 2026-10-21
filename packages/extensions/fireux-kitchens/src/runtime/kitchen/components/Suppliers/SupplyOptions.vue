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

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-clipboard-list"
          title="Supply options are not connected"
          description="Ingredient-to-supplier purchasing options are not available yet."
        />

        <UButton
          v-if="hasIntegratedCatalogue"
          :to="cataloguePath"
          icon="i-lucide-book-open"
        >
          View catalogue
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspaceSupplierSupplyOptions } from '../../composables/workspace/suppliers/useKitchenWorkspaceSupplierSupplyOptions'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  cataloguePath,
  title,
  description,
} = useKitchenWorkspaceSupplierSupplyOptions()

</script>
