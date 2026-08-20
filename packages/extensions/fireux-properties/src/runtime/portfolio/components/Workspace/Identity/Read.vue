<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!portfolioId"
      title="No portfolio selected"
      description="Select a portfolio to view its identity."
      variant="subtle"
    />

    <UPageCard
      v-else-if="!selectedPortfolio"
      title="Loading portfolio identity"
      description="Restoring the selected portfolio."
      variant="subtle"
    />

    <template v-else>
      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name || 'Portfolio'"
            :text="initials"
            size="3xl"
          />

          <div class="min-w-0 space-y-1">
            <h2 class="truncate text-xl font-semibold text-highlighted">
              {{ name || 'Untitled portfolio' }}
            </h2>
            <p v-if="tagline" class="text-sm text-muted">
              {{ tagline }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Owner:
            <span class="workspace-summary-value">{{ ownerLabel || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Strategy:
            <span class="workspace-summary-value">{{ strategyLabel || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Region:
            <span class="workspace-summary-value">{{ regionLabel || 'Unset' }}</span>
          </div>
          <div class="workspace-summary-field">
            Notes:
            <span class="workspace-summary-value">{{ notes || 'Unset' }}</span>
          </div>
        </div>
      </UCard>
    </template>

    <DevDebugPanel
      title="Portfolio identity"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedPortfolio }"
      :derived="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioWorkspaceIdentity } from '../../../composables/workspace/identity/usePortfolioWorkspaceIdentity'

const {
  selectedPortfolio,
  portfolioId,
  name,
  tagline,
  imageUrl,
  notes,
  ownerLabel,
  strategyLabel,
  regionLabel,
  debug,
} = usePortfolioWorkspaceIdentity()
const initials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'P'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
