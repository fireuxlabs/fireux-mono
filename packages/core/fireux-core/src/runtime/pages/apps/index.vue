<template>
  <div class="test-page">
    <div class="test-header">
      <h1>Apps Collection Test</h1>
      <p>Testing useApp with unified useFirestoreRead</p>
    </div>

    <div class="test-content">
      <div v-if="appsLoading" class="loading">Loading apps...</div>

      <div v-else-if="apps && apps.length > 0" class="apps-list">
        <h2>Apps Found: {{ apps.length }}</h2>
        <div v-for="app in apps" :key="app.id" class="app-item">
          <h3>{{ app.name || 'Unnamed App' }}</h3>
          <p>ID: {{ app.id }}</p>
          <p v-if="app.description">{{ app.description }}</p>
        </div>
      </div>

      <div v-else class="no-apps">
        <p>No apps found in collection</p>
      </div>

      <div class="debug-info">
        <h3>Debug Info:</h3>
        <p>Apps loading: {{ appsLoading }}</p>
        <p>Apps count: {{ apps?.length || 0 }}</p>
        <p>Apps data: {{ !!apps }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { apps, appsLoading } = useApp()

// Set page meta
definePageMeta({
  title: 'Apps Test',
  description: 'Testing apps collection with unified useFirestoreRead',
})
</script>

<style scoped>
.test-page {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 2rem;
}

.test-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.test-header p {
  color: #6b7280;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.apps-list h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.app-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
}

.app-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.app-item p {
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.no-apps {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.debug-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.debug-info p {
  color: #6b7280;
  font-family: monospace;
  font-size: 0.875rem;
}
</style>
