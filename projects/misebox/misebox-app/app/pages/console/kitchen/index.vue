<template>
  <LayoutsConsoleEntryShell>
    <KitchenCTA create-surface="console" />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">
import KitchenCTA from 'fireux-kitchens/runtime/components/organisms/Kitchen/CTA.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  consoleEntry: true,
})
</script>
