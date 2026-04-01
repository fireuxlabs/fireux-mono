<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useRuntimeKitchenSelection } from '../../../../composables/fireux/app/kitchen-runtime/state'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeKitchen } = useRuntimeKitchenSelection()
setRuntimeKitchen({
  mode: 'read-only',
  kitchenId: '',
})
await navigateTo('/console/kitchen', { replace: true })
</script>
