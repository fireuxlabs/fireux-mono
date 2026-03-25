<template>
  <LayoutsConsoleEntryShell>
    <ProjectCTA />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  consoleEntry: true,
})
</script>
