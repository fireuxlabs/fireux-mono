<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Portfolio"
        entity-plural-label="Portfolios"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <ConsoleManagement :entity="focus.entity" />
      </ConsoleOverviewFocus>
      <ConsoleOverviewMultiple
        entity-label="Portfolio"
        entity-plural-label="Portfolios"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Portfolio overview"
        scope="console"
        :data="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import { usePortfolioConsoleOverview } from '../../../../composables/fireux/console/portfolio/overview/usePortfolioConsoleOverview'
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

const { focus, multiple, debug } = usePortfolioConsoleOverview()
const { pill } = usePortfolioInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((portfolio) => pill(portfolio) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
