<template>
  <section class="space-y-6">
    <div v-if="supplier" class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Focus</div>
            <p class="text-sm text-dimmed">
              Metrics for the selected supplier.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            {{ supplierTitle }}
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ focusUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            User totals for the selected supplier are not wired yet.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">All</div>
            <p class="text-sm text-dimmed">
              Metrics across every supplier in the collection.
            </p>
          </div>
        </template>

        <div class="space-y-3">
          <div class="text-sm font-medium text-highlighted">
            All Suppliers
          </div>

          <div class="space-y-1">
            <div class="text-3xl font-semibold text-default">
              {{ allUsersValue }}
            </div>
            <div class="text-sm text-dimmed">Users</div>
          </div>

          <p class="text-sm text-dimmed">
            Total suppliers in scope: {{ totalSuppliersLabel }}.
          </p>
        </div>
      </UCard>
    </div>

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
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'

const { supplierState, supplier } = useSupplierConsole()
const { count: totalSuppliers } = useSupplierCollection()
const selectedSupplier = computed(
  () => supplierState.entity.value as Record<string, unknown> | null
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
  normalizeString(
    selectedSupplier.value?.supplier_organization_name || selectedSupplier.value?.name
  )
)
const supplierHeadline = computed(() =>
  normalizeString(selectedSupplier.value?.supplier_headline)
)
const deliveryAreas = computed(() =>
  normalizeList(selectedSupplier.value?.supplier_delivery_areas)
)
const productCategories = computed(() =>
  normalizeList(selectedSupplier.value?.supplier_product_categories)
)
const supplierSummary = computed(() => normalizeString(selectedSupplier.value?.summary))
const supplierBio = computed(() => normalizeString(selectedSupplier.value?.supplier_bio))
const supplierTitle = computed(
  () => supplier.value?.title || organizationName.value || supplierId.value || 'Selected Supplier'
)
const focusUsersValue = computed(() => '—')
const allUsersValue = computed(() => '—')
const totalSuppliersLabel = computed(() => String(totalSuppliers.value || 0))
</script>
