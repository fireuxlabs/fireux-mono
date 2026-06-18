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
        <SupplierCatalogueCardsPill
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
          :to="procurementPath"
          color="neutral"
          variant="soft"
          icon="i-lucide-list-checks"
        >
          Make procurement list
        </UButton>
      </template>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierCatalogueInterface } from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueInterface'
import { useKitchenConsoleSupplierCatalogue } from '../../../../../composables/fireux/console/kitchen/operations/Suppliers/useKitchenConsoleSupplierCatalogue'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  catalogues,
  pending,
  title,
  description,
  procurementPath,
} = useKitchenConsoleSupplierCatalogue()
const { pill } = useSupplierCatalogueInterface()

const cards = computed(() =>
  catalogues.value
    .map((catalogue) => pill(catalogue))
    .filter((card): card is NonNullable<ReturnType<typeof pill>> =>
      Boolean(card)
    )
)
</script>
