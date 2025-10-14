<template>
  <section class="space-y-2">
    <div>placeId: {{ placeId }}</div>
    <pre>{{ place }}</pre>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePlaces } from '../../composables/usePlaces'

const route = useRoute()
const { place: getPlace } = usePlaces()

const placeId = route.params.id as string
const place = getPlace(placeId)
</script>
