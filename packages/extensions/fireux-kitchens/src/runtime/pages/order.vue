<template><KitchenOrdering /></template>
<script setup lang="ts">
import { createError } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
if (!useFireUXConfig().isTenant)
  throw createError({
    statusCode: 404,
    statusMessage: 'Choose a Kitchen to order from.',
  })
definePageMeta({
  title: 'Order online',
  layout: false,
  middleware: 'kitchen-embedding',
})
</script>
