<template>
  <KitchenDetail :locator="routeLocator" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  name: 'KitchensDetailPage',
})

const route = useRoute()
const routeLocator = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
</script>
