<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/suppliers"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to suppliers
    </UButton>

    <SupplierProfile v-if="supplier" :supplier="supplier" />

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
            :to="procurementPath"
            color="neutral"
            variant="soft"
            icon="i-lucide-list-checks"
          >
            View procurement
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

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen supplier detail"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleSupplier } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleSupplier'
import SupplierProfile from '../../../Supplier/Cards/Profile.vue'

const {
  supplier,
  supplierId,
  pending,
  hasIntegratedCatalogue,
  isEcosystemSupplier,
  cataloguePath,
  procurementPath,
  debug,
} = useKitchenConsoleSupplier()
const isDev = import.meta.dev
const statusTitle = computed(() =>
  isEcosystemSupplier.value
    ? 'Supplier catalogue available'
    : 'Supplier not in the ecosystem'
)
const statusDescription = computed(() =>
  isEcosystemSupplier.value
    ? 'Use the supplier catalogue for official product options, or build a kitchen procurement list from it.'
    : 'This supplier is only a public reference right now. Make a temporary procurement list here until the supplier joins the ecosystem.'
)
</script>
