<template>
  <PlacePublicEdit :locator="routeLocator" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const route = useRoute()
const routeLocator = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
</script>
