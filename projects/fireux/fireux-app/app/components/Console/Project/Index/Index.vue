<template>
  <section class="console-surface space-y-4">
    <ConsoleProjectIndexSelected
      :project="selection.project"
      :project-id="selection.projectId"
      @clear="actions.clear"
    />

    <ConsoleProjectIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Project console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleIndex } from '../../../../composables/fireux/console/project/index/useProjectConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useProjectConsoleIndex()
</script>
