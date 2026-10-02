<template>
  <section class="workspace-surface workspace-surface--compact">
    <WorkspaceProjectAppsCreate />
    <WorkspaceProjectAppsRead />
  </section>
</template>

<script setup lang="ts">
import WorkspaceProjectAppsCreate from './Create.vue'
import WorkspaceProjectAppsRead from './Read.vue'
</script>
