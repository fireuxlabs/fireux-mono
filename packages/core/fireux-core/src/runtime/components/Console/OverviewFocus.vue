<!-- Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: distinguish overview loading, failure, and empty selection. -->
<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected {{ entityLower }} in the console.
        </p>
      </div>
    </template>

    <p v-if="focus.outcome === 'idle'" class="console-card-header__description">
      No {{ entityLower }} source is active.
    </p>

    <p v-else-if="focus.outcome === 'pending'" class="console-card-header__description">
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

    <div v-else-if="focus.hasSelection" class="space-y-4">
      <ConsoleTargetCard
        v-if="card"
        :card="card"
        :show-badges="showBadges"
      />

      <div class="console-summary-grid">
        <div class="console-summary-field">
          {{ entityLabel }} ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          {{ entityPluralLabel }} in Scope:
          <span class="console-summary-value">{{ multipleCountLabel }}</span>
        </div>
      </div>

      <slot />
    </div>

    <p v-else class="console-card-header__description">
      No {{ entityLower }} is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard as ConsoleTargetCardType } from './types'

type ConsoleOverviewFocusState = {
  id: string
  hasSelection: boolean
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
}

type ConsoleOverviewMultipleSummary = {
  count: number
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
}

const props = withDefaults(
  defineProps<{
    entityLabel: string
    entityPluralLabel: string
    focus: ConsoleOverviewFocusState
    multiple: ConsoleOverviewMultipleSummary
    card?: ConsoleTargetCardType | null
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
