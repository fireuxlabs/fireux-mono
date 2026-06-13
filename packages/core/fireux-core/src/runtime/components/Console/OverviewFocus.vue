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

    <div v-if="focus.hasSelection" class="space-y-4">
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
}

type ConsoleOverviewMultipleSummary = {
  count: number
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
const multipleCountLabel = computed(() => String(props.multiple.count))
</script>
