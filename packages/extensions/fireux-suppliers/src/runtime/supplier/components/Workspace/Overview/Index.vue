<template>
  <section class="workspace-surface">
    <WorkspaceSupplierOverviewCapabilities />
    <CatalogueSummary />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceDedicatedApp :entity="focus.entity" />
      </WorkspaceOverviewFocus>
      <WorkspaceOverviewMultiple
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import CatalogueSummary from './Catalogue.vue'
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import { useSupplierOverview } from '../../../composables/useSupplierOverview'
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'

const { focus, multiple } = useSupplierOverview()
const { pill } = useSupplierInterface()
function workspaceCard(
  entity: Parameters<typeof pill>[0],
  to = ''
): WorkspaceTargetCard | null {
  const card = pill(entity)
  return card ? { ...card, to } : null
}
const focusCard = computed(() =>
  workspaceCard(focus.value.entity, '/workspace/supplier/identity')
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((supplier) => workspaceCard(supplier))
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
