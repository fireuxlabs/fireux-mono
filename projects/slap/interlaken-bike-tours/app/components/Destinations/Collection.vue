<template>
  <UPageGrid>
    <UPageCard
      v-for="destination in destinations"
      :key="destination.slug"
      :title="destination.name"
      :description="destination.summary"
      :to="`/destinations/${destination.slug}`"
    >
      <UBadge
        :label="
          destination.tourSlugs.length ? 'Guided ride' : 'Custom by enquiry'
        "
        variant="subtle"
      />
    </UPageCard>
  </UPageGrid>
</template>
<script setup lang="ts">
import { destinations } from '~/content/destinations'
</script>
