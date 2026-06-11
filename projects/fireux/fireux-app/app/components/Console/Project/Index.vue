<template>
  <section class="space-y-4">
    <ConsoleProjectTargetsSelected
      :project="selectedProject"
      :project-id="projectId"
      :mode="selectedMode"
      @clear="clearSelectedProject"
    />

    <ConsoleProjectTargetsLive
      :collection="projects.live"
      @select="actions.selectLive"
    />

    <ConsoleProjectTargetsDemo
      :collection="projects.demo"
      @select="actions.selectDemo"
    />
    <ConsoleProjectTargetsTest :init="false" />

    <DevFireuxDebugPanel
      title="Project console debug"
      scope="console"
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
  selectedMode,
  projectId,
  debug,
  clearSelectedProject,
} = useProjectConsoleIndex()
</script>
