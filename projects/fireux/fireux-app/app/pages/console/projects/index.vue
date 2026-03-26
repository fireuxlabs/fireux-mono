<template>
  <LayoutsConsoleEntryShell>
    <ProjectCTA create-surface="console" />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  consoleEntry: true,
})
</script>
