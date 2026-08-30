<template>
  <section v-if="place.about" class="space-y-3">
    <h2 class="text-xl font-semibold">
      About {{ place.short_name || place.name }}
    </h2>
    <p class="text-muted">{{ place.about }}</p>
  </section>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model.ts'
defineProps<{ place: Place }>()
</script>
