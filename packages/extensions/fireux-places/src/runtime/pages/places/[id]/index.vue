<template>
  <PlacePublicDetail :locator="placeLocator" />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const route = useRoute()
const raw = route.params.id
const placeLocator = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
</script>
