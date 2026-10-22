<script setup lang="ts">
import { destinations } from '~/content/destinations'
</script>
<template>
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <UPageCard
      v-for="destination in destinations"
      :key="destination.slug"
      :title="destination.name"
      :description="destination.summary"
      :to="`/destinations/${destination.slug}`"
    >
      <p>
        {{
          destination.tourSlugs.length
            ? 'Explore an existing ride'
            : 'Custom trip by enquiry'
        }}
      </p>
    </UPageCard>
  </div>
</template>
