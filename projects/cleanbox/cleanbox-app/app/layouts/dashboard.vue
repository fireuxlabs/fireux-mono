<template>
  <CoreDashboard :extras="jobRoutes" />
</template>

<script setup>
import { getJobRoutes } from 'fireux-jobs/composables'

const jobRoutes = getJobRoutes()
</script>
