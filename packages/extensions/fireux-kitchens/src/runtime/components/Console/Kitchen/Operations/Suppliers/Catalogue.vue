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

    <SupplierCatalogueCollectionManager
      v-if="hasIntegratedCatalogue"
      :collection="catalogues"
      :pending="pending"
      :title="title"
      :description="description"
      empty-title="No supplier catalogue"
      empty-description="No supplier-owned catalogue rows are available yet."
      dev-context="console kitchen supplier catalogue"
    />

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-store"
      title="Supplier not in the ecosystem"
      description="This supplier is only a public reference right now, so there is no supplier-owned catalogue to browse."
    >
      <template #actions>
        <UButton
          :to="procurementPath"
          color="neutral"
          variant="soft"
          icon="i-lucide-list-checks"
        >
          Make procurement list
        </UButton>
      </template>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import SupplierCatalogueCollectionManager from 'fireux-suppliers/runtime/components/Supplier/Catalogue/Collection/Manager.vue'
import { useKitchenConsoleSupplierCatalogue } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleSupplierCatalogue'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  catalogues,
  pending,
  title,
  description,
  procurementPath,
} = useKitchenConsoleSupplierCatalogue()
</script>
