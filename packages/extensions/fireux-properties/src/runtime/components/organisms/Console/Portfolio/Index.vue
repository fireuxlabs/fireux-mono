<template>
  <ConsoleEntityIndex
    entity-label="Portfolio"
    entity-lower-label="portfolio"
    entity-plural-lower-label="portfolios"
    :live-count="portfolios.live.length"
    :has-selected="Boolean(selectedPortfolio)"
    :selected-card="selectedPortfolioCard"
    :demo-cards="demoPortfolioCards"
    :test-card="testPortfolioCard"
    v-model:show-simulations="state.showSimulations"
    :creating-test="state.creatingTest"
    :can-create-test="Boolean(actions.createTest)"
    :debug="debug"
    @clear="clearSelectedPortfolio"
    @select-demo="actions.selectDemo"
    @select-test="actions.selectTest"
    @create-test="actions.createTest?.()"
  >
    <template #live-collection>
      <PortfolioCollectionManager
        :collection="portfolios.live"
        title="Choose Live Portfolio"
        description="Select the live portfolio you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>
  </ConsoleEntityIndex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConsoleEntityIndex from 'fireux-core/runtime/components/organisms/Console/EntityIndex.vue'
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import { usePortfolioConsoleIndex } from '../../../../composables/fireux/console/portfolio/usePortfolioConsoleIndex'

const {
  state,
  portfolios,
  actions,
  selectedPortfolio,
  debug,
  clearSelectedPortfolio,
} = usePortfolioConsoleIndex()
const { pill } = usePortfolioInterface()

type PortfolioPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePortfolioInterface>['pill']>
>

const demoPortfolioCards = computed<PortfolioPillCard[]>(() =>
  portfolios.value.demo
    .map((portfolio) => pill(portfolio))
    .filter((card): card is PortfolioPillCard => Boolean(card))
)

const selectedPortfolioCard = computed<PortfolioPillCard | null>(() => {
  const portfolio = selectedPortfolio.value
  if (!portfolio) return null

  return pill(portfolio) ?? null
})

const testPortfolioCard = computed<PortfolioPillCard | null>(() => {
  const portfolio = portfolios.value.test
  if (!portfolio) return null

  return pill(portfolio) ?? null
})
</script>
