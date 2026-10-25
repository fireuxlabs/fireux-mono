<!-- Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: distinguish overview loading, failure, and empty selection. -->
<template>
  <UCard>
    <template #header>
      <div class="workspace-card-header">
        <div class="workspace-card-header__title">Focus</div>
        <p class="workspace-card-header__description">
          Selected {{ entityLower }} in the workspace.
        </p>
      </div>
    </template>

    <p
      v-if="focus.outcome === 'idle'"
      class="workspace-card-header__description"
    >
      No {{ entityLower }} source is active.
    </p>

    <p
      v-else-if="focus.outcome === 'pending'"
      class="workspace-card-header__description"
    >
      Loading selected {{ entityLower }}…
    </p>

    <UAlert
      v-else-if="focus.outcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="`${entityLabel} could not be loaded`"
      description="Please try again."
    />

    <p
      v-else-if="focus.outcome === 'empty'"
      class="workspace-card-header__description"
    >
      The selected {{ entityLower }} no longer exists.
    </p>

    <div v-else-if="focus.hasSelection" class="space-y-4">
      <WorkspaceTargetCard v-if="card" :card="card" :show-badges="showBadges" />

      <div class="workspace-summary-grid">
        <div class="workspace-summary-field">
          {{ entityLabel }} ID:
          <span class="workspace-summary-value">{{ focus.id }}</span>
        </div>
        <div class="workspace-summary-field">
          {{ entityPluralLabel }} in Scope:
          <span class="workspace-summary-value">{{ multipleCountLabel }}</span>
        </div>
      </div>

      <slot />
    </div>

    <p v-else class="workspace-card-header__description">
      No {{ entityLower }} is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard as WorkspaceTargetCardType } from '../types'
import type { WorkspaceOutcome } from '../../models/outcome'

type WorkspaceOverviewFocusState = {
  id: string
  hasSelection: boolean
  outcome: WorkspaceOutcome
}

type WorkspaceOverviewMultipleSummary = {
  count: number
  outcome: WorkspaceOutcome
}

const props = withDefaults(
  defineProps<{
    entityLabel: string
    entityPluralLabel: string
    focus: WorkspaceOverviewFocusState
    multiple: WorkspaceOverviewMultipleSummary
    card?: WorkspaceTargetCardType | null
    showBadges?: boolean
  }>(),
  {
    card: null,
    showBadges: false,
  }
)

const entityLower = computed(() => props.entityLabel.toLowerCase())
const multipleCountLabel = computed(() =>
  props.multiple.outcome === 'ready' || props.multiple.outcome === 'empty'
    ? String(props.multiple.count)
    : '—'
)
</script>
