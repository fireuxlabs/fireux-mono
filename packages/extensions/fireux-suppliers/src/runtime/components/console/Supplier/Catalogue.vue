<template>
  <section class="console-surface space-y-6">
    <div v-if="isDev">
      <DevJson
        title="Supplier Catalogue Flags (JSON)"
        context="console supplier catalogue · flags"
        :data="catalogueFlagsDebugData"
        :default-open="false"
      />
    </div>

    <OrganismsConsoleSupplierCatalogueRead
      :title="catalogueTitle"
      :description="catalogueDescription"
      :collection-path="supplierCataloguesCollectionPath"
      :pending="pending"
    />

    <OrganismsConsoleSupplierCatalogueWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleCatalogue } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleCatalogue'

const {
  selectedMode,
  supplierId,
  supplierLabel,
  rootCollection,
  state,
  catalogueState,
  supplierCataloguesCollectionPath,
  pending,
  canWrite,
  catalogueTitle,
  catalogueDescription,
} = useSupplierConsoleCatalogue()

const catalogueFlagsDebugData = computed(() => ({
  mode: selectedMode.value,
  supplierId: supplierId.value,
  supplierName: supplierLabel.value,
  rootCollection: rootCollection.value,
  state: state.value,
  catalogueState: catalogueState.value,
  supplierCataloguesCollectionPath: supplierCataloguesCollectionPath.value,
  pending: pending.value,
  canWrite: canWrite.value,
}))
const isDev = import.meta.dev
</script>
