<template>
  <section class="workspace-surface">
    <WorkspacePortfolioOverviewCapabilities />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Portfolio"
        entity-plural-label="Portfolios"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceManagement :entity="focus.entity" />
      </WorkspaceOverviewFocus>
      <WorkspaceOverviewMultiple
        entity-label="Portfolio"
        entity-plural-label="Portfolios"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>


  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import { usePortfolioOverview } from '../../../composables/usePortfolioOverview'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'

const { focus, multiple } = usePortfolioOverview()
const { pill } = usePortfolioInterface()
const focusCard = computed(
  () => pill(focus.value.entity) as WorkspaceTargetCard | null
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((portfolio) => pill(portfolio) as WorkspaceTargetCard | null)
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
