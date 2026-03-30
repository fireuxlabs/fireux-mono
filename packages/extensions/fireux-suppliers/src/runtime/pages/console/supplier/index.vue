<template>
  <LayoutsConsoleEntryShell>
    <SupplierCTA create-surface="console" />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">
import SupplierCTA from '../../../components/organisms/Supplier/CTA.vue'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})
</script>
