<!-- Concurrent edit — 2026-07-19 16:49 CEST — Repo Efficiency Pass 5 of 6: Project target outcome contract. -->
<template>
  <section class="grid gap-4">
    <WorkspaceProjectActiveCard
      :project="project"
      :project-id="projectId"
      :outcome="outcome"
      @clear="clearProject"
    />

    <WorkspaceProjectCreate v-if="outcome === 'empty'" />

    <WorkspaceProjectTargets
      :collection="projects"
      :outcome="outcome"
      @select="selectProject"
    />

    <DevDebugPanel
      title="Project workspace debug"
      scope="workspace"
      object-origin="fetched"
      :objects="{
        selectedProject: project,
        projects,
      }"
      :derived="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectWorkspaceIndex } from '../../composables/workspace/index/useProjectWorkspaceIndex'

const {
  project,
  projectId,
  projects,
  outcome,
  selectProject,
  clearProject,
  debug,
} = useProjectWorkspaceIndex()
</script>
