<template>
  <div class="mt-5" aria-label="Suppliers preview">
    <template v-if="suppliers.length">
      <div class="mb-3 flex flex-wrap justify-end gap-2">
        <UBadge color="neutral" variant="soft" size="sm">
          {{ suppliers.length }} suppliers
        </UBadge>
        <UBadge color="neutral" variant="outline" size="sm">
          {{ linkedIngredientCount }} ingredient links
        </UBadge>
      </div>

      <div class="grid max-h-[24rem] gap-3 overflow-y-auto pr-1">
        <article
          v-for="supplier in suppliers"
          :key="supplier.id"
          :data-supplier-id="supplier.id"
          class="overflow-hidden rounded-xl border border-default bg-default shadow-sm"
        >
          <KitchenSuppliersCardsCell
            :id="supplier.id"
            :title="supplier.name"
            :subtitle="supplier.headquartersLabel || supplier.headline"
            :avatar-url="supplier.logoImageUrl || supplier.imageUrl"
            :badges="supplier.categories"
            :prop="supplierSummary(supplier)"
            :link="false"
          />
        </article>
      </div>
    </template>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="error ? 'Suppliers preview unavailable' : 'No suppliers connected'"
      :description="error
        ? 'The shared Supplier records could not be loaded.'
        : 'This Kitchen does not have any Supplier links yet.'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MiseboxProductDemo } from '~/composables/product-demo/useMiseboxProductDemo'

type ProductDemoSupplier =
  MiseboxProductDemo['workspace']['suppliers'][number]

const props = defineProps<{
  error: boolean
  suppliers: ProductDemoSupplier[]
}>()

const linkedIngredientCount = computed(() =>
  props.suppliers.reduce(
    (total, supplier) => total + supplier.linkedIngredientCount,
    0
  )
)
const supplierSummary = (supplier: ProductDemoSupplier) => {
  const ingredients = `${supplier.linkedIngredientCount} ingredient${
    supplier.linkedIngredientCount === 1 ? '' : 's'
  }`
  const catalogues = `${supplier.catalogueCount} catalogue${
    supplier.catalogueCount === 1 ? '' : 's'
  }`
  return [
    ingredients,
    catalogues,
    supplier.headquartersLabel,
  ].filter(Boolean).join(' · ')
}
</script>
