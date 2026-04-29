<template>
  <div class="space-y-6">
    <SupplierCatalogueCollectionManager
      :collection="catalogues"
      :pending="pending"
      :collection-path="supplierCataloguesCollectionPath"
      :title="catalogueTitle"
      :description="catalogueDescription"
    />

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Supplier catalogue"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useSupplierConsoleCatalogue } from '../../../../../composables/fireux/app/supplier-console/useSupplierConsoleCatalogue'

const {
  catalogues,
  pending,
  catalogueTitle,
  catalogueDescription,
  supplierCataloguesCollectionPath,
  debug,
} = useSupplierConsoleCatalogue()
const isDev = import.meta.dev
</script>
