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
          :color="hasIntegratedCatalogue ? 'primary' : 'neutral'"
          variant="soft"
          :icon="hasIntegratedCatalogue ? 'i-lucide-book-open' : 'i-lucide-clipboard-list'"
          :title="hasIntegratedCatalogue ? 'Catalogue-backed procurement' : 'Temporary procurement list'"
          :description="statusDescription"
        />

        <div v-if="procurementLines.length" class="grid gap-2">
          <div
            v-for="line in procurementLines"
            :key="line.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-elevated/30 p-3"
          >
            <div>
              <p class="text-sm font-semibold text-highlighted">
                {{ line.ingredientName }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ line.packLabel }}
              </p>
            </div>
            <UBadge color="neutral" variant="soft">
              {{ line.packPrice }}
            </UBadge>
          </div>
        </div>

        <div v-else-if="linkedIngredientIds.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="ingredientId in linkedIngredientIds"
            :key="ingredientId"
            :label="ingredientId"
            color="neutral"
            variant="soft"
          />
        </div>

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
import { useKitchenConsoleSupplierProcurement } from '../../../../../composables/fireux/console/kitchen/operations/Suppliers/useKitchenConsoleSupplierProcurement'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  linkedIngredientIds,
  procurementLines,
  cataloguePath,
  title,
  description,
} = useKitchenConsoleSupplierProcurement()

const statusDescription = computed(() =>
  hasIntegratedCatalogue.value
    ? 'Use supplier-owned product options as the starting point for what this kitchen buys.'
    : 'This can hold kitchen-local buying notes until the supplier owns a real catalogue in the ecosystem.'
)
</script>
