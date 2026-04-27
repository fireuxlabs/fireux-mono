<template>
  <section class="space-y-6">
    <SupplierCatalogueCollectionManager
      :collection="demoCatalogueItems"
      :title="catalogueTitle"
      :description="catalogueDescription"
      :empty-title="emptyTitle"
      :empty-description="emptyDescription"
      search-placeholder="Search catalogue items…"
      initial-variant="pill"
      :dev-context="devJsonContext"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleCatalogue } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleCatalogue'

const {
  selectedMode,
  supplierLabel,
  linkedIngredientIds,
  state,
  catalogueState,
  demoCatalogueItems,
  emptyTitle,
  emptyDescription,
  modeLabel,
} = useSupplierConsoleCatalogue()

const catalogueTitle = computed(() =>
  supplierLabel.value ? `${supplierLabel.value} Catalogue` : 'Supplier Catalogue'
)

const catalogueDescription = computed(() => {
  const parts = [
    modeLabel.value,
    `state: ${state.value || 'missing'}`,
    `catalogue: ${catalogueState.value || 'missing'}`,
    `${linkedIngredientIds.value.length} linked ingredients`,
  ]

  return parts.join(' · ')
})

const devJsonContext = computed(
  () => `console supplier · catalogue · ${selectedMode.value}`
)
</script>
