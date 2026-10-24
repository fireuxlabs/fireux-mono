<template>
  <section class="workspace-surface">
    <WorkspacePortfolioOverviewCapabilities />
    <slot name="capabilities" />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Portfolio"
        entity-plural-label="Portfolios"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceDedicatedApp :entity="focus.entity" />
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
import type { WorkspaceTargetCard } from 'fireux-core/runtime/workspace/components/types'
import { usePortfolioWorkspaceHome } from '../../../composables/workspace/usePortfolioWorkspaceHome'
import { usePortfolioInterface } from '../../../composables/firestore/utils/view/usePortfolioInterface'

const { focus, multiple } = usePortfolioWorkspaceHome()
const { pill } = usePortfolioInterface()
function workspaceCard(
  entity: Parameters<typeof pill>[0],
  to = ''
): WorkspaceTargetCard | null {
  const card = pill(entity)
  return card ? { ...card, to } : null
}
const focusCard = computed(() =>
  workspaceCard(focus.value.entity, '/workspace/portfolio/identity')
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((portfolio) => workspaceCard(portfolio))
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
