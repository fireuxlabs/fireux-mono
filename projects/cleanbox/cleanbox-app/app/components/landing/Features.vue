<template>
  <section class="landing-index-section">
    <div class="section-header">
      <h2 class="fx-type-section-title">Why Choose CleanBox?</h2>
      <p class="fx-type-description">
        Built specifically for cleaning professionals who want to grow their
        business
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
    key: 'scheduling',
    icon: 'i-lucide-calendar-days',
    title: 'Smart Scheduling',
    description:
      'Automated booking system with calendar sync and reminder notifications.',
  },
  {
    key: 'payments',
    icon: 'i-lucide-credit-card',
    title: 'Secure Payments',
    description:
      'Integrated Stripe payments with automatic invoicing and recurring billing.',
  },
  {
    key: 'mobile',
    icon: 'i-lucide-smartphone',
    title: 'Mobile First',
    description:
      'Manage your business on-the-go with our responsive mobile app.',
  },
  {
    key: 'clients',
    icon: 'i-lucide-user-check',
    title: 'Client Management',
    description:
      'Keep detailed client profiles, service history, and preferences.',
  },
  {
    key: 'team',
    icon: 'i-lucide-users',
    title: 'Team Coordination',
    description:
      'Assign jobs, track hours, and manage your cleaning crew efficiently.',
  },
  {
    key: 'quotes',
    icon: 'i-lucide-calculator',
    title: 'Instant Quotes',
    description: 'Generate professional quotes and estimates in minutes.',
  },
  {
    key: 'routes',
    icon: 'i-lucide-map-pin',
    title: 'Route Optimization',
    description: 'Plan efficient routes and reduce travel time between jobs.',
  },
  {
    key: 'supplies',
    icon: 'i-lucide-package',
    title: 'Supply Tracking',
    description:
      'Monitor cleaning supplies and get alerts when inventory is low.',
  },
  {
    key: 'reports',
    icon: 'i-lucide-trending-up',
    title: 'Business Analytics',
    description:
      'Track revenue, client satisfaction, and business growth metrics.',
  },
  {
    key: 'reviews',
    icon: 'i-lucide-star',
    title: 'Review Management',
    description:
      'Collect and manage customer reviews to build your reputation.',
  },
  {
    key: 'support',
    icon: 'i-lucide-headphones',
    title: '24/7 Support',
    description: 'Get help when you need it with our dedicated support team.',
  },
  {
    key: 'integration',
    icon: 'i-lucide-plug',
    title: 'Integrations',
    description:
      'Connect with QuickBooks, Google Calendar, and other business tools.',
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
