<template>
  <section class="hero">
    <h1><strong class="font-black">Clean</strong> with</h1>
    <h1><span class="highlight fade-in">Professional Solutions</span></h1>
    <p class="hero-description">
      The complete platform for cleaning professionals to manage bookings, track
      services, and grow their business with
      <span class="highlight">automated workflows</span> &amp;
      <span class="highlight">client management</span>.
    </p>
    <ClientOnly>
      <div class="features-preview">
        <div class="feature-item">
          <UIcon name="i-lucide-calendar" class="feature-icon" />
          <span>Smart Scheduling</span>
        </div>
        <div class="feature-item">
          <UIcon name="i-lucide-users" class="feature-icon" />
          <span>Client Management</span>
        </div>
        <div class="feature-item">
          <UIcon name="i-lucide-credit-card" class="feature-icon" />
          <span>Easy Payments</span>
        </div>
      </div>
    </ClientOnly>
    <div class="button-group">
      <UButton variant="solid" to="/getting-started" size="lg"
        >Get Started</UButton
      >
      <UButton
        variant="outline"
        to="/dashboard"
        size="lg"
        trailing-icon="i-heroicons-arrow-right"
      >
        View Dashboard
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
