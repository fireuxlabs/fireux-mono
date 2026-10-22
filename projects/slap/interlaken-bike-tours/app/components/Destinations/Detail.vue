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
    <p class="mt-6 max-w-3xl text-xl">{{ destination.summary }}</p>
    <p class="max-w-3xl">{{ destination.description }}</p>
    <section
      v-if="relatedTours.length"
      class="mt-12"
      aria-labelledby="destination-rides"
    >
      <h2 id="destination-rides">Rides to explore</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <UPageCard
          v-for="tour in relatedTours"
          :key="tour.slug"
          :title="tour.name"
          :description="tour.summary"
          :to="`/tours/${tour.slug}`"
        />
      </div>
    </section>
    <section class="mt-12" aria-labelledby="destination-enquiry">
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
