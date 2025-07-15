<template>
  <section>
    <div class="section-header">
      <h2>Why Choose CleanBox?</h2>
      <p>
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
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
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
  margin-bottom: var(--space-8);
}

.section-header h2 {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin-bottom: var(--space-3);
}

.section-header p {
  font-size: var(--text-lg);
  color: var(--color-gray-600);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
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
  gap: var(--space-4);
  padding: var(--space-4);
  text-align: left;
  border-radius: var(--radius-lg);
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
  margin-top: var(--space-1);
}

.feature-content {
  width: 100%;
}

.feature-content h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.feature-content p {
  color: var(--color-gray-600);
  line-height: 1.5;
}
</style>
