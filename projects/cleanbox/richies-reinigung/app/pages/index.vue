<template>
  <div class="app-dashboard">
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="app-title">
          <span class="brand-name">Richies Reinigung</span>
          <span class="app-subtitle">Professional Cleaning Services</span>
        </h1>

        <p class="app-description">
          Manage your cleaning operations, schedule services, and track client
          relationships.
        </p>

        <div class="quick-actions">
          <FireButton to="/cleaners" variant="primary" size="lg">
            <UIcon name="i-lucide-users" />
            Our Cleaners
          </FireButton>
          <FireButton to="/services" variant="outline" size="lg">
            <UIcon name="i-lucide-sparkles" />
            Our Services
          </FireButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Richies Reinigung - Professional Cleaning Services',
  description:
    'Professional cleaning services with German precision and reliability.',
})

definePageMeta({
  layout: 'default',
})
</script>

<style scoped>
.app-dashboard {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.welcome-section {
  text-align: center;
  max-width: 600px;
}

.app-title {
  margin-bottom: var(--space-6);
}

.brand-name {
  display: block;
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary-600);
  margin-bottom: var(--space-2);
}

.app-subtitle {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.app-description {
  font-size: var(--text-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 640px) {
  .quick-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
