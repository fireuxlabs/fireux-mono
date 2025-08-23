<template>
  <div class="app-debug-page">
    <UCard>
      <template #header>
        <h1>🔍 App Inspector</h1>
      </template>

      <div class="app-info">
        <h2>Application Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>App Name:</strong>
            <span>{{ appName || 'Unknown App' }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
// Get app information
const { $app } = useNuxtApp()
const app = await useApp()

// Determine app name from various sources
const appName = computed(() => {
  // Try multiple sources to get the app name
  return (
    app?.name ||
    app?.id ||
    $app?.$config?.app?.name ||
    process.env.NUXT_APP_NAME ||
    'FireUX App'
  )
})
</script>

<style scoped>
.app-debug-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.info-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--ui-bg-elevated);
  border-radius: var(--ui-radius);
  border: 1px solid var(--ui-border);
}

.info-item strong {
  color: var(--ui-text-highlighted);
}
</style>
