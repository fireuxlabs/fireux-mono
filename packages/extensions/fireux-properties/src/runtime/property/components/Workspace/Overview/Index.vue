<template>
  <section class="workspace-surface">
    <WorkspacePropertyOverviewCapabilities />
    <slot name="capabilities" />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Property"
        entity-plural-label="Properties"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceDedicatedApp :entity="focus.entity" />
      </WorkspaceOverviewFocus>
      <WorkspaceOverviewMultiple
        entity-label="Property"
        entity-plural-label="Properties"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/workspace/components/types'
import { usePropertyOverview } from '../../../composables/usePropertyOverview'
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'

const { focus, multiple } = usePropertyOverview()
const { pill } = usePropertyInterface()
function workspaceCard(
  entity: Parameters<typeof pill>[0],
  to = ''
): WorkspaceTargetCard | null {
  const card = pill(entity)
  return card ? { ...card, to } : null
}
const focusCard = computed(() =>
  workspaceCard(focus.value.entity, '/workspace/property/identity')
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((property) => workspaceCard(property))
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
