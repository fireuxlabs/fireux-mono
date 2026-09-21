<template>
  <section class="workspace-surface">
    <WorkspaceKitchenMenusWorkspaceHeader current-label="Publishing" />
    <UAlert
      v-if="menu?.schedule === 'daily'"
      color="neutral"
      title="Workspace planning"
      description="Daily-menu publication is not available yet. Your dated selections are saved in the workspace."
    />
    <WorkspaceKitchenMenusPublish v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenWorkspaceMenuRecord } from '../../../composables/workspace/menus/useKitchenWorkspaceMenuRecord'
const { menu } = useKitchenWorkspaceMenuRecord()
</script>
