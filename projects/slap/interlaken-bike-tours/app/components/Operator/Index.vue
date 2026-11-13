<template><SlapOperatorActivities operator-name="Interlaken Bike Tours" :activities="activities" /></template>
<script setup lang="ts">
import type { OperatorActivity } from 'fireux-slap/runtime/types/operator-activity'
import { tours } from '~/content/tours'
const activities: OperatorActivity[] = tours.map(tour => ({
  id: tour.slug, name: tour.name, category: 'Bike tour', description: tour.description,
  facts: [{ label: 'Duration', value: tour.duration }, { label: 'Distance', value: tour.distance }, { label: 'Difficulty', value: tour.difficulty }, { label: 'Elevation', value: tour.elevation }],
  requirements: [...tour.included], price: `CHF ${tour.price} per person`, reviewNeeded: false,
  source: tour.source, publicTo: `/tours/${tour.slug}`,
}))
</script>
