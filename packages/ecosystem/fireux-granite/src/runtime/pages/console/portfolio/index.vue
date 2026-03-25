<template>
  <LayoutsConsoleEntryShell>
    <PortfolioCTA />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">
import PortfolioCTA from 'fireux-properties/runtime/components/organisms/Portfolio/CTA.vue'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  consoleEntry: true,
})
</script>
