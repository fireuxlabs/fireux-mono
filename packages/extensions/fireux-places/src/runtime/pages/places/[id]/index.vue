<template>
  <PlacePublicDetail :locator="routeLocator" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const route = useRoute()
const routeLocator = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
</script>
