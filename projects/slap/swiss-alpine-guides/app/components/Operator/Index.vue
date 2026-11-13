<template><SlapOperatorActivities operator-name="Swiss Alpine Guides" :activities="activities" /></template>
<script setup lang="ts">
import type { OperatorActivity } from 'fireux-slap/runtime/types/operator-activity'
import { tours } from '~/content/tours'
const activities: OperatorActivity[] = tours.map(tour => ({
  id: tour.id, name: tour.name, category: tour.tag.includes('snowboard') ? 'Ski & snowboard' : 'Skiing',
  description: tour.description,
  facts: [{ label: 'Descent', value: tour.distance }, { label: 'Season', value: tour.season }, { label: 'Altitude', value: tour.altitude }, { label: 'Vertical', value: tour.vertical }, { label: 'Flights', value: String(tour.flights) }],
  requirements: [tour.requirement, 'Departure subject to snow and weather conditions.', 'IVBV mountain guide.'],
  price: 'Confirm with operator', reviewNeeded: true, source: tour.source,
  publicTo: `/?tour=${tour.id}#enquire`,
}))
</script>
