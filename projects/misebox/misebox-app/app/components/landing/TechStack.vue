<!-- COMMENT: app/components/landing/TechStack.vue -->
<template>
  <section class="px-4">
    <div class="tech-stack-container">
      <h2 class="section-title">Culinary Technology Excellence</h2>
      <p class="section-subtitle">
        Professional-grade technology stack designed for modern kitchens
      </p>

      <div class="tech-grid">
        <div v-for="(tech, key) in techStack" :key="key" class="tech-item">
          <img :src="tech.logo" :alt="tech.name + ' Logo'" class="tech-logo" />
          <h3 class="tech-name">{{ tech.name }}</h3>
          <p class="tech-description">{{ tech.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const techStack = {
  recipes: {
    name: 'Digital Recipe Management',
    logo: '/img/recipe-management.svg',
    description:
      'Version-controlled recipes with scaling and nutritional analysis',
  },
  inventory: {
    name: 'Smart Inventory',
    logo: '/img/inventory-system.svg',
    description: 'Real-time ingredient tracking with automated ordering',
  },
  analytics: {
    name: 'Kitchen Analytics',
    logo: '/img/kitchen-analytics.svg',
    description: 'Cost analysis, waste tracking, and performance metrics',
  },
  integration: {
    name: 'POS Integration',
    logo: '/img/pos-integration.svg',
    description: 'Seamless connection with restaurant management systems',
  },
}
</script>

<style scoped>
.tech-stack-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem 0;
}

.section-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-4px);
}

.tech-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.tech-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tech-description {
  line-height: 1.5;
  text-align: center;
}
</style>
