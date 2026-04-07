<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useSupplierSelection } from '../../../../composables/fireux/app/supplier-console/useSupplierSelection'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeSupplier } = useSupplierSelection()
setRuntimeSupplier({
  mode: 'demo',
  supplierId: '',
})
await navigateTo('/console/supplier', { replace: true })
</script>
