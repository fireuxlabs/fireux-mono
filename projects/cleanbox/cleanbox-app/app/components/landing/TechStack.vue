<!-- COMMENT: app/components/landing/TechStack.vue -->
<template>
  <section class="px-4">
    <div class="tech-stack-container">
      <h2 class="fx-type-section-title section-title">Powered By Industry-Leading Technology</h2>
      <p class="fx-type-description section-subtitle">
        Built with reliable, scalable technology stack for cleaning businesses
      </p>

      <div class="tech-grid">
        <div v-for="(tech, key) in techStack" :key="key" class="tech-item">
          <img :src="tech.logo" :alt="tech.name + ' Logo'" class="tech-logo" />
          <h3 class="fx-type-card-title tech-name text-xl">{{ tech.name }}</h3>
          <p class="fx-type-body tech-description">{{ tech.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const techStack = {
  scheduling: {
    name: 'Smart Scheduling',
    logo: '/img/stack/scheduling.svg',
    description:
      'AI-powered route optimization and automated booking management',
  },
  payments: {
    name: 'Secure Payments',
    logo: '/img/stack/stripe-black.png',
    description: 'Integrated payment processing with automated invoicing',
  },
  mobile: {
    name: 'Mobile-First',
    logo: '/img/stack/mobile.svg',
    description: 'Progressive web app accessible on any device, anywhere',
  },
  analytics: {
    name: 'Business Analytics',
    logo: '/img/stack/analytics.svg',
    description: 'Real-time insights into your cleaning business performance',
  },
}
</script>

<style scoped>
.tech-stack-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: calc(var(--spacing) * 8) 0;
}

.section-title {
  margin-bottom: calc(var(--spacing) * 4);
}

.section-subtitle {
  margin-bottom: calc(var(--spacing) * 12);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: calc(var(--spacing) * 8);
  padding: calc(var(--spacing) * 4);
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(var(--spacing) * 8);
  border-radius: calc(var(--ui-radius) * 3);
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-4px);
}

.tech-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: calc(var(--spacing) * 4);
}

.tech-name {
  margin-bottom: calc(var(--spacing) * 2);
}

.tech-description {
  text-align: center;
}
</style>
