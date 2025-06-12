<!-- Playground app index page -->
<template>
  <div class="playground-page">
    <div class="playground-content">
      <h1 class="playground-title">🛝 Playground</h1>
      <p class="playground-subtitle">
        Welcome to the FireUX Playground - test and experiment with components
      </p>

      <div class="playground-actions">
        <UButton to="/dashboard" color="red" variant="solid" size="lg">
          Go to Dashboard
        </UButton>
        <UButton to="/auth" color="red" variant="outline" size="lg">
          Authentication
        </UButton>
      </div>

      <div class="playground-info">
        <UCard>
          <template #default>
            <h2>About Playground</h2>
            <p>
              This is a testing environment for FireUX components and features.
              Use this space to experiment with different configurations and
              components without affecting production apps.
            </p>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page metadata
useHead({
  title: 'Playground - FireUX',
  meta: [
    {
      name: 'description',
      content:
        'FireUX Playground - test and experiment with components and features.',
    },
  ],
})

definePageMeta({
  layout: 'default',
  title: 'Playground',
  icon: 'i-lucide-gamepad-2',
})
</script>

<style scoped>
.playground-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.playground-content {
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.playground-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.1;
}

.playground-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
}

.playground-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.playground-info {
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .playground-title {
    font-size: 2.5rem;
  }

  .playground-subtitle {
    font-size: 1rem;
  }

  .playground-actions {
    flex-direction: column;
    align-items: center;
  }

  .playground-page {
    padding: var(--space-4);
  }
}
</style>
