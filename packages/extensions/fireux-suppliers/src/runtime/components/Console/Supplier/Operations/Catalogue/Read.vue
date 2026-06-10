<template>
  <div class="space-y-6">
    <SupplierCatalogueCollectionManager
      :collection="catalogues"
      :pending="pending"
      :title="catalogueTitle"
      :description="catalogueDescription"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :dev-context="devJsonContext"
    />

    <DevFireuxDebugPanel
      title="Supplier catalogue"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleCatalogue } from '../../../../../composables/fireux/console/supplier/Operations/Catalogue/useSupplierConsoleCatalogue'

const {
  catalogues,
  pending,
  catalogueTitle,
  catalogueDescription,
  emptyTitle,
  emptyDescription,
  devJsonContext,
  debug,
} = useSupplierConsoleCatalogue()
</script>
