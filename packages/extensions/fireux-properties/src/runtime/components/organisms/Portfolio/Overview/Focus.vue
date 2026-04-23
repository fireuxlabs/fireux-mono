<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
        <p class="console-card-header__description">
          Selected portfolio in the console.
        </p>
      </div>
    </template>

    <div v-if="focus.hasSelection" class="space-y-4">
      <PortfolioCardsPill
        v-if="focusCard"
        v-bind="focusCard"
        :link="false"
        :show-badges="false"
      />

      <div class="console-summary-grid">
        <div class="console-summary-field">
          Mode:
          <span class="console-summary-value">{{ focusModeLabel }}</span>
        </div>
        <div class="console-summary-field">
          Portfolio ID:
          <span class="console-summary-value">{{ focus.id }}</span>
        </div>
        <div class="console-summary-field">
          Portfolios in Scope:
          <span class="console-summary-value">{{ groupCountLabel }}</span>
        </div>
      </div>
    </div>

    <p v-else class="console-card-header__description">
      No portfolio is currently selected.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../../models/portfolio.model'

type PortfolioPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePortfolioInterface>['pill']>
>

type PortfolioOverviewFocusState = {
  entity: Portfolio | null
  id: string
  mode: string
  hasSelection: boolean
}

type PortfolioOverviewGroupSummary = {
  count: number
}

const props = defineProps<{
  focus: PortfolioOverviewFocusState
  group: PortfolioOverviewGroupSummary
}>()

const { pill } = usePortfolioInterface()

const focusCard = computed<PortfolioPillCard | null>(() => {
  const portfolio = props.focus.entity
  if (!portfolio) return null
  return pill(portfolio) ?? null
})

const focusModeLabel = computed(() =>
  props.focus.mode === 'demo' ? 'Demo' : props.focus.mode === 'test' ? 'Test' : 'Live'
)
const groupCountLabel = computed(() => String(props.group.count))
</script>
