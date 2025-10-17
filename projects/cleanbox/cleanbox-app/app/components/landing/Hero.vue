<template>
  <section class="hero">
    <h1>
      <strong>{{ hero.verb }}</strong>
    </h1>
    <h1 class="highlight">{{ hero.subheadline }}</h1>
    <h2 class="tagline">{{ hero.tagline }}</h2>
    <p class="hero-description">{{ hero.description }}</p>

    <div class="button-group">
      <UButton variant="solid" size="lg" :to="hero.primary.to">
        {{ hero.primary.label }}
      </UButton>
      <UButton
        variant="outline"
        size="lg"
        :to="hero.secondary.to"
        trailing-icon="i-heroicons-arrow-right"
      >
        {{ hero.secondary.label }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const hero = {
  verb: 'Bling',
  subheadline: 'with CleanBox',
  tagline: 'Shine Smarter.',
  description:
    'The all-in-one cleaning business suite for scheduling, team coordination, and client management — clean, simple, powerful.',
  primary: { label: 'Get Started', to: '/auth' },
  secondary: { label: 'See Services', to: '/services' },
}
</script>

<style scoped>
.hero {
  text-align: left;
  padding: var(--space-12) var(--space-8);
}

h1 {
  line-height: 1.1;
  font-weight: var(--font-weight-black);
}

h1 strong {
  font-size: clamp(3rem, 6vw, 6rem);
}

.highlight {
  font-size: clamp(2rem, 5vw, 4rem);
  color: var(--color-primary-600);
  display: block;
}

.tagline {
  font-size: clamp(1.25rem, 2vw, 2rem);
  color: var(--color-gray-600);
  margin-top: var(--space-2);
}

.hero-description {
  margin-top: var(--space-6);
  font-size: var(--text-base);
  line-height: 1.6;
  max-width: 50ch;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-8);
}

@media (min-width: 768px) {
  .button-group {
    flex-direction: row;
  }
}
</style>
