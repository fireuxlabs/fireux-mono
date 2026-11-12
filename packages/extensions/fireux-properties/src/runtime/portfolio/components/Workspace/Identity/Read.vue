<template>
  <div class="workspace-surface workspace-surface--compact">
    <FireState
      v-if="status === 'pending' || status === 'error'"
      :outcome="status"
      entity="Portfolio identity"
    />
    <UAlert
      v-else-if="status !== 'ready'"
      title="Choose a Portfolio"
      description="Select a Portfolio to view its identity."
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="card__header">
            <h2 class="fx-type-card-heading">Profile</h2>
            <slot name="actions" />
          </div>
        </template>
        <div>
          <UAvatar
            :src="imageUrl || undefined"
            :alt="name || 'Portfolio'"
            :text="initials"
            size="3xl"
          />

          <div class="fx-card-body-stack">
            <h3 class="break-words">
              {{ name || 'Untitled portfolio' }}
            </h3>
            <p v-if="tagline">
              {{ tagline }}
            </p>
          </div>
        </div>
        <p v-if="regionLabel">
          {{ regionLabel }}
        </p>
      </UCard>

      <UCard>
        <template #header>
          <div class="card__header">
            <h2 class="fx-type-card-heading">Internal context</h2>
            <slot name="context-actions" /></div
        ></template>
        <p>
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
  status,
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
