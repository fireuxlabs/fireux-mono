<template>
  <div class="space-y-6">
    <SupplierCatalogueCollectionManager
      :collection="catalogues"
      :pending="pending"
      :collection-path="supplierCataloguesCollectionPath"
      :title="catalogueTitle"
      :description="catalogueDescription"
    />

    <DevJson
      v-if="isDev"
      title="Supplier Catalogue Flags (JSON)"
      context="console supplier catalogue · read"
      :data="debug"
      :default-open="false"
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
