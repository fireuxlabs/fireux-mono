<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Project target outcome contract. -->
<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceProjectIndexSelected
      :project="selection.project"
      :project-id="selection.projectId"
      @clear="actions.clear"
    />

    <WorkspaceProjectIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :outcome="sections.targets.outcome"
      @select="actions.selectTarget"
    />

    <DevDebugPanel
      title="Project workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{ selectedProject: selection.project, projects: sections.targets.collection }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useProjectWorkspaceIndex()
</script>
