<template>
  <UContainer class="env-check-container">
    <h3>Environment Check</h3>
    <ul v-if="envData">
      <li v-for="(value, key) in envData.requiredVars" :key="key">
        <span :style="{ color: value ? 'var(--success)' : 'var(--danger)' }">
          {{ value ? '✅' : '❌' }}
        </span>
        <strong>{{ key }}</strong>
        <span v-if="!value" class="hint"> – Please set this in your .env file.</span>
      </li>
    </ul>
    <p v-else class="error-message">⚠️ Failed to load environment variables.</p>
  </UContainer>
</template>

<script setup>
const { data: envData } = await useFetch('/api/env-check', { server: false })
</script>