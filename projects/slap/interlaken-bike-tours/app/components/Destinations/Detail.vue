<template>
  <UPage>
    <UPageHeader
      :title="destination.name"
      :description="destination.summary"
      :headline="
        relatedTours.length
          ? 'Private guided cycling'
          : 'Custom trip by enquiry'
      "
    />
    <UPageBody>
      <p>{{ destination.description }}</p>
      <UPageSection v-if="relatedTours.length" title="Rides to explore">
        <UPageGrid
          ><UPageCard
            v-for="tour in relatedTours"
            :key="tour.slug"
            :title="tour.name"
            :description="tour.summary"
            :to="`/tours/${tour.slug}`"
        /></UPageGrid>
      </UPageSection>
      <UPageSection
        title="Plan your day"
        description="Share your dates, group size, cycling experience and preferred pace. Your guide confirms availability and the details before you book."
        :links="[
          {
            label: `Enquire about ${destination.name}`,
            to: enquiryUrl(
              `Hello Ben, I would like to enquire about a cycling trip in ${destination.name}.`
            ),
          },
        ]"
      />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import type { Destination } from '~/content/destinations'
import { tours, enquiryUrl } from '~/content/tours'
const props = defineProps<{ destination: Destination }>()
const relatedTours = computed(() =>
  tours.filter((tour) => props.destination.tourSlugs.includes(tour.slug))
)
</script>
