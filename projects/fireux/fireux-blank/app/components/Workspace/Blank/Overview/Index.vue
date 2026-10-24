<template>
  <section class="workspace-surface">
    <WorkspaceBlankOverviewCapabilities />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Blank"
        entity-plural-label="Blanks"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceDedicatedApp :entity="focus.entity" />
      </WorkspaceOverviewFocus>
      <WorkspaceOverviewMultiple
        entity-label="Blank"
        entity-plural-label="Blanks"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>


  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/workspace/components/types'
import type { Blank } from '../../../../models/blank.model'
import { useBlankOverview } from '../../../../composables/useBlankOverview'

const { focus, multiple } = useBlankOverview()

const toCard = (blank: Blank | null | undefined): WorkspaceTargetCard | null => {
  if (!blank?.id) return null

  return {
    id: String(blank.id),
    title: String(blank.name || blank.slug || blank.id),
    subtitle: blank.status,
    badges: blank.status ? [blank.status] : [],
  }
}
const focusCard = computed(() => toCard(focus.value.entity))
const multipleCards = computed(() =>
  multiple.value.items
    .map((blank) => toCard(blank))
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
