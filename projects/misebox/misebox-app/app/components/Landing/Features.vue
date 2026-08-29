<template>
  <section class="landing-index-section">
    <div class="section-header">
      <h2 class="fx-type-section-title">
        Why Culinary Professionals Choose Misebox?
      </h2>
      <p class="fx-type-description">
        Built by chefs, for chefs who demand precision and efficiency
      </p>
    </div>
    <div class="grid">
      <div
        v-for="feature in filteredFeatures"
        :key="feature.key"
        class="feature"
      >
        <UIcon :name="feature.icon" class="feature-icon" />
        <div class="feature-content">
          <h3 class="fx-type-card-heading">{{ feature.title }}</h3>
          <p class="fx-type-body">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  first: Boolean,
  second: Boolean,
})

const allFeatures = [
  {
    key: 'recipes',
    icon: 'i-lucide-book-open',
    title: 'Digital Recipe Cards',
    description:
      'Organize recipes with detailed ingredients, steps, photos, and nutritional information.',
  },
  {
    key: 'scaling',
    icon: 'i-lucide-scaling',
    title: 'Recipe Scaling',
    description:
      'Automatically adjust ingredient quantities for different serving sizes and batch production.',
  },
  {
    key: 'costing',
    icon: 'i-lucide-dollar-sign',
    title: 'Food Cost Analysis',
    description:
      'Calculate exact food costs per portion and track profitability in real-time.',
  },
  {
    key: 'inventory',
    icon: 'i-lucide-package-check',
    title: 'Smart Inventory',
    description:
      'Track ingredients with automatic reorder alerts and supplier price comparison.',
  },
  {
    key: 'nutrition',
    icon: 'i-lucide-heart',
    title: 'Nutrition Tracking',
    description:
      'Calculate nutritional values and allergen information automatically.',
  },
  {
    key: 'suppliers',
    icon: 'i-lucide-truck',
    title: 'Supplier Management',
    description:
      'Manage vendor relationships, compare prices, and streamline ordering.',
  },
  {
    key: 'waste',
    icon: 'i-lucide-trash-2',
    title: 'Waste Tracking',
    description:
      'Monitor food waste patterns and identify cost-saving opportunities.',
  },
  {
    key: 'allergens',
    icon: 'i-lucide-alert-triangle',
    title: 'Allergen Control',
    description:
      'Track allergens and dietary restrictions across all recipes and ingredients.',
  },
  {
    key: 'mobile',
    icon: 'i-lucide-smartphone',
    title: 'Kitchen Tablets',
    description:
      'Access recipes and checklists on kitchen-friendly mobile devices.',
  },
  {
    key: 'reports',
    icon: 'i-lucide-bar-chart',
    title: 'Kitchen Analytics',
    description: 'Track kitchen performance, costs, and efficiency metrics.',
  },
  {
    key: 'compliance',
    icon: 'i-lucide-shield-check',
    title: 'Food Safety',
    description:
      'Maintain HACCP compliance with automated temperature logs and checklists.',
  },
]

const filteredFeatures = computed(() => {
  if (props.first) return allFeatures.slice(0, 6)
  if (props.second) return allFeatures.slice(6, 12)
  return allFeatures.slice(0, 6) // Default to first six if no props are provided
})
</script>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: calc(var(--spacing) * 8);
}

.section-header h2 {
  margin-bottom: calc(var(--spacing) * 3);
}

.section-header p {
  color: var(--color-gray-600);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing) * 6);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature {
  display: flex;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
  text-align: left;
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--color-gray-50);
  transition: background-color 0.2s ease;
}

.feature:hover {
  background: var(--color-gray-100);
}

.feature-icon {
  color: var(--color-primary-500);
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: var(--spacing);
}

.feature-content {
  width: 100%;
}

.feature-content h3 {
  margin-bottom: calc(var(--spacing) * 2);
}

.feature-content p {
  color: var(--color-gray-600);
}
</style>
