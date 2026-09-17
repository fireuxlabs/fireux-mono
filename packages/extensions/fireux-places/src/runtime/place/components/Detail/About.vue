<template>
  <section v-if="place.about" class="place-about">
    <h2>About {{ place.short_name || place.name }}</h2>
    <p>{{ place.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model.ts'
defineProps<{ place: Place }>()
</script>

<style scoped>
.place-about {
  display: grid;
  gap: 1rem;
}
.place-about h2 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--ui-text-highlighted);
  margin: 0;
}
.place-about p {
  font-size: 1.075rem;
  line-height: 1.85;
  color: var(--ui-text-toned);
  max-width: 65ch;
  margin: 0;
  text-wrap: pretty;
}
</style>
