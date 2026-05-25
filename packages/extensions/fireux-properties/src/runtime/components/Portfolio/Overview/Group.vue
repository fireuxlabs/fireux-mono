<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">All</div>
        <p class="console-card-header__description">
          Portfolios available in the selected console source.
        </p>
      </div>
    </template>

    <div class="console-focus">
      <div class="console-focus__title">
        All Portfolios
      </div>

      <div class="console-metric">
        <div class="console-metric__value">
          {{ groupCountLabel }}
        </div>
        <div class="console-metric__label">Portfolios</div>
      </div>

      <p class="console-card-header__description">
        {{ groupDescription }}
      </p>
    </div>

    <div v-if="groupCards.length" class="mt-4 space-y-2">
      <PortfolioCardsPill
        v-for="card in groupCards"
        :key="card.id"
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </div>

    <p v-else class="mt-4 console-card-header__description">
      {{ emptyGroupDescription }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioInterface } from '../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../models/portfolio.model'

type PortfolioPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePortfolioInterface>['pill']>
>

type PortfolioOverviewGroupState = {
  items: Portfolio[]
  count: number
  hasItems: boolean
}

const props = defineProps<{
  group: PortfolioOverviewGroupState
  mode: string
}>()

const { pill } = usePortfolioInterface()

const groupCards = computed<PortfolioPillCard[]>(() =>
  props.group.items
    .map((portfolio) => pill(portfolio))
    .filter((card): card is PortfolioPillCard => Boolean(card))
)

const groupCountLabel = computed(() => String(props.group.count))
const groupDescription = computed(() =>
  props.mode === 'demo'
    ? 'Demo portfolios available in the current console scope.'
    : props.mode === 'test'
      ? 'Your personal test portfolio available in this console.'
      : 'Live portfolios available in your current workspace scope.'
)
const emptyGroupDescription = computed(() =>
  props.mode === 'demo'
    ? 'No demo portfolios are currently in scope.'
    : props.mode === 'test'
      ? 'No test portfolio is currently in scope.'
      : 'No live portfolios are currently in scope.'
)
</script>
