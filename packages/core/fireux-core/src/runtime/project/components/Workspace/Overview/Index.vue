<template>
  <section class="workspace-surface">
    <div class="workspace-surface__grid workspace-surface__grid--2">
      <WorkspaceOverviewFocus
        entity-label="Project"
        entity-plural-label="Projects"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      />
      <WorkspaceOverviewMultiple
        entity-label="Project"
        entity-plural-label="Projects"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevDebugPanel
        title="Project overview"
        scope="workspace"
      object-origin="fetched"
      :objects="{ selectedProject: focus.entity, projects: multiple.items }"
      :derived="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WorkspaceTargetCard } from '../../../../components/Workspace/types'
import { useProjectInterface } from '../../../composables/useProjectInterface'
import { useProjectWorkspaceOverview } from '../../../composables/workspace/overview/useProjectWorkspaceOverview'

const { focus, multiple, debug } = useProjectWorkspaceOverview()
const { pill } = useProjectInterface()
const focusCard = computed(() => pill(focus.value.entity) as WorkspaceTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((project) => pill(project) as WorkspaceTargetCard | null)
    .filter((card): card is WorkspaceTargetCard => Boolean(card))
)
</script>
