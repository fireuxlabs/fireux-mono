<template>
  <div class="workspace-surface">
    <UButton
      to="/workspace/kitchen/stock/suppliers"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to suppliers
    </UButton>

    <KitchenSuppliersDetailSummary v-if="supplier" :supplier="supplier" />

    <UCard v-if="supplier">
      <div class="fx-card-body-stack">
        <div class="card__media">
          <UIcon
            :name="
              isEcosystemSupplier ? 'i-lucide-store' : 'i-lucide-clipboard-list'
            "
          />
          <div>
            <h3>
              {{ statusTitle }}
            </h3>
            <p>
              {{ statusDescription }}
            </p>
          </div>
        </div>

        <div class="fx-card__actions">
          <UButton
            v-if="hasIntegratedCatalogue"
            :to="cataloguePath"
            icon="i-lucide-book-open"
          >
            View catalogue
          </UButton>
          <UButton
            :to="supplyOptionsPath"
            color="neutral"
            variant="soft"
            icon="i-lucide-list-checks"
          >
            View supply options
          </UButton>
        </div>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading supplier' : 'Supplier not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen supplier.'
          : `No supplier was found for ${supplierId || 'this route'}.`
      "
    />

    <FireDiagnosticsDebugPanel
      title="Kitchen supplier detail"
      scope="workspace"
      object-origin="fetched"
      :objects="{ supplier }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { computed } from 'vue'
import { useKitchenSupplierDetail } from '../../../composables/suppliers/useKitchenSupplierDetail'

const {
  supplier,
  supplierId,
  pending,
  hasIntegratedCatalogue,
  isEcosystemSupplier,

  debug,
} = useKitchenSupplierDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('supplierId')
)
const statusTitle = computed(() =>
  isEcosystemSupplier.value
    ? 'Supplier catalogue available'
    : 'Supplier not in the ecosystem'
)
const statusDescription = computed(() =>
  isEcosystemSupplier.value
    ? 'Use the supplier catalogue to review official product options connected to this kitchen.'
    : 'This supplier is currently a public reference without an integrated catalogue.'
)

const supplierRouteId = useRouteParam('supplierId')
const supplierBasePath = computed(() =>
  supplierRouteId.value
    ? `/workspace/kitchen/stock/suppliers/${encodeURIComponent(supplierRouteId.value)}`
    : ''
)
const cataloguePath = computed(() =>
  supplierBasePath.value ? `${supplierBasePath.value}/catalogue` : ''
)
const supplyOptionsPath = computed(() =>
  supplierBasePath.value ? `${supplierBasePath.value}/supply-options` : ''
)
</script>
