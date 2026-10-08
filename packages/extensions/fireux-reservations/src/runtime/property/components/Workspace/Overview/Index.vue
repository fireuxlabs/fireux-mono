<template>
  <PropertyOverview>
    <template #capabilities><ReservationsSummary /></template>
  </PropertyOverview>
</template>
<script setup lang="ts">
import PropertyOverview from 'fireux-properties/runtime/property/components/Workspace/Overview/Index.vue'
import ReservationsSummary from './Reservations.vue'
</script>
