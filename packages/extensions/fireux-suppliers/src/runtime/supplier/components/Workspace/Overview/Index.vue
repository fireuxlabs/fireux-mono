<template>
  <section class="workspace-surface">
    <WorkspaceSupplierOverviewCapabilities />
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceManagement :entity="focus.entity" />
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
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import { useSupplierOverview } from '../../../composables/useSupplierOverview'
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'

const { focus, multiple } = useSupplierOverview()
const { pill } = useSupplierInterface()
const focusCard = computed(
  () => pill(focus.value.entity) as WorkspaceTargetCard | null
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((supplier) => pill(supplier) as WorkspaceTargetCard | null)
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
