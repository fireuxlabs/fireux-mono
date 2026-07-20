<!-- Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: render overview collection state from outcome. -->
<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Multiple</div>
        <p class="console-card-header__description">
          {{ entityPluralLabel }} available in the selected console source.
        </p>
      </div>
    </template>

    <p v-if="multiple.outcome === 'idle'" class="console-card-header__description">
      No {{ entityPluralLower }} source is active.
    </p>

    <p v-else-if="multiple.outcome === 'pending'" class="console-card-header__description">
      Loading {{ entityPluralLower }}…
    </p>

    <UAlert
      v-else-if="multiple.outcome === 'error'"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="`${entityPluralLabel} could not be loaded`"
      description="Please try again."
    />

    <div v-else class="console-focus">
      <div class="console-focus__title">
        Available {{ entityPluralLabel }}
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ multipleCountLabel }}
        </div>
        <div class="console-metric__label">{{ entityPluralLabel }}</div>
      </div>

      <p class="console-card-header__description">
        {{ multipleDescription }}
      </p>
    </div>

    <div
      v-if="multiple.outcome === 'ready' && cards.length"
      class="mt-4 space-y-2"
    >
      <ConsoleTargetCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :show-badges="showBadges"
      />
    </div>

    <p
      v-else-if="multiple.outcome === 'empty'"
      class="mt-4 console-card-header__description"
    >
      {{ emptyMultipleDescription }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard as ConsoleTargetCardType } from './types'

type ConsoleOverviewMultipleState = {
  count: number
  hasItems: boolean
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
}

const props = withDefaults(
  defineProps<{
    entityLabel: string
    entityPluralLabel: string
    multiple: ConsoleOverviewMultipleState
    cards?: ConsoleTargetCardType[]
    showBadges?: boolean
  }>(),
  {
    cards: () => [],
    showBadges: false,
  }
)

const entityPluralLower = computed(() => props.entityPluralLabel.toLowerCase())
const multipleCountLabel = computed(() =>
  props.multiple.outcome === 'ready' || props.multiple.outcome === 'empty'
    ? String(props.multiple.count)
    : '—'
)
const multipleDescription = computed(() =>
  `Available ${entityPluralLower.value} in your current console scope.`
)
const emptyMultipleDescription = computed(() =>
  `No ${entityPluralLower.value} are currently in scope.`
)
</script>
