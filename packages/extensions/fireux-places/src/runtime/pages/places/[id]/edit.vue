<template>
  <PlacePublicEdit :locator="placeLocator" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const route = useRoute()
const raw = route.params.id
const placeLocator = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
</script>
