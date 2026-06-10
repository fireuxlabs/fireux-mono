<template>
  <section class="space-y-4">
    <ConsoleProjectTargetsSelected
      :project="selectedProject"
      :project-id="projectId"
      @clear="clearSelectedProject"
    />

    <ConsoleProjectTargetsLive
      :collection="projects.live"
      @select="actions.selectLive"
    />

    <ConsoleProjectTargetsDemo />
    <ConsoleProjectTargetsTest />

    <DevJson
      title="Project console debug"
      context="fireux-app · /console/project"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIndex } from '../../../composables/fireux/console/project/useProjectConsoleIndex'

const {
  projects,
  actions,
  selectedProject,
  projectId,
  debug,
  clearSelectedProject,
} = useProjectConsoleIndex()
</script>
