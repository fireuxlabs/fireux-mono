<template>
  <LayoutsWorkspaceNavbar title="Project Workspace">
    <template v-if="workspace.id.value" #title>
      <WorkspaceProjectActive :project="project" />
    </template>
    <template #right>
      <WorkspaceProjectInfo />
    </template>
  </LayoutsWorkspaceNavbar>
</template>

<script setup lang="ts">
import { useProjectWorkspaceNavigation } from 'fireux-core/runtime/project/composables/workspace/navigation/useProjectWorkspaceNavigation'

const { project, workspace } = useProjectWorkspaceNavigation()
</script>
