<template>
  <section class="features" :class="{ 'features--first': first }">
    <header>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </header>

    <ul class="features__list">
      <li v-for="feature in resolvedFeatures" :key="feature.title">
        <div class="features__icon">
          <UIcon :name="feature.icon" />
        </div>
        <div>
          <p class="features__title">{{ feature.title }}</p>
          <p class="features__copy">{{ feature.copy }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    first?: boolean
    features?: Array<{
      icon?: string
      title: string
      copy: string
    }>
  }>(),
  {
    first: false,
  }
)

const title = 'What comes next'
const description = 'Core building blocks you can keep simple or expand later.'
const resolvedFeatures = computed(() =>
  (props.features || [
    {
      icon: 'i-lucide-cog',
      title: 'Runtime setup',
      copy: 'Shared app config, auth wiring, and console visibility.',
    },
    {
      icon: 'i-lucide-shield-check',
      title: 'Operator clarity',
      copy: 'Keep users oriented with light public pages and stronger consoles.',
    },
    {
      icon: 'i-lucide-layers',
      title: 'Composable surfaces',
      copy: 'Swap in richer app-specific content only when it earns its place.',
    },
  ]).map((feature) => ({
    icon: feature.icon || 'i-lucide-sparkles',
    title: feature.title,
    copy: feature.copy,
  }))
)
</script>

<style scoped>
.features {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 12)) 0;
}

.features--first {
  border-top: 1px solid var(--ui-border-muted);
  padding-top: clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 16));
}

.features header h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
}

.features header p {
  color: var(--ui-text-muted);
}

.features__list {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

@media (min-width: 768px) {
  .features__list {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

.features__list li {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: flex-start;
  border: 1px solid var(--ui-border-muted);
  border-radius: calc(var(--ui-radius) * 3);
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg);
}

.features__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.features__title {
  font-weight: 600;
}

.features__copy {
  color: var(--ui-text-muted);
  font-size: 0.95rem;
}
</style>
