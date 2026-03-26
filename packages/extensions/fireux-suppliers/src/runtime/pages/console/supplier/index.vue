<template>
  <LayoutsConsoleEntryShell>
    <SupplierEntry />
  </LayoutsConsoleEntryShell>
</template>

<script setup lang="ts">
import SupplierEntry from '../../../components/console/supplier/Entry.vue'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})
</script>
