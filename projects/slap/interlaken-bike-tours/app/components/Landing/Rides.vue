<script setup lang="ts">
import { tours } from '~/content/tours'
</script>
<template>
  <section id="tours" class="section wrap">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Choose your adventure</p>
        <h2>Three rides.<br />Endless good moments.</h2>
      </div>
      <p>
        Lakeside cruising or a whole day in the valley. Every ride is private,
        with space to make it yours.
      </p>
    </div>
    <div class="tour-grid">
      <ToursCard
        v-for="(tour, index) in tours"
        :key="tour.slug"
        :tour="tour"
        :index="index"
      />
    </div>
    <div class="bespoke">
      <div>
        <h3>Have something else in mind?</h3>
        <p>Bespoke routes, bike rental, or a day built around your group.</p>
      </div>
      <UButton
        to="#enquire"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
        size="lg"
        >Let's plan it</UButton
      >
    </div>
  </section>
</template>
