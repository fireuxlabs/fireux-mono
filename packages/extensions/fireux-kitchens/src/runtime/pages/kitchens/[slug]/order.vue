<template><KitchenOrdering :kitchen-slug="slug" /></template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const slug = useRouteParam('slug')
definePageMeta({
  title: 'Order online',
  layout: false,
  middleware: 'kitchen-embedding',
})
</script>
