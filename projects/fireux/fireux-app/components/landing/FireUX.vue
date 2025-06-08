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
  second: Boolean,
})

const allFeatures = [
  {
    key: 'pwa',
    icon: 'i-lucide-smartphone',
    title: 'PWA First',
    description:
      'A fully installable app with notifications, no app store, no updates.',
  },
  {
    key: 'templates',
    icon: 'i-lucide-square-dashed',
    title: 'Pre-Built Templates',
    description:
      'Customizable, low-code UI kits with built-in data integrations.',
  },
  {
    key: 'saas',
    icon: 'i-lucide-cloud',
    title: 'SaaS Solutions',
    description:
      'Fully managed, subscription-based applications built for scale.',
  },
  {
    key: 'whitelabel',
    icon: 'i-lucide-layers-2',
    title: 'White Label',
    description:
      'Easily customizable, ready-to-deploy solutions for your brand.',
  },
]

const filteredFeatures = computed(() => {
  return allFeatures.filter((feature) => {
    if (props.first) return feature.key === 'pwa'
    if (props.second) return feature.key === 'templates'
    return true
  })
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.feature {
  text-align: center;
}

.feature-content {
  margin-top: 0.5rem;
}
</style>
