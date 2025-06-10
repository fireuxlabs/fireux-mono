<template>
  <UContainer class="env-check-container">
    <h3>Environment Check</h3>
    <div v-if="envData.isValid" class="success-message">
      ✅ All required environment variables are set. Your app is ready to go!
    </div>
    <div v-else class="error-message">
      🚫 Blocked: This app needs to be initialized.
      <p>
        ⚠️ Some required environment variables are missing. Please set them
        before creating an app.
      </p>
      <ul>
        <li v-for="missingVar in envData.missingVars" :key="missingVar">
          Missing: {{ missingVar }}
        </li>
      </ul>
      <p>After updating your credentials, restart your server:</p>
      <code>pnpm dev</code>
    </div>
  </UContainer>
</template>

<script setup>
const { data: envData } = await useFetch('/api/env-check')
console.log('Environment Check Data:', envData)
</script>
