<template>
  <div>
    <h1>Debug Component</h1>
    <pre v-if="devMode">In DevMode: {{ devMode }}</pre>
    <pre v-if="tenantId">Tenant ID: {{ tenantId }}</pre>
  </div>
</template>

<script setup>
// Simple debug component for the Misebox app
// Based on FireUX Core's Debug component
import { useRuntimeConfig } from 'nuxt/app'

const config = useRuntimeConfig().public
const devMode = config.nodeEnv === 'development' || true
const tenantId = config.tenantId || 'misebox'
</script>

<style scoped>
div {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

pre {
  font-family: monospace;
  background-color: #eaeaea;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}
</style>
