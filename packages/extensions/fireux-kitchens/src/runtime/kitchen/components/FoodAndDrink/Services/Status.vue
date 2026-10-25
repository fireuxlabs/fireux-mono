<template>
  <FireStateCard
    v-if="['pending', 'idle'].includes(source.outcome.value)"
    entity="Kitchen services"
    loading
  />
  <FireStateCard
    v-else-if="source.outcome.value === 'error'"
    entity="Kitchen services"
    state="error"
    :description="String(source.error.value || 'Services could not be loaded.')"
  />
  <UAlert
    v-else-if="!retained"
    title="Choose a Kitchen to configure services"
  />
</template>
<script setup lang="ts">
import { useKitchenServicesContext } from '../../../composables/offerings/useKitchenServicesContext'
const { source, retained } = useKitchenServicesContext()
</script>
