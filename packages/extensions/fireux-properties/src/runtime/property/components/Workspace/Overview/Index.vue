<template>
  <section class="workspace-surface">
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Property"
        entity-plural-label="Properties"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <WorkspaceManagement :entity="focus.entity" />
      </WorkspaceOverviewFocus>
      <WorkspaceOverviewMultiple
        entity-label="Property"
        entity-plural-label="Properties"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevDebugPanel
        title="Property overview"
        scope="workspace"
      object-origin="fetched"
      :objects="{ selectedProperty: focus.entity, properties: multiple.items }"
      :derived="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard } from 'fireux-core/runtime/components/Workspace/types'
import { usePropertyWorkspaceOverview } from '../../../composables/workspace/overview/usePropertyWorkspaceOverview'
import { usePropertyInterface } from '../../../composables/firestore/utils/view/usePropertyInterface'

const { focus, multiple, debug } = usePropertyWorkspaceOverview()
const { pill } = usePropertyInterface()
const focusCard = computed(() => pill(focus.value.entity) as WorkspaceTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((property) => pill(property) as WorkspaceTargetCard | null)
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
