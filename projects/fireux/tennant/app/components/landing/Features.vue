<template>
  <section class="features" :class="{ 'features--first': first }">
    <header>
      <h2>FireUX core at a glance</h2>
      <p>Toggle features on per tenant as you evolve the sandbox.</p>
    </header>

    <ul class="features__list">
      <li v-for="feature in featureList" :key="feature.title">
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
const props = withDefaults(
  defineProps<{
    first?: boolean
  }>(),
  {
    first: false,
  }
)

const featureList = [
  {
    icon: 'i-lucide-cog',
    title: 'Runtime config',
    copy: 'Inject dev pins, service accounts, and branding per tenant.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Secure onboarding',
    copy: 'Gate dashboards behind developer pins and env validation.',
  },
  {
    icon: 'i-lucide-layers',
    title: 'Composable UI',
    copy: 'Use FireUX atomics or swap in bespoke tenant components.',
  },
]

defineOptions({ name: 'TenantLandingFeatures' })
</script>

<style scoped>
.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: clamp(2rem, 6vw, 3rem) 0;
}

.features--first {
  border-top: 1px solid var(--ui-border-subtle);
  padding-top: clamp(3rem, 7vw, 4rem);
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
  gap: 1rem;
}

@media (min-width: 768px) {
  .features__list {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

.features__list li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid var(--ui-border-subtle);
  border-radius: var(--radius-xl);
  padding: 1rem;
  background: var(--ui-surface);
}

.features__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
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
