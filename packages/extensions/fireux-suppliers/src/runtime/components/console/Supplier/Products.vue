<template>
  <section class="console-surface space-y-6">
    <div v-if="isDev">
      <DevJson
        title="Supplier Products Flags (JSON)"
        context="console supplier products · flags"
        :data="productsFlagsDebugData"
        :default-open="false"
      />
    </div>

    <OrganismsConsoleSupplierProductsRead
      :product-items="productItems"
      :pending="pending"
      :title="productsTitle"
      :description="productsDescription"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      :dev-context="devJsonContext"
    />

    <OrganismsConsoleSupplierProductsWrite v-if="canWrite" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleProducts } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleProducts'

const {
  selectedMode,
  supplierId,
  supplierLabel,
  supplierProductsCollectionPath,
  productItems,
  pending,
  canWrite,
  productsTitle,
  productsDescription,
  emptyTitle,
  emptyDescription,
  devJsonContext,
} = useSupplierConsoleProducts()

const productsFlagsDebugData = computed(() => ({
  mode: selectedMode.value,
  supplierId: supplierId.value,
  supplierName: supplierLabel.value,
  supplierProductsCollectionPath: supplierProductsCollectionPath.value,
  productItemsCount: productItems.value.length,
  pending: pending.value,
  canWrite: canWrite.value,
}))
const isDev = import.meta.dev
</script>
