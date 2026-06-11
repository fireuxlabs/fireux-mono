<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!selectedSupplier"
      title="No supplier selected"
      description="Select a supplier to view its identity."
      variant="subtle"
    />

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
        <div class="console-summary-grid">
          <div class="console-summary-field">
            Headline:
            <span class="console-summary-value">{{ headline || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Summary:
            <span class="console-summary-value">{{ summary || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Categories:
            <span class="console-summary-value">{{ categoryLabel || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Delivery areas:
            <span class="console-summary-value">{{ deliveryAreaLabel || 'Unset' }}</span>
          </div>
        </div>
      </UCard>
    </template>

    <DevFireuxDebugPanel
      title="Supplier identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplierConsoleIdentity } from '../../../../composables/fireux/console/supplier/useSupplierConsoleIdentity'

const {
  selectedSupplier,
  name,
  tagline,
  headline,
  summary,
  imageUrl,
  categories,
  deliveryAreas,
  debug,
} = useSupplierConsoleIdentity()
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
