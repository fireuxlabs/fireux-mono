<template>
  <div class="space-y-6">
    <FireStateCard
      v-if="readState"
      :state="readState"
      entity="Portfolio identity"
      kind="document"
      :title="readState === 'empty' ? 'Choose a Portfolio' : undefined"
      :description="
        readState === 'empty'
          ? 'Select a Portfolio to view its identity.'
          : undefined
      "
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold">Profile</h2>
            <slot name="actions" />
          </div>
        </template>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name || 'Portfolio'"
            :text="initials"
            size="3xl"
          />

          <div class="min-w-0 space-y-1">
            <h3 class="break-words text-xl font-semibold text-highlighted">
              {{ name || 'Untitled portfolio' }}
            </h3>
            <p v-if="tagline" class="text-sm text-muted">
              {{ tagline }}
            </p>
          </div>
        </div>
        <p v-if="regionLabel" class="mt-4 text-sm text-muted">
          {{ regionLabel }}
        </p>
      </UCard>

      <UCard>
        <template #header
          ><div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold">Internal context</h2>
            <slot name="context-actions" /></div
        ></template>
        <p class="mb-4 text-sm text-muted">
          Owner, strategy and notes are for your team. They are not shown in the
          public directory.
        </p>
        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Owner:
            <span class="workspace-summary-value">{{
              ownerLabel || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Strategy:
            <span class="workspace-summary-value">{{
              strategyLabel || 'Unset'
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Notes:
            <span class="workspace-summary-value">{{ notes || 'Unset' }}</span>
          </div>
        </div>
      </UCard>
    </template>

    <FireDiagnosticsDebugPanel
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
import type { PortfolioWorkspaceIdentityState } from '../../../composables/workspace/usePortfolioWorkspaceIdentity'
const props = defineProps<{ identity: PortfolioWorkspaceIdentityState }>()

const {
  selectedPortfolio,
  readState,
  name,
  tagline,
  imageUrl,
  notes,
  ownerLabel,
  strategyLabel,
  regionLabel,
  debug,
} = props.identity
const initials = computed(() => {
  const text = String(name.value || '').trim()
  if (!text) return 'P'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return (parts[0] || '').slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
})
</script>
