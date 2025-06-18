<template>
  <CoreDefault :extras="jobRoutes" />
</template>

<script setup>
import { getJobRoutes } from 'fireux-jobs/dist/runtime/composables/useJobRoutes'

const jobRoutes = getJobRoutes()
</script>
