<template>
  <PlaceEditPage :locator="routeLocator" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const routeLocator = useRouteParam('id')
</script>
