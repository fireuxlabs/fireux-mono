<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeSupplierSelection } from '../../../../composables/fireux/app/supplier-console/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeSupplier } = useRuntimeSupplierSelection()
setRuntimeSupplier({
  mode: 'read-only',
  supplierId: '',
})
await navigateTo('/console/supplier', { replace: true })
</script>
