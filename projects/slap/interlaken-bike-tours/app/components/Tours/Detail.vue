<template>
  <UPage>
    <UPageHeader
      :title="tour.name"
      :description="tour.summary"
      headline="Private guided ride"
      :links="links"
    />
    <UPageBody>
      <UPageSection
        title="Your ride"
        :description="tour.description"
        orientation="horizontal"
      >
        <img :src="tour.image" :alt="tour.alt" width="1600" height="900" />
      </UPageSection>
      <UPageSection title="At a glance">
        <UPageGrid
          ><UPageCard
            v-for="fact in facts"
            :key="fact.title"
            :title="fact.title"
            :description="fact.description"
        /></UPageGrid>
      </UPageSection>
      <UPageSection title="Included"
        ><UPageList
          ><UPageFeature
            v-for="item in tour.included"
            :key="item"
            :title="item"
            icon="i-lucide-check" /></UPageList
      ></UPageSection>
      <UPageSection
        title="Before you ride"
        description="E-bike riders must be 16 or older. Confident cycling ability and reasonable fitness are required. Bring water, weather-appropriate clothing, sun protection and a backpack. Meeting points are arranged directly with your guide. Ask Ben about weather, cancellation arrangements and any special requirements before booking."
      />
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import type { Tour } from '~/content/tours'
const props = defineProps<{ tour: Tour }>()
const links = computed(() => [
  {
    label: 'Check availability',
    to: { path: '/book', query: { tour: props.tour.slug } },
  },
  {
    label: 'Ask Ben',
    to: { path: '/', query: { tour: props.tour.name }, hash: '#enquire' },
    color: 'neutral' as const,
    variant: 'outline' as const,
  },
  {
    label: 'All rides',
    to: '/#tours',
    color: 'neutral' as const,
    variant: 'link' as const,
  },
])
const facts = computed(() => [
  { title: 'From per person', description: `CHF ${props.tour.price}` },
  { title: 'Duration', description: props.tour.duration },
  { title: 'Distance', description: props.tour.distance },
  { title: 'Climbing', description: props.tour.elevation },
  { title: 'Difficulty', description: props.tour.difficulty },
])
</script>
