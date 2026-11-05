<script setup lang="ts">
import type { Destination } from '~/content/destinations'
import { tours, enquiryUrl } from '~/content/tours'
const props = defineProps<{ destination: Destination }>()
const relatedTours = computed(() =>
  tours.filter((tour) => props.destination.tourSlugs.includes(tour.slug))
)
</script>
<template>
  <div>
    <p class="eyebrow">
      {{
        relatedTours.length
          ? 'Private guided cycling'
          : 'Custom trip by enquiry'
      }}
    </p>
    <h1>{{ destination.name }}</h1>
    <p class="destination-summary">{{ destination.summary }}</p>
    <p class="destination-description">{{ destination.description }}</p>
    <section
      v-if="relatedTours.length"
      class="destination-detail-section"
      aria-labelledby="destination-rides"
    >
      <h2 id="destination-rides">Rides to explore</h2>
      <div class="destination-rides-grid">
        <UPageCard
          v-for="tour in relatedTours"
          :key="tour.slug"
          :title="tour.name"
          :description="tour.summary"
          :to="`/tours/${tour.slug}`"
        />
      </div>
    </section>
    <section class="destination-detail-section" aria-labelledby="destination-enquiry">
      <h2 id="destination-enquiry">Plan your day</h2>
      <p>
        Share your dates, group size, cycling experience and preferred pace.
        Your guide confirms availability and the details before you book.
      </p>
      <UButton
        :to="
          enquiryUrl(
            `Hello Ben, I would like to enquire about a cycling trip in ${destination.name}.`
          )
        "
        size="xl"
        trailing-icon="i-lucide-arrow-up-right"
        >Enquire about {{ destination.name }}</UButton
      >
    </section>
  </div>
</template>
