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
    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-store"
      title="Catalogue browsing is not connected"
      description="Supplier catalogues are managed in Bringli. They are not available to browse in this Kitchen yet."
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspace } from '../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { useKitchenSupplierDetail } from '../../composables/suppliers/useKitchenSupplierDetail'
const {} = useKitchenSupplierDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('supplierId')
)

const supplierRouteId = useRouteParam('supplierId')
const supplierBasePath = computed(() =>
  supplierRouteId.value
    ? `/workspace/kitchen/stock/suppliers/${encodeURIComponent(supplierRouteId.value)}`
    : ''
)
</script>
