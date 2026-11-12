<template>
  <UPageSection
    id="tours"
    title="Four ways to ride."
    description="Every tour is private and led by a local guide. Pick an easy ride between the lakes or spend the day exploring the waterfalls."
  >
    <UPageGrid>
      <ToursCard
        v-for="tour in tours"
        :key="tour.slug"
        :tour-slug="tour.slug"
        :name="tour.name"
        :label="tour.label"
        :summary="tour.summary"
        :difficulty="tour.difficulty"
        :image="tour.image"
        :alt="tour.alt"
        :duration="tour.duration"
        :distance="tour.distance"
        :elevation="tour.elevation"
        :price="tour.price"
        :to="'/tours/' + tour.slug"
        action="View tour"
      />
      <ToursCard
        name="Bespoke bike tours"
        label="Your route, your pace, your day"
        summary="Tell Ben what you have in mind, from a photography ride to a longer climb or a relaxed loop."
        difficulty="Tailored"
        duration="Half or full day"
        image="/images/lake.webp"
        alt="An alpine lake and the surrounding mountains"
        :to="bespokeEnquiry"
        action="Enquire"
      />
    </UPageGrid>
  </UPageSection>
</template>
<script setup lang="ts">
import { tours } from '~/content/tours'

const bespokeEnquiry = {
  path: '/',
  query: { tour: 'Bespoke tour' },
  hash: '#enquire',
}
</script>
