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

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-clipboard-list"
          title="Supply options are not connected"
          description="Ingredient-to-supplier purchasing options are not available yet."
        />

        <UButton
          v-if="hasIntegratedCatalogue"
          :to="cataloguePath"
          icon="i-lucide-book-open"
        >
          View catalogue
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useKitchenSupplierDetail } from '../../composables/suppliers/useKitchenSupplierDetail'
const workspace = useKitchenWorkspace()
const { supplier, hasIntegratedCatalogue } = useKitchenSupplierDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('supplierId')
)
const title = computed(
  () =>
    `${String(supplier.value?.company_place?.short_name || supplier.value?.company_place?.name || 'Supplier')} supply options`
)
const description =
  'Supply options are not connected yet. The supplier catalogue remains available where integrated.'

const supplierRouteId = useRouteParam('supplierId')
const supplierBasePath = computed(() =>
  supplierRouteId.value
    ? `/workspace/kitchen/stock/suppliers/${encodeURIComponent(supplierRouteId.value)}`
    : ''
)
const cataloguePath = computed(() =>
  supplierBasePath.value ? `${supplierBasePath.value}/catalogue` : ''
)
</script>
