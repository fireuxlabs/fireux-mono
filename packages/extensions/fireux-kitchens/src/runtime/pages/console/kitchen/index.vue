<template>
  <LayoutsConsoleEntryShell>
    <KitchenCTA create-surface="console" />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">
import KitchenCTA from '../../../components/organisms/Kitchen/CTA.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  consoleEntry: true,
})
</script>
