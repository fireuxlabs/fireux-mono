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
          :icon="
            hasIntegratedCatalogue
              ? 'i-lucide-book-open'
              : 'i-lucide-clipboard-list'
          "
          :title="
            hasIntegratedCatalogue
              ? 'Catalogue supply options'
              : 'Linked ingredients'
          "
          :description="statusDescription"
        />

        <div v-if="supplyOptionLines.length" class="grid gap-2">
          <div
            v-for="line in supplyOptionLines"
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

        <div
          v-else-if="linkedIngredientIds.length"
          class="flex flex-wrap gap-2"
        >
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
import { useKitchenWorkspaceSupplierSupplyOptions } from '../../../composables/workspace/suppliers/useKitchenWorkspaceSupplierSupplyOptions'

const {
  supplierBasePath,
  hasIntegratedCatalogue,
  linkedIngredientIds,
  supplyOptionLines,
  cataloguePath,
  title,
  description,
} = useKitchenWorkspaceSupplierSupplyOptions()

const statusDescription = computed(() =>
  hasIntegratedCatalogue.value
    ? 'These supplier-owned catalogue options can inform a future Kitchen purchase.'
    : 'This supplier has no integrated catalogue options.'
)
</script>
