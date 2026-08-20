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

    <UPageCard v-if="hasIntegratedCatalogue">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-highlighted">
              {{ title }}
            </h2>
            <p class="text-sm text-dimmed">
              {{ description }}
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ cards.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="pending" class="text-sm text-dimmed">
        Loading supplier catalogue...
      </div>
      <div v-else-if="cards.length" class="space-y-4">
        <SupplierCataloguePresentation
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
        />
      </div>
      <p v-else class="text-sm text-dimmed">
        No supplier-owned catalogue rows are available yet.
      </p>
    </UPageCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-store"
      title="Supplier not in the ecosystem"
      description="This supplier is only a public reference right now, so there is no supplier-owned catalogue to browse."
    >
      <template #actions>
        <UButton
          :to="supplyOptionsPath"
          color="neutral"
          variant="soft"
          icon="i-lucide-list-checks"
        >
          View supply options
        </UButton>
      </template>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierCatalogueInterface } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierCatalogueInterface'
import type { SupplierCatalogueInterfaceItem } from 'fireux-suppliers/runtime/supplier/composables/firestore/utils/view/useSupplierCatalogueInterface'
import { useKitchenWorkspaceSupplierCatalogue } from '../../../../composables/workspace/operations/Suppliers/useKitchenWorkspaceSupplierCatalogue'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  catalogues,
  pending,
  title,
  description,
  supplyOptionsPath,
} = useKitchenWorkspaceSupplierCatalogue()
const { pill } = useSupplierCatalogueInterface()

const cards = computed(() =>
  catalogues.value
    .map((catalogue) => pill(catalogue as SupplierCatalogueInterfaceItem))
    .filter((card): card is NonNullable<ReturnType<typeof pill>> =>
      Boolean(card)
    )
)
</script>
