<template>
  <section class="hero">
    <h1><strong class="font-black">Mise</strong> en place</h1>
    <h1><span class="highlight fade-in">Culinary Excellence</span></h1>
    <p class="hero-description">
      The complete platform for culinary professionals to manage recipes, 
      inventory, and kitchen operations with
      <span class="highlight">precision workflows</span> &amp;
      <span class="highlight">ingredient tracking</span>.
    </p>
    <ClientOnly>
      <div class="features-preview">
        <div class="feature-item">
          <UIcon name="i-lucide-chef-hat" class="feature-icon" />
          <span>Recipe Management</span>
        </div>
        <div class="feature-item">
          <UIcon name="i-lucide-package" class="feature-icon" />
          <span>Inventory Control</span>
        </div>
        <div class="feature-item">
          <UIcon name="i-lucide-users" class="feature-icon" />
          <span>Team Coordination</span>
        </div>
      </div>
    </ClientOnly>
    <div class="button-group">
      <UButton variant="solid" to="/getting-started" size="lg">Get Started</UButton>
      <UButton
        variant="outline"
        to="/dashboard"
        size="lg"
        trailing-icon="i-heroicons-arrow-right"
      >
        View Kitchen
      </UButton>
    </div>
  </section>
</template>

<script setup>
// No additional script needed for this component
</script>

<style scoped>
/* Mobile-first Styles for Hero Component */
.hero {
  text-align: left;
  padding: var(--space-8);
}

.hero h1 {
  font-size: var(--text-5xl);
  line-height: 1.2;
  font-weight: var(--font-weight-black);
}

.hero-description {
  font-size: var(--text-base);
  margin-top: var(--space-4);
  line-height: 1.6;
}

.highlight {
  color: var(--color-primary-500);
}

.features-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-8);
  justify-content: flex-start;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-gray-600);
}

.feature-icon {
  color: var(--color-primary-500);
  font-size: 1.2rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-8);
  width: 100%;
}

/* Larger Screen Overrides */
@media (min-width: 768px) {
  .button-group {
    flex-direction: row;
    width: auto;
  }
}

@media (min-width: 1024px) {
  .hero h1 {
    font-size: var(--text-7xl);
  }
  .hero-description {
    font-size: var(--text-xl);
  }
}
</style>
