<template>
  <div class="app-dashboard">
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="app-title">
          <span class="brand-name">Niederhorn</span>
          <span class="app-subtitle">Kitchen Management</span>
        </h1>

        <p class="app-description">
          Manage your ingredients, suppliers, and culinary operations with
          precision.
        </p>

        <div class="quick-actions">
          <UButton to="/ingredients" variant="solid" size="lg">
            <UIcon name="i-lucide-package" />
            Manage Ingredients
          </UButton>
          <UButton to="/suppliers" variant="outline" size="lg">
            <UIcon name="i-lucide-truck" />
            Manage Suppliers
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Niederhorn - Kitchen Management',
  description: 'Manage ingredients, suppliers, and culinary operations.',
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
