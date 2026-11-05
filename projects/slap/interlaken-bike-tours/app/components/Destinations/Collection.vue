<script setup lang="ts">
import { destinations } from '~/content/destinations'
</script>
<template>
  <div class="destination-grid">
    <NuxtLink
      v-for="destination in destinations"
      :key="destination.slug"
      class="destination-card"
      :to="`/destinations/${destination.slug}`"
    >
      <span class="eyebrow">
        {{ destination.tourSlugs.length ? 'Guided ride' : 'Custom by enquiry' }}
      </span>
      <h3>{{ destination.name }}</h3>
      <p>{{ destination.summary }}</p>
      <span class="destination-arrow" aria-hidden="true">↗</span>
    </NuxtLink>
  </div>
</template>
