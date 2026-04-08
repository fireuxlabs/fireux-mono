<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Supplier Summary</div>
        <p class="text-sm text-dimmed">
          Live details for the currently selected supplier.
        </p>
      </div>
    </template>

    <div v-if="supplier" class="grid gap-3 text-sm text-dimmed sm:grid-cols-2">
      <div>
        Supplier ID:
        <span class="font-medium text-default">{{ supplierId }}</span>
      </div>
      <div v-if="organizationName">
        Organization:
        <span class="font-medium text-default">{{ organizationName }}</span>
      </div>
      <div v-if="supplierHeadline" class="sm:col-span-2">
        Headline:
        <span class="font-medium text-default">{{ supplierHeadline }}</span>
      </div>
      <div v-if="deliveryAreas">
        Delivery Areas:
        <span class="font-medium text-default">{{ deliveryAreas }}</span>
      </div>
      <div v-if="productCategories">
        Categories:
        <span class="font-medium text-default">{{ productCategories }}</span>
      </div>
      <div v-if="supplierSummary" class="sm:col-span-2">
        Summary:
        <span class="font-medium text-default">{{ supplierSummary }}</span>
      </div>
      <div v-if="supplierBio" class="sm:col-span-2">
        Bio:
        <span class="font-medium text-default">{{ supplierBio }}</span>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No live supplier is currently selected.
    </p>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useActiveSupplier } from '../../composables/fireux/app/supplier-console/useActiveSupplier'

const supplierState = useActiveSupplier()
const supplier = computed(
  () => supplierState.supplier.value as Record<string, unknown> | null
)

const normalizeString = (value: unknown): string => String(value || '').trim()
const normalizeList = (value: unknown): string =>
  Array.isArray(value)
    ? value
        .map((entry) => normalizeString(entry))
        .filter(Boolean)
        .join(', ')
    : ''

const supplierId = computed(() => supplierState.id.value)
const organizationName = computed(() =>
  normalizeString(supplier.value?.supplier_organization_name || supplier.value?.name)
)
const supplierHeadline = computed(() =>
  normalizeString(supplier.value?.supplier_headline)
)
const deliveryAreas = computed(() =>
  normalizeList(supplier.value?.supplier_delivery_areas)
)
const productCategories = computed(() =>
  normalizeList(supplier.value?.supplier_product_categories)
)
const supplierSummary = computed(() => normalizeString(supplier.value?.summary))
const supplierBio = computed(() => normalizeString(supplier.value?.supplier_bio))
</script>
