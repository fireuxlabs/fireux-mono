<template>
  <section>
    <div class="grid">
      <div
        v-for="feature in filteredFeatures"
        :key="feature.key"
        class="feature"
      >
        <UIcon :name="feature.icon" class="size-8" />
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
  second: Boolean
})

const allFeatures = [
  {
    key: 'pwa',
    icon: 'i-lucide-smartphone',
    title: 'PWA First',
    description:
      'A fully installable app with notifications, no app store, no updates.'
  },
  {
    key: 'templates',
    icon: 'i-lucide-square-dashed',
    title: 'Pre-Built Templates',
    description:
      'Customizable, low-code UI kits with built-in data integrations.'
  },
  {
    key: 'saas',
    icon: 'i-lucide-cloud',
    title: 'SaaS Solutions',
    description:
      'Fully managed, subscription-based applications built for scale.'
  },
  {
    key: 'whitelabel',
    icon: 'i-lucide-layers-2',
    title: 'White-Label Products',
    description:
      'Your branded software bundles, ready for duplication and resale.'
  },
  {
    key: 'low-code',
    icon: 'i-lucide-code',
    title: 'Low-Code System',
    description:
      'FIReUX enables rapid development with reusable components and automation.'
  },
  {
    key: 'dashboard',
    icon: 'i-lucide-layout-dashboard',
    title: 'Dashboard Driven',
    description:
      'Structured, data-driven layouts optimized for control and clarity.'
  },
  {
    key: 'security',
    icon: 'i-lucide-lock',
    title: 'Authentication & Payments',
    description: 'Google Auth & Stripe for frictionless logins & transactions.'
  },
  {
    key: 'cookie-free',
    icon: 'material-symbols-light:cookie-off-outline-rounded',
    title: 'Zero Cookies',
    description:
      'No landing popups, no hidden storage or trackers. A user-first experience.'
  },
  {
    key: 'automation',
    icon: 'i-lucide-zap',
    title: 'Automated Workflows',
    description:
      'Trigger real-time actions & integrations with zero manual effort.'
  },
  {
    key: 'analytics',
    icon: 'i-lucide-bar-chart',
    title: 'Advanced Analytics',
    description: 'Track & optimize with real-time insights.'
  },
  {
    key: 'security-first',
    icon: 'i-lucide-shield',
    title: 'Security First',
    description: 'Built-in security & compliance without extra effort.'
  },
  {
    key: 'performance',
    icon: 'i-lucide-rocket',
    title: 'Blazing Fast',
    description:
      'Optimized for speed—lightweight, no bloat, and instant load times.'
  }
]

const filteredFeatures = computed(() => {
  if (props.first) return allFeatures.slice(0, 6)
  if (props.second) return allFeatures.slice(6, 12)
  return allFeatures.slice(0, 6) // Default to first six if no props are provided
})
</script>

<style scoped>
.grid {
  gap: var(--space-4);
}
.feature {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-1);
  text-align: left;
  width: 100%;
}
.feature-content {
  width: 100%;
}

</style>
