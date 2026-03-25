<template>
  <LayoutsConsoleEntryShell>
    <KitchenCTA />
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
