<template>
  <KitchenPublicEdit :id="routeSlug" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Edit Kitchen',
  description: 'Edit a saved kitchen.',
  head: { title: 'Edit Kitchen' },
  name: 'KitchensEditPage',
})

const route = useRoute()
const routeSlug = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})
</script>
