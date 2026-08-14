<template>
  <PlaceDetail :locator="routeLocator" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: false,
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const routeLocator = useRouteParam('id')
</script>
