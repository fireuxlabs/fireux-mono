<template>
  <section class="space-y-4">
    <ConsoleProjectIndexSelected
      :project="selectedProject"
      :project-id="projectId"
      :mode="selectedMode"
      @clear="clearSelectedProject"
    />

    <ConsoleProjectIndexLive
      :collection="projects.live"
      @select="actions.selectLive"
    />

    <ConsoleProjectIndexDemo
      :collection="projects.demo"
      @select="actions.selectDemo"
    />
    <ConsoleProjectIndexTest :init="false" />

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
