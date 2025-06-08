<template>
  <UCard v-if="devMode">
    <h1>Debug Information</h1>
    <pre>In DevMode {{ devMode }}</pre>
    <pre>Tenant ID: {{ tenantId }}</pre>
  </UCard>
</template>

<script setup>
import { useFireUXConfig } from '../../composables/FireUXConfig'

const { devMode, tenantId } = useFireUXConfig()
</script>

<style scoped>
/* Removed styles as the UX system now provides styling */
</style>
