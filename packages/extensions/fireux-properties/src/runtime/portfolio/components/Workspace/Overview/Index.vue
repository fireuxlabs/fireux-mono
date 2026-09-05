<template>
  <section class="workspace-surface">
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
import { usePortfolioWorkspaceOverview } from '../../../composables/workspace/overview/usePortfolioWorkspaceOverview'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'

const { focus, multiple } = usePortfolioWorkspaceOverview()
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
