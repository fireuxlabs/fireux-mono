<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!supplierId"
      title="No supplier selected"
      description="Select a supplier to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="status === 'pending' || placeOutcome === 'pending'"
      title="Loading supplier identity"
      description="Restoring the selected supplier."
      variant="subtle"
    />

    <UAlert v-else-if="status === 'error' || placeOutcome === 'error'" title="Supplier identity could not be loaded" color="error" />
    <UAlert v-else-if="!selectedSupplier" title="Supplier was not found" color="neutral" />
    <UAlert v-else-if="!companyId || placeOutcome === 'missing'" title="Linked Company / Place identity is unavailable" color="neutral" />
    <template v-else>
      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UAvatar
            :src="imageUrl"
            :alt="name || 'Supplier'"
            :text="imageInitials"
            size="3xl"
            class="shrink-0"
          />

          <div class="min-w-0 space-y-2">
            <h2 class="text-xl font-semibold text-highlighted">
              {{ name || 'Untitled supplier' }}
            </h2>
            <p v-if="tagline" class="text-sm text-dimmed">
              {{ tagline }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Headline:
            <span class="workspace-summary-value">{{
              headline || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Summary:
            <span class="workspace-summary-value">{{
              summary || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Categories:
            <span class="workspace-summary-value">{{
              categoryLabel || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Delivery areas:
            <span class="workspace-summary-value">{{
              deliveryAreaLabel || 'Unset'
            }}</span>
          </div>
        </div>
      </UCard>
    </template>

    <DevDebugPanel
      title="Supplier identity"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedSupplier }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierIdentity } from '../../../composables/useSupplierIdentity'

const {
  selectedSupplier,
  status,
  companyId,
  placeOutcome,
  supplierId,
  name,
  tagline,
  headline,
  summary,
  imageUrl,
  categories,
  deliveryAreas,
  debug,
} = useSupplierIdentity()
const categoryLabel = computed(() => categories.value.join(', '))
const deliveryAreaLabel = computed(() => deliveryAreas.value.join(', '))
const imageInitials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'S'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
