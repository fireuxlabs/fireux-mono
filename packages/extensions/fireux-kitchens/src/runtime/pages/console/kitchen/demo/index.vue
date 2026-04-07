<template>
  <div />
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useKitchenSelection } from '../../../../composables/fireux/app/kitchen-console/useKitchenSelection'

definePageMeta({
  layout: 'console',
  consoleEntry: true,
})

const { setRuntimeKitchen } = useKitchenSelection()
setRuntimeKitchen({
  mode: 'demo',
  kitchenId: '',
})
await navigateTo('/console/kitchen', { replace: true })
</script>
