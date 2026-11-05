<script setup lang="ts">
import { tours } from '~/content/tours'

const bespokeEnquiry = {
  path: '/',
  query: { tour: 'Bespoke tour' },
  hash: '#enquire',
}
</script>

<template>
  <section
    id="tours"
    class="rides-section section"
    aria-labelledby="rides-title"
  >
    <div class="section-heading wrap">
      <p class="eyebrow">01 / The tours</p>
      <div class="section-heading-row">
        <h2 id="rides-title">Four ways to ride.</h2>
        <p>
          Every tour is private and led by a local guide. Pick an easy ride
          between the lakes or spend the day exploring the waterfalls.
        </p>
      </div>
    </div>
    <div class="tour-grid wrap">
      <ToursCard
        v-for="tour in tours"
        :key="tour.slug"
        :class="{ 'giessbach-card': tour.slug === 'giessbach-waterfalls' }"
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
        class="bespoke-card"
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
    </div>
  </section>
</template>
