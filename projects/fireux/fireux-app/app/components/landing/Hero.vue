<template>
  <section class="hero">
    <h1><strong class="font-black">Ignite</strong> with</h1>
    <h1><span class="highlight fade-in">Powerful Applications</span></h1>
    <p class="hero-description">
      A low-code ecosystem for responsive, scalable, and data-driven
      applications built upon
      <span class="highlight">Nuxt4</span> &amp;
      <span class="highlight">Firebase</span>.
    </p>
    <ClientOnly>
      <div class="fuel-logos">
        <div v-for="(logo, key) in logos" :key="key" class="fuel-item">
          <img :src="isDark ? logo.dark : logo.light" :alt="`${key} Logo`" />
        </div>
      </div>
    </ClientOnly>
    <div class="button-group">
      <UButton variant="solid" to="/getting-started">Get Started</UButton>
      <UButton
        variant="outline"
        to="https://fireux.app/projects"
        trailing-icon="i-heroicons-arrow-right"
      >
        Explore Projects
      </UButton>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const logos = {
  nuxt: { light: '/img/nuxt-black.png', dark: '/img/nuxt-white.png' },
  firebase: {
    light: '/img/firebase-black.png',
    dark: '/img/firebase-white.png',
  },
}
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

/* Ensure fuel logos and CTA buttons are full-width (flush with hero text) on mobile */
.fuel-logos,
.button-group {
  justify-content: flex-start;
  margin-top: var(--space-10);
}

/* Larger Screen Overrides */
@media (min-width: 1024px) {
  .hero h1 {
    font-size: var(--text-7xl);
  }
  .hero-description {
    font-size: var(--text-xl);
  }
  /* Left-align fuel logos and CTA buttons on larger screens */
  .fuel-logos,
  .button-group {
    justify-content: flex-start;
  }
}
</style>
