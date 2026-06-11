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

    <div class="console-focus">
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

    <div v-if="cards.length" class="mt-4 space-y-2">
      <ConsoleTargetCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :show-badges="showBadges"
      />
    </div>

    <p v-else class="mt-4 console-card-header__description">
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
const multipleCountLabel = computed(() => String(props.multiple.count))
const multipleDescription = computed(() =>
  `Available ${entityPluralLower.value} in your current console scope.`
)
const emptyMultipleDescription = computed(() =>
  `No ${entityPluralLower.value} are currently in scope.`
)
</script>
