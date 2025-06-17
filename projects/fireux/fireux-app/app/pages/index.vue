<script setup lang="ts">
// Fetch the content for the index page
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<template>
  <div class="page">
    <FireLogoBrand size="hero" />
    <div v-if="page" class="content">
      <ContentRenderer :value="page" />
    </div>
    <div v-else class="loading">
      <p>Loading content...</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 50vh;
  padding: var(--space-8);
}

.content {
  max-width: 800px;
  margin-top: var(--space-6);
  text-align: left;
}

.content h1 {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary-500);
  text-align: center;
  margin-bottom: var(--space-6);
}

.content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  color: var(--color-primary-600);
}

.content p {
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.content ul {
  margin-bottom: var(--space-4);
  padding-left: var(--space-6);
}

.content li {
  margin-bottom: var(--space-2);
  line-height: 1.6;
}

.loading {
  margin-top: var(--space-6);
}
</style>
