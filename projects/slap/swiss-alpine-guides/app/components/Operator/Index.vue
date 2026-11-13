<template><SlapOperatorActivities operator-name="Swiss Alpine Guides" :activities="activities" /></template>
<script setup lang="ts">
import type { OperatorActivity } from 'fireux-slap/runtime/types/operator-activity'
import { tours } from '~/content/tours'
import { activities as catalogue } from '~/content/activities'
const heliActivities: OperatorActivity[] = tours.map(tour => ({
  id: tour.id, name: tour.name, category: tour.tag.includes('snowboard') ? 'Ski & snowboard' : 'Skiing',
  description: tour.description,
  facts: [{ label: 'Descent', value: tour.distance }, { label: 'Season', value: tour.season }, { label: 'Altitude', value: tour.altitude }, { label: 'Vertical', value: tour.vertical }, { label: 'Flights', value: String(tour.flights) }],
  requirements: [tour.requirement, 'Departure subject to snow and weather conditions.', 'IVBV mountain guide.'],
  price: 'Confirm with operator', reviewNeeded: true, source: tour.source,
  publicTo: `/contact?tour=${tour.id}#enquire`,
}))
const activities: OperatorActivity[] = [...catalogue.filter(item => !item.heliski).map(item => ({ id: item.slug, name: item.name, category: item.seasons.join(' / '), description: item.summary, facts: item.programs[0]?.facts.slice(0, 4) ?? [], requirements: [item.note || 'Confirm dates, suitability, current price and equipment with the operator.'], price: 'Confirm with operator', reviewNeeded: true, source: item.source, publicTo: item.path })), ...heliActivities]
</script>
