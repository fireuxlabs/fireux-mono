<template>
  <WorkspaceCapability collection-label="Tests">
    <template #collection
      ><UAlert
        title="Test storage is not connected"
        description="This workspace has not connected its string pipeline yet."
        color="neutral"
    /></template>
    <template #single
      ><p class="text-sm text-muted">
        Connect Test storage before selecting or editing a string.
      </p></template
    >
  </WorkspaceCapability>
</template>
<script setup lang="ts">
import WorkspaceCapability from 'fireux-core/runtime/components/Workspace/Capability.vue'
</script>
