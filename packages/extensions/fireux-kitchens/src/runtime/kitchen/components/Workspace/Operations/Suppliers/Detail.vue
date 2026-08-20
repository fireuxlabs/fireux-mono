<template>
  <div class="space-y-6">
    <UButton
      to="/workspace/kitchen/suppliers"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to suppliers
    </UButton>

    <WorkspaceKitchenOperationsSuppliersCardsProfile
      v-if="supplier"
      :supplier="supplier"
    />

    <UCard v-if="supplier">
      <div class="space-y-4">
        <div class="flex flex-wrap items-start gap-3">
          <UIcon
            :name="isEcosystemSupplier ? 'i-lucide-store' : 'i-lucide-clipboard-list'"
            class="mt-1 size-5 shrink-0 text-primary"
          />
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-semibold text-highlighted">
              {{ statusTitle }}
            </h3>
            <p class="mt-1 text-sm leading-6 text-muted">
              {{ statusDescription }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
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

    <DevDebugPanel
      title="Kitchen supplier detail"
      scope="workspace"
      object-origin="fetched"
      :objects="{ supplier }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceSupplier } from '../../../../composables/workspace/operations/Suppliers/useKitchenWorkspaceSupplier'

const {
  supplier,
  supplierId,
  pending,
  hasIntegratedCatalogue,
  isEcosystemSupplier,
  cataloguePath,
  supplyOptionsPath,
  debug,
} = useKitchenWorkspaceSupplier()
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
</script>
