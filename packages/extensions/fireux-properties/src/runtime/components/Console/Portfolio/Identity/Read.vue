<template>
  <div class="space-y-6">
    <UPageCard
      v-if="!selectedPortfolio"
      title="No portfolio selected"
      description="Select a portfolio to view its identity."
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
        <div class="console-summary-grid">
          <div class="console-summary-field">
            Owner:
            <span class="console-summary-value">{{ ownerLabel || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Strategy:
            <span class="console-summary-value">{{ strategyLabel || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Region:
            <span class="console-summary-value">{{ regionLabel || 'Unset' }}</span>
          </div>
          <div class="console-summary-field">
            Notes:
            <span class="console-summary-value">{{ notes || 'Unset' }}</span>
          </div>
        </div>
      </UCard>
    </template>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Portfolio identity"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioConsoleIdentity } from '../../../../composables/fireux/console/portfolio/operations/usePortfolioConsoleIdentity'

const {
  selectedPortfolio,
  name,
  tagline,
  imageUrl,
  notes,
  ownerLabel,
  strategyLabel,
  regionLabel,
  debug,
} = usePortfolioConsoleIdentity()
const isDev = import.meta.dev
const initials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'P'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
</script>
