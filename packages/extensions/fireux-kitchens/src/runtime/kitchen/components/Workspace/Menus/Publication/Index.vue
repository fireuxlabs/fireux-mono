<template>
  <section class="workspace-surface">
    <UAlert
      v-if="menu?.schedule === 'daily'"
      color="neutral"
      title="Workspace planning"
      description="Daily-menu publication is not available yet. Your dated selections are saved in the workspace."
    />
    <WorkspaceKitchenMenusPublicationActions v-else />
  </section>
</template>
<script setup lang="ts">
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
const { menu } = useKitchenMenuRecordContext()
</script>
